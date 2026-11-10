// ============================================================================
// وحدة التخزين الدائم وإدارة الصور — مشروع مطبخ العزيزية المركزي (مبنى 52)
// توفر:
// 1. إدارة الصور الفعلية في IndexedDB عبر مراجع خفيفة (idb:key).
// 2. عدم حفظ الرسوم التوضيحية المولدة (SVG) نهائياً لتوفير المساحة وإعادة توليدها عند التحميل.
// 3. ترحيل تلقائي لبيانات localStorage (v4) مع الاحتفاظ بنسخة احتياطية.
// 4. طلب تخزين دائم navigator.storage.persist().
// 5. حساب وعرض المساحة التخزينية المستخدمة.
// 6. دعم تصدير واستيراد JSON شامل بكافة الصور مع التحقق من صحة البنية.
// ============================================================================

window.KitchenStorage = (function () {
  "use strict";

  const DB_NAME = "KitchenB52_DB";
  const DB_VERSION = 1;
  const STORE_IMAGES = "images";
  const STORE_META = "meta";

  const V4_KEY = "kitchen_b52_presentation_data_v4";
  const MIGRATED_FLAG = "kitchen_b52_migrated_v5";
  const META_DATA_KEY = "app_data_v5";

  let db = null;
  let useFallbackMemory = false;
  const memoryImageStore = new Map();

  // --------------------------------------------------------------------------
  // 1. فتح قاعدة البيانات وتهيئة التخزين
  // --------------------------------------------------------------------------
  function openDatabase() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        useFallbackMemory = true;
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = function (e) {
          const d = e.target.result;
          if (!d.objectStoreNames.contains(STORE_IMAGES)) {
            d.createObjectStore(STORE_IMAGES, { keyPath: "id" });
          }
          if (!d.objectStoreNames.contains(STORE_META)) {
            d.createObjectStore(STORE_META, { keyPath: "key" });
          }
        };
        req.onsuccess = function (e) {
          db = e.target.result;
          resolve(db);
        };
        req.onerror = function (err) {
          console.warn("IndexedDB open failed, using fallback:", err);
          useFallbackMemory = true;
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB access blocked:", err);
        useFallbackMemory = true;
        resolve(null);
      }
    });
  }

  async function init() {
    await openDatabase();
    requestPersist();
    return !useFallbackMemory;
  }

  function isAvailable() {
    return !useFallbackMemory && db !== null;
  }

  function isGenerated(url) {
    return typeof url === "string" && (url.indexOf("data:image/svg") === 0 || url === "@generated");
  }

  function isActualCustomDataUrl(url) {
    return typeof url === "string" && url.indexOf("data:image/") === 0 && !isGenerated(url);
  }

  // --------------------------------------------------------------------------
  // 2. إدارة الصور الفردية في IndexedDB
  // --------------------------------------------------------------------------
  function putImage(id, dataUrl) {
    return new Promise(function (resolve) {
      if (!id || !dataUrl) { resolve(false); return; }
      if (!isAvailable()) {
        memoryImageStore.set(id, dataUrl);
        resolve(true);
        return;
      }
      try {
        const tx = db.transaction([STORE_IMAGES], "readwrite");
        const store = tx.objectStore(STORE_IMAGES);
        store.put({ id: id, dataUrl: dataUrl, updatedAt: Date.now() });
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () {
          memoryImageStore.set(id, dataUrl);
          resolve(false);
        };
      } catch (e) {
        memoryImageStore.set(id, dataUrl);
        resolve(false);
      }
    });
  }

  function getImage(id) {
    return new Promise(function (resolve) {
      if (!id) { resolve(null); return; }
      if (memoryImageStore.has(id)) {
        resolve(memoryImageStore.get(id));
        return;
      }
      if (!isAvailable()) { resolve(null); return; }
      try {
        const tx = db.transaction([STORE_IMAGES], "readonly");
        const store = tx.objectStore(STORE_IMAGES);
        const req = store.get(id);
        req.onsuccess = function () {
          const res = req.result;
          resolve(res ? res.dataUrl : null);
        };
        req.onerror = function () { resolve(null); };
      } catch (e) {
        resolve(null);
      }
    });
  }

  function deleteImage(id) {
    return new Promise(function (resolve) {
      if (!id) { resolve(true); return; }
      memoryImageStore.delete(id);
      if (!isAvailable()) { resolve(true); return; }
      try {
        const tx = db.transaction([STORE_IMAGES], "readwrite");
        const store = tx.objectStore(STORE_IMAGES);
        store.delete(id);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      } catch (e) {
        resolve(false);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. فصل وتجريد البيانات: نقل الصور لـ IDB واستبعاد SVG المولد
  // --------------------------------------------------------------------------
  async function stripAndStoreImages(dataObj) {
    const copy = JSON.parse(JSON.stringify(dataObj));
    const info = copy.projectInfo || {};

    // 1. صور الواجهة
    if (Array.isArray(info.exteriorImages)) {
      for (let i = 0; i < info.exteriorImages.length; i++) {
        const img = info.exteriorImages[i];
        if (isActualCustomDataUrl(img.url)) {
          const imgId = img.id || ("ext-" + Date.now() + "-" + i);
          img.id = imgId;
          await putImage(imgId, img.url);
          img.url = "idb:" + imgId;
        }
      }
      if (info.exteriorImages[0]) {
        info.exteriorImage = info.exteriorImages[0].url;
      }
    }

    // 2. صورة المخطط الهندسي
    if (isActualCustomDataUrl(info.evacuationImage)) {
      const evacId = "evac-plan-custom";
      await putImage(evacId, info.evacuationImage);
      info.evacuationImage = "idb:" + evacId;
    }

    // 3. صور الغرف والأصول والموظفين
    if (Array.isArray(copy.rooms)) {
      for (let r = 0; r < copy.rooms.length; r++) {
        const room = copy.rooms[r];

        // صور الغرفة
        if (Array.isArray(room.images)) {
          for (let m = 0; m < room.images.length; m++) {
            const item = room.images[m];
            if (isGenerated(item.url)) {
              item.url = "@generated";
            } else if (isActualCustomDataUrl(item.url)) {
              const rImgId = item.id || ("rm-custom-" + room.id + "-" + m);
              item.id = rImgId;
              await putImage(rImgId, item.url);
              item.url = "idb:" + rImgId;
            }
          }
          if (room.images[0]) {
            room.image = room.images[0].url;
          }
        }

        // أصول الغرفة
        if (Array.isArray(room.assets)) {
          for (let a = 0; a < room.assets.length; a++) {
            const ast = room.assets[a];
            if (isGenerated(ast.image)) {
              ast.image = "@generated";
            } else if (isActualCustomDataUrl(ast.image)) {
              const astId = "ast-custom-" + (ast.id || (room.id + "-" + a));
              await putImage(astId, ast.image);
              ast.image = "idb:" + astId;
            }
          }
        }

        // موظفو الغرفة
        if (Array.isArray(room.staff)) {
          for (let s = 0; s < room.staff.length; s++) {
            const emp = room.staff[s];
            if (isActualCustomDataUrl(emp.customPhoto)) {
              const empId = "emp-custom-" + (emp.id || (room.id + "-" + s));
              await putImage(empId, emp.customPhoto);
              emp.customPhoto = "idb:" + empId;
            }
          }
        }
      }
    }

    return copy;
  }

  // --------------------------------------------------------------------------
  // 4. استعادة وتوسيع البيانات: جلب الصور من IDB وإعادة ربطها في الذاكرة
  // --------------------------------------------------------------------------
  async function hydrateImages(strippedData) {
    if (!strippedData) return null;
    const data = JSON.parse(JSON.stringify(strippedData));
    const info = data.projectInfo || {};

    // 1. صور الواجهة
    if (Array.isArray(info.exteriorImages)) {
      for (let i = 0; i < info.exteriorImages.length; i++) {
        const img = info.exteriorImages[i];
        if (typeof img.url === "string" && img.url.indexOf("idb:") === 0) {
          const imgId = img.url.substring(4);
          const realUrl = await getImage(imgId);
          img.url = realUrl || "assets/kitchen_exterior.jpg";
        }
      }
      if (info.exteriorImages[0]) {
        info.exteriorImage = info.exteriorImages[0].url;
      }
    }

    // 2. المخطط الهندسي
    if (typeof info.evacuationImage === "string" && info.evacuationImage.indexOf("idb:") === 0) {
      const evacId = info.evacuationImage.substring(4);
      const realEvac = await getImage(evacId);
      info.evacuationImage = realEvac || "assets/evacuation_plan_b52.jpg";
    }

    // 3. صور الغرف والأصول والموظفين
    if (Array.isArray(data.rooms)) {
      for (let r = 0; r < data.rooms.length; r++) {
        const room = data.rooms[r];

        // صور الغرفة
        if (Array.isArray(room.images)) {
          for (let m = 0; m < room.images.length; m++) {
            const item = room.images[m];
            if (typeof item.url === "string" && item.url.indexOf("idb:") === 0) {
              const rImgId = item.url.substring(4);
              const realUrl = await getImage(rImgId);
              item.url = realUrl || "@generated";
            }
          }
          if (room.images[0]) {
            room.image = room.images[0].url;
          }
        }

        // أصول الغرفة
        if (Array.isArray(room.assets)) {
          for (let a = 0; a < room.assets.length; a++) {
            const ast = room.assets[a];
            if (typeof ast.image === "string" && ast.image.indexOf("idb:") === 0) {
              const astId = ast.image.substring(4);
              const realUrl = await getImage(astId);
              ast.image = realUrl || "@generated";
            }
          }
        }

        // موظفو الغرفة
        if (Array.isArray(room.staff)) {
          for (let s = 0; s < room.staff.length; s++) {
            const emp = room.staff[s];
            if (typeof emp.customPhoto === "string" && emp.customPhoto.indexOf("idb:") === 0) {
              const empId = emp.customPhoto.substring(4);
              const realUrl = await getImage(empId);
              emp.customPhoto = realUrl || null;
            }
          }
        }
      }
    }

    return data;
  }

  // --------------------------------------------------------------------------
  // 5. الحفظ والتحميل الرئيسي للبيانات
  // --------------------------------------------------------------------------
  async function saveData(fullDataObj) {
    if (!fullDataObj) return false;
    const stripped = await stripAndStoreImages(fullDataObj);
    const jsonStr = JSON.stringify(stripped);

    if (isAvailable()) {
      try {
        await new Promise(function (resolve, reject) {
          const tx = db.transaction([STORE_META], "readwrite");
          const store = tx.objectStore(STORE_META);
          store.put({ key: META_DATA_KEY, data: stripped, updatedAt: Date.now() });
          tx.oncomplete = function () { resolve(); };
          tx.onerror = reject;
        });
        return true;
      } catch (err) {
        console.warn("Saving to IndexedDB meta failed, falling back to localStorage:", err);
      }
    }

    // احتياطي: التخزين في localStorage
    try {
      localStorage.setItem("kitchen_b52_data_v5", jsonStr);
      return true;
    } catch (e) {
      console.error("Storage full or blocked:", e);
      return false;
    }
  }

  async function loadData() {
    await init();

    // 1. محاولة القراءة من IndexedDB أولاً
    if (isAvailable()) {
      try {
        const stored = await new Promise(function (resolve) {
          const tx = db.transaction([STORE_META], "readonly");
          const store = tx.objectStore(STORE_META);
          const req = store.get(META_DATA_KEY);
          req.onsuccess = function () { resolve(req.result ? req.result.data : null); };
          req.onerror = function () { resolve(null); };
        });
        if (stored && Array.isArray(stored.rooms) && stored.rooms.length > 0) {
          return await hydrateImages(stored);
        }
      } catch (e) {
        console.warn("Failed reading from IndexedDB meta:", e);
      }
    }

    // 2. محاولة القراءة من localStorage v5
    try {
      const savedV5 = localStorage.getItem("kitchen_b52_data_v5");
      if (savedV5) {
        const parsed = JSON.parse(savedV5);
        if (parsed && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
          return await hydrateImages(parsed);
        }
      }
    } catch (e) {}

    // 3. ترحيل تلقائي من v4 القديم (مع الاحتفاظ بنسخة v4 حتى اكتمال الترحيل)
    const migrated = await migrateFromV4();
    if (migrated) return migrated;

    // 4. لا توجد بيانات سابقة: استرجاع البيانات الافتراضية
    return null;
  }

  // --------------------------------------------------------------------------
  // 6. الترحيل الآمن من localStorage (v4)
  // --------------------------------------------------------------------------
  async function migrateFromV4() {
    try {
      const v4Raw = localStorage.getItem(V4_KEY);
      if (!v4Raw) return null;
      const v4Data = JSON.parse(v4Raw);
      if (!v4Data || !Array.isArray(v4Data.rooms) || v4Data.rooms.length === 0) return null;

      console.info("بدء الترحيل التلقائي من v4 إلى IndexedDB...");
      const savedOk = await saveData(v4Data);
      if (savedOk) {
        localStorage.setItem(MIGRATED_FLAG, "1");
        console.info("اكتمل الترحيل بنجاح. تم الاحتفاظ بنسخة v4 كاحتياطي.");
        return await hydrateImages(await stripAndStoreImages(v4Data));
      }
    } catch (e) {
      console.warn("Migration from v4 failed:", e);
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 7. النسخ الاحتياطي الشامل (JSON يحتوي كافة الصور الفعلية)
  // --------------------------------------------------------------------------
  async function exportFullBackupJson(dataObj) {
    const full = await hydrateImages(dataObj);
    return JSON.stringify(full, null, 2);
  }

  async function importBackupJson(jsonString) {
    if (!jsonString || typeof jsonString !== "string") {
      throw new Error("ملف النسخة الاحتياطية فارغ أو غير صالح.");
    }
    let parsed = null;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error("تنسيق JSON غير صالح.");
    }

    // التحقق من بنية الملف
    if (!parsed || typeof parsed !== "object") {
      throw new Error("بنية البيانات غير صالحة.");
    }
    if (!Array.isArray(parsed.rooms) || parsed.rooms.length === 0) {
      throw new Error("الملف لا يحتوي على قائمة أقسام صحيحة (rooms).");
    }

    // استخراج وتخزين أي صور فعلية وحفظها في التخزين الجديد
    const hydrated = await hydrateImages(parsed);
    await saveData(hydrated);
    return hydrated;
  }

  // --------------------------------------------------------------------------
  // 8. الثبات وحساب استهلاك المساحة التخزينية
  // --------------------------------------------------------------------------
  async function requestPersist() {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        return isPersisted;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  async function getStorageUsageText() {
    let bytes = 0;

    // محاولة الاستعلام عبر navigator.storage.estimate
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (est && typeof est.usage === "number") {
          bytes = est.usage;
        }
      } catch (e) {}
    }

    // إذا لم تتوفر الدالة أو أعطت صفراً، نحسب حجم سجلات IndexedDB والـ localStorage يدوياً
    if (!bytes && isAvailable()) {
      try {
        const countBytes = await new Promise(function (resolve) {
          let total = 0;
          const tx = db.transaction([STORE_IMAGES], "readonly");
          const store = tx.objectStore(STORE_IMAGES);
          const req = store.openCursor();
          req.onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
              const val = cursor.value;
              if (val && val.dataUrl) total += val.dataUrl.length;
              cursor.continue();
            } else {
              resolve(total);
            }
          };
          req.onerror = function () { resolve(total); };
        });
        bytes = countBytes;
      } catch (e) {}
    }

    if (!bytes) {
      // حجم localStorage التقريبي
      try {
        for (let k in localStorage) {
          if (localStorage.hasOwnProperty(k)) {
            bytes += (localStorage[k].length * 2);
          }
        }
      } catch (e) {}
    }

    if (bytes < 1024) return bytes + " بايت";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " كيلوبايت";
    return (bytes / (1024 * 1024)).toFixed(2) + " ميجابايت";
  }

  return {
    init: init,
    isAvailable: isAvailable,
    getImage: getImage,
    putImage: putImage,
    deleteImage: deleteImage,
    saveData: saveData,
    loadData: loadData,
    exportFullBackupJson: exportFullBackupJson,
    importBackupJson: importBackupJson,
    requestPersist: requestPersist,
    getStorageUsageText: getStorageUsageText
  };
})();

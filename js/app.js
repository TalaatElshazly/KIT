// ============================================================================
// المحرك الرئيسي للعرض الاستثماري والتشغيلي — مشروع مطبخ العزيزية المركزي 52
// يدير: الشرائح، معرض الواجهة، الكروكي، بطاقة القسم (أصول | صور وشرح | موظفون)،
// النوافذ المنبثقة، حفظ البيانات، والتصدير إلى PowerPoint.
// ============================================================================

window.KitchenApp = (function () {
  "use strict";

  const STORAGE_KEY = "kitchen_b52_presentation_data_v4";
  const MODE_KEY = "kitchen_b52_investor_mode";

  const SLIDE_ORDER = ["exterior", "croquis", "evacuation"];
  const SLIDE_LABELS = {
    exterior: "واجهة المطبخ المركزي",
    croquis: "الخريطة الكروكية التفاعلية",
    evacuation: "المخطط الهندسي المعتمد"
  };
  const CATEGORIES = [
    "الإنتاج والطبخ",
    "التبريد والتجميد",
    "التحضير والتقطيع",
    "المستودعات والتخزين",
    "التحكم والمرافق الفنية",
    "الإدارة والخدمات"
  ];

  let state = {
    currentSlide: "exterior", // 'exterior' | 'croquis' | 'room' | 'evacuation'
    activeRoomId: null,
    selectedCategory: "all",
    searchQuery: "",
    showEvacOverlay: false,
    investorMode: false,
    activeExteriorPhotoIdx: 0,
    exteriorViewMode: "single", // 'single' | 'grid'
    activeRoomPhotoIdx: 0,
    roomViewMode: "single",
    activeRoomTab: "overview", // 'overview' | 'assets' | 'staff'
    filterMissingPhotosOnly: false,
    isBlackout: false,
    tourActive: false,
    tourIndex: 0,
    data: null
  };

  // --------------------------------------------------------------------------
  // أدوات مساعدة
  // --------------------------------------------------------------------------
  const $ = function (id) { return document.getElementById(id); };

  // تهريب النص قبل إدراجه داخل HTML (حماية من كسر الواجهة أو حقن الأكواد)
  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ic(name, extraClass) {
    return '<svg class="ic ' + (extraClass || "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  function safeColor(value, fallback) {
    return (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value.trim())) ? value.trim() : fallback;
  }

  function num(value, fallback) {
    const n = parseFloat(value);
    return isFinite(n) ? n : fallback;
  }

  function isGenerated(url) {
    return typeof url === "string" && url.indexOf("data:image/svg") === 0;
  }

  // توحيد النص العربي للبحث (إزالة التشكيل وتوحيد الهمزات والتاء المربوطة)
  function normAr(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[ً-ٰٟـ]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .trim();
  }

  function dayWord(n) {
    if (n === 1) return "يوم واحد";
    if (n === 2) return "يومين";
    if (n >= 3 && n <= 10) return n + " أيام";
    return n + " يوماً";
  }

  function monthWord(n) {
    if (n === 1) return "شهر واحد";
    if (n === 2) return "شهرين";
    if (n >= 3 && n <= 10) return n + " أشهر";
    return n + " شهراً";
  }

  // حالة الصيانة القادمة للأصل (تُحسب تلقائياً من التاريخ)
  function maintenanceInfo(dateStr) {
    const none = { cls: "is-none", text: "لم يُحدَّد موعد الصيانة القادمة" };
    if (!dateStr) return none;
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return none;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (days < 0) return { cls: "is-late", text: "الصيانة متأخرة منذ " + dayWord(-days) };
    if (days === 0) return { cls: "is-soon", text: "الصيانة مستحقة اليوم" };
    if (days <= 30) return { cls: "is-soon", text: "الصيانة القادمة بعد " + dayWord(days) };
    if (days >= 60) return { cls: "is-ok", text: "الصيانة القادمة بعد " + monthWord(Math.round(days / 30)) };
    return { cls: "is-ok", text: "الصيانة القادمة بعد " + dayWord(days) };
  }

  function assetStatusClass(status) {
    const s = String(status || "");
    if (s.indexOf("صيانة") !== -1) return "badge-warn";
    if (s.indexOf("جديد") !== -1) return "badge-info";
    return "badge-ok";
  }

  // --------------------------------------------------------------------------
  // البيانات: التحميل والحفظ والتطبيع
  // --------------------------------------------------------------------------
  function normalizeData(dataObj) {
    if (!dataObj) return;
    if (!dataObj.projectInfo) dataObj.projectInfo = {};
    if (!Array.isArray(dataObj.structuralZones)) dataObj.structuralZones = [];
    if (!Array.isArray(dataObj.tourOrder) || dataObj.tourOrder.length === 0) {
      dataObj.tourOrder = (window.DefaultKitchenData && window.DefaultKitchenData.tourOrder) || [];
    }
    const info = dataObj.projectInfo;
    if (!Array.isArray(info.exteriorImages) || info.exteriorImages.length === 0) {
      info.exteriorImages = [
        {
          id: "ext-main-1",
          url: info.exteriorImage || "assets/kitchen_exterior.jpg",
          caption: "الواجهة المعمارية الرئيسية — مشروع مطبخ العزيزية المركزي مبنى 52"
        }
      ];
    }
    info.exteriorImage = info.exteriorImages[0].url;
    if (!info.evacuationImage) {
      info.evacuationImage = "assets/evacuation_plan_b52.jpg";
    }

    if (Array.isArray(dataObj.rooms)) {
      dataObj.rooms.forEach(function (room) {
        if (!Array.isArray(room.assets)) room.assets = [];
        if (!Array.isArray(room.staff)) room.staff = [];
        if (!Array.isArray(room.images) || room.images.length === 0) {
          if (room.image) {
            const defaults = window.KitchenVisuals.generateRoomDefaultImages(room);
            room.images = [
              {
                id: "rm-img-1-" + room.id,
                url: room.image,
                caption: "المنظور الداخلي والتجهيزات الصناعية — " + room.name
              },
              defaults[1]
            ];
          } else {
            room.images = window.KitchenVisuals.generateRoomDefaultImages(room);
          }
        }
        // الرسوم التوضيحية المولَّدة تُعاد صياغتها دائماً (لتحديث التصميم في البيانات المحفوظة سابقاً)
        room.images.forEach(function (img) {
          const m = isGenerated(img.url) && /^rm-img-(\d)-/.exec(img.id || "");
          if (m) img.url = window.KitchenVisuals.generateRoomSceneDataUrl(room, parseInt(m[1], 10) - 1);
        });
        room.image = room.images[0].url;

        room.assets.forEach(function (ast) {
          if ((!ast.image || isGenerated(ast.image)) && window.KitchenVisuals) {
            ast.image = window.KitchenVisuals.generateAssetImageDataUrl(ast.name, ast["function"], room.color);
          }
        });
      });
    }
  }

  async function loadData() {
    if (window.KitchenStorage) {
      try {
        const stored = await window.KitchenStorage.loadData();
        if (stored && Array.isArray(stored.rooms) && stored.rooms.length > 0) {
          normalizeData(stored);
          state.data = stored;
          updateStorageUsageDisplay();
          return;
        }
      } catch (e) {
        console.warn("KitchenStorage.loadData failed, falling back:", e);
      }
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
          normalizeData(parsed);
          state.data = parsed;
          updateStorageUsageDisplay();
          return;
        }
      }
    } catch (e) {
      console.warn("تعذر قراءة البيانات المحفوظة، سيتم استخدام البيانات الافتراضية.", e);
    }
    state.data = JSON.parse(JSON.stringify(window.DefaultKitchenData));
    normalizeData(state.data);
    updateStorageUsageDisplay();
  }

  function refreshAll() {
    updateExteriorStats();
    renderCategoryChips();
    renderCroquisMap();
    renderEvacuationSlide();
    updateBottomStatusBar();
    updateMissingPhotosCount();
    setRoomTab(state.activeRoomTab || "overview");
    if (state.currentSlide === "room" && state.activeRoomId) {
      renderRoomDetail(state.activeRoomId);
    }
  }

  async function updateStorageUsageDisplay() {
    const el = $("storageUsageText");
    if (!el || !window.KitchenStorage) return;
    try {
      const text = await window.KitchenStorage.getStorageUsageText();
      el.textContent = "المساحة المستخدمة: " + text;
    } catch (e) {
      el.textContent = "المساحة المستخدمة: غير محددة";
    }
  }

  async function saveData(toastText) {
    normalizeData(state.data);
    let ok = false;
    if (window.KitchenStorage) {
      try {
        ok = await window.KitchenStorage.saveData(state.data);
      } catch (e) {
        console.warn("KitchenStorage.saveData error:", e);
      }
    }
    if (!ok) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
        ok = true;
      } catch (e) {
        showToast("تعذّر الحفظ الدائم لأن حجم الصور كبير. التعديل محفوظ في هذه الجلسة فقط — احفظ نسخة احتياطية (JSON) من قائمة ⋯", "error");
      }
    }
    if (ok && toastText) {
      showToast(toastText);
    }
    updateStorageUsageDisplay();
    refreshAll();
  }

  async function resetToDefaultData() {
    const ok = await confirmDialog("سيتم مسح كل التعديلات المحلية (الأقسام والأصول والموظفين والصور) واستعادة البيانات الافتراضية. هل تريد المتابعة؟", {
      title: "استعادة البيانات الافتراضية", okText: "نعم، استعادة"
    });
    if (!ok) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* تجاهل */ }
    try { localStorage.removeItem("kitchen_b52_data_v5"); } catch (e) { /* تجاهل */ }
    state.data = JSON.parse(JSON.stringify(window.DefaultKitchenData));
    normalizeData(state.data);
    state.activeExteriorPhotoIdx = 0;
    state.activeRoomPhotoIdx = 0;
    state.activeRoomId = null;
    $("navPillRoom").style.display = "none";
    if (state.currentSlide === "room") goToSlide("croquis");
    await saveData("تمت استعادة البيانات الافتراضية بنجاح");
  }

  // --------------------------------------------------------------------------
  // الإشعارات ونافذة التأكيد
  // --------------------------------------------------------------------------
  function showToast(msg, type) {
    const el = $("appToast");
    if (!el) return;
    el.className = "toast" + (type === "error" ? " is-error" : "");
    el.innerHTML = ic(type === "error" ? "alert" : "check") + "<span></span>";
    el.lastChild.textContent = msg;
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("show"); }, type === "error" ? 6000 : 3200);
  }

  let confirmResolver = null;

  function confirmDialog(message, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (confirmResolver) confirmResolver(false);
      confirmResolver = resolve;
      $("confirmTitle").textContent = opts.title || "تأكيد الإجراء";
      $("confirmText").textContent = message;
      $("confirmOk").textContent = opts.okText || "تأكيد";
      $("confirmOk").className = "btn " + (opts.danger === false ? "btn-primary" : "btn-danger");
      $("confirmIcon").className = "confirm-icon" + (opts.danger === false ? "" : " is-danger");
      openModal("confirmModal");
      setTimeout(function () { $("confirmCancel").focus(); }, 30);
    });
  }

  function resolveConfirm(value) {
    const r = confirmResolver;
    confirmResolver = null;
    closeModal("confirmModal", true);
    if (r) r(!!value);
  }

  // --------------------------------------------------------------------------
  // النوافذ المنبثقة (إدارة التركيز + الإغلاق بـ Esc + حبس Tab)
  // --------------------------------------------------------------------------
  const modalStack = [];

  function openModal(id) {
    const el = $(id);
    if (!el) return;
    if (modalStack.length && modalStack[modalStack.length - 1].id === id) return;
    modalStack.push({ id: id, opener: document.activeElement });
    el.classList.add("open");
    hideTooltip();
    if (id !== "confirmModal") {
      setTimeout(function () {
        const first = el.querySelector("input:not([type=file]):not([type=color]), textarea, select");
        const target = (id === "photoLightboxModal" || id === "cvModal") ? el.querySelector(".modal-close") : (first || el.querySelector(".modal-close"));
        if (target) target.focus({ preventScroll: true });
      }, 40);
    }
  }

  function closeModal(id, fromConfirm) {
    const el = $(id);
    if (!el) return;
    el.classList.remove("open");
    const idx = modalStack.map(function (m) { return m.id; }).lastIndexOf(id);
    let opener = null;
    if (idx !== -1) opener = modalStack.splice(idx, 1)[0].opener;
    if (id === "confirmModal" && !fromConfirm && confirmResolver) {
      const r = confirmResolver;
      confirmResolver = null;
      r(false);
    }
    if (opener && typeof opener.focus === "function" && document.body.contains(opener)) {
      opener.focus({ preventScroll: true });
    }
  }

  function topModalId() {
    return modalStack.length ? modalStack[modalStack.length - 1].id : null;
  }

  function trapFocus(e) {
    const id = topModalId();
    if (!id || e.key !== "Tab") return;
    const dialog = $(id).querySelector(".modal-dialog");
    const focusables = Array.from(dialog.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
      .filter(function (n) { return !n.disabled && n.offsetParent !== null; });
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openPhotoLightbox(url, title) {
    $("lightboxImg").src = url;
    $("lightboxTitle").textContent = title || "معاينة الصورة بحجم كامل";
    openModal("photoLightboxModal");
  }

  function requireField(inputId, message) {
    const input = $(inputId);
    if (!input) return true;
    if (input.value.trim()) return true;
    input.classList.add("is-invalid");
    input.focus();
    input.addEventListener("input", function clear() {
      input.classList.remove("is-invalid");
      input.removeEventListener("input", clear);
    });
    showToast(message, "error");
    return false;
  }

  // --------------------------------------------------------------------------
  // قائمة إدارة البيانات (⋯) ووضع العرض
  // --------------------------------------------------------------------------
  function toggleMoreMenu(e) {
    if (e) e.stopPropagation();
    const menu = $("moreMenu");
    const open = menu.hidden;
    menu.hidden = !open;
    $("btnMore").setAttribute("aria-expanded", String(open));
    if (open) {
      updateStorageUsageDisplay();
      const first = menu.querySelector(".menu-item");
      if (first) first.focus();
    }
  }

  function closeMoreMenu() {
    const menu = $("moreMenu");
    if (menu && !menu.hidden) {
      menu.hidden = true;
      $("btnMore").setAttribute("aria-expanded", "false");
    }
  }

  function applyInvestorMode(on, silent) {
    state.investorMode = on;
    document.body.classList.toggle("investor-mode", on);
    const btn = $("btnInvestorMode");
    if (btn) btn.setAttribute("aria-checked", String(on));
    try { localStorage.setItem(MODE_KEY, on ? "1" : "0"); } catch (e) { /* تجاهل */ }
    if (on) closeMoreMenu();
    if (!silent) {
      showToast(on
        ? "وضع العرض مفعّل — تم إخفاء أزرار التعديل والإضافة"
        : "وضع التحرير مفعّل — أزرار التعديل والإضافة ظاهرة");
    }
  }

  function toggleInvestorMode() {
    applyInvestorMode(!state.investorMode, false);
  }

  // --------------------------------------------------------------------------
  // التنقل بين الشرائح (مع دعم رابط # لزر الرجوع وإعادة التحميل)
  // --------------------------------------------------------------------------
  let suppressHashEvent = false;

  function hashForState() {
    if (state.currentSlide === "room" && state.activeRoomId) return "#/room/" + encodeURIComponent(state.activeRoomId);
    return "#/" + state.currentSlide;
  }

  function goToSlide(slideName, opts) {
    opts = opts || {};
    if (slideName === "room" && !state.activeRoomId) slideName = "croquis";
    state.currentSlide = slideName;

    document.querySelectorAll(".slide").forEach(function (el) { el.classList.remove("active"); });
    const target = $("slide-" + slideName);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-tab").forEach(function (btn) {
      const on = btn.getAttribute("data-slide") === slideName;
      btn.classList.toggle("active", on);
      if (on) btn.setAttribute("aria-current", "page"); else btn.removeAttribute("aria-current");
    });

    const roomPill = $("navPillRoom");
    if (roomPill) {
      if (state.activeRoomId) {
        const rm = getRoomById(state.activeRoomId);
        roomPill.style.display = "inline-flex";
        roomPill.lastElementChild.textContent = rm ? rm.name : "تفاصيل القسم";
      } else {
        roomPill.style.display = "none";
      }
    }

    hideTooltip();
    updateBottomStatusBar();
    if (slideName === "croquis") renderCroquisMap();
    if (slideName === "evacuation") renderEvacuationSlide();

    if (!opts.fromRoute) {
      const h = hashForState();
      if (location.hash !== h) {
        suppressHashEvent = true;
        try { location.hash = h; } catch (e) { suppressHashEvent = false; }
      }
    }
    const scroller = document.scrollingElement;
    if (scroller && scroller.scrollTop) scroller.scrollTop = 0;
  }

  function applyRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const slide = parts[0];
    if (slide === "room" && parts[1]) {
      const id = decodeURIComponent(parts[1]);
      if (getRoomById(id)) { openRoomSlide(id, { fromRoute: true }); return; }
    }
    if (SLIDE_ORDER.indexOf(slide) !== -1) goToSlide(slide, { fromRoute: true });
  }

  function openRoomSlide(roomId, opts) {
    const room = getRoomById(roomId);
    if (!room) return;
    state.activeRoomId = roomId;
    state.activeRoomPhotoIdx = 0;
    state.roomViewMode = "single";
    renderRoomDetail(roomId);
    goToSlide("room", opts);
  }

  function navigateAdjacentRoom(dir) {
    const rooms = state.data.rooms;
    if (!rooms || !rooms.length) return;
    const idx = rooms.findIndex(function (r) { return r.id === state.activeRoomId; });
    const nextIdx = (idx + dir + rooms.length) % rooms.length;
    openRoomSlide(rooms[nextIdx].id);
  }

  function getRoomById(roomId) {
    return ((state.data && state.data.rooms) || []).find(function (r) { return r.id === roomId; });
  }

  function updateBottomStatusBar() {
    const labelEl = $("bottomSlideStatus");
    if (!labelEl) return;
    const rooms = (state.data && state.data.rooms) || [];
    let text;
    let dotIdx;
    if (state.currentSlide === "room") {
      const idx = rooms.findIndex(function (r) { return r.id === state.activeRoomId; });
      const rm = rooms[idx];
      text = "بطاقة القسم " + (idx + 1) + " من " + rooms.length + (rm ? " — " + rm.name : "");
      dotIdx = 1;
    } else {
      dotIdx = SLIDE_ORDER.indexOf(state.currentSlide);
      text = "الشريحة " + (dotIdx + 1) + " من " + SLIDE_ORDER.length + " — " + SLIDE_LABELS[state.currentSlide];
      if (state.currentSlide === "croquis") text += " (" + rooms.length + " قسماً)";
    }
    labelEl.textContent = text;
    const dots = $("statusDots");
    if (dots) {
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i === dotIdx); });
    }
  }

  // --------------------------------------------------------------------------
  // الشريحة 1: واجهة المطبخ المركزي ومعرض الصور
  // --------------------------------------------------------------------------
  function updateExteriorStats() {
    const rooms = state.data.rooms || [];
    const totalAssets = rooms.reduce(function (sum, r) { return sum + (r.assets ? r.assets.length : 0); }, 0);
    const totalStaff = rooms.reduce(function (sum, r) { return sum + (r.staff ? r.staff.length : 0); }, 0);
    const info = state.data.projectInfo || {};

    $("extTitle").textContent = info.title || "مشروع مطبخ العزيزية المركزي - مبنى 52";
    $("extSubtitle").textContent = info.subtitle || "";
    $("statRoomsCount").textContent = rooms.length;
    $("statAssetsCount").textContent = totalAssets;
    $("statStaffCount").textContent = totalStaff;

    // الطاقة اليومية من بيانات المشروع (مثال: "25,000 وجبة يومياً") مع قيمة احتياطية
    const capMatch = String(info.dailyCapacity || "").match(/[\d.,٠-٩]+/);
    $("statCapacity").textContent = capMatch ? capMatch[0] : "25,000";

    renderExteriorGallery();
  }

  function renderExteriorGallery() {
    const info = state.data.projectInfo;
    if (!info || !Array.isArray(info.exteriorImages) || info.exteriorImages.length === 0) return;

    const images = info.exteriorImages;
    state.activeExteriorPhotoIdx = Math.max(0, Math.min(state.activeExteriorPhotoIdx, images.length - 1));
    const currentImg = images[state.activeExteriorPhotoIdx];
    const many = images.length > 1;

    $("extHeroImg").src = currentImg.url;
    $("extHeroImg").alt = currentImg.caption || "الواجهة الخارجية للمطبخ المركزي 52";
    $("extPhotoCounter").textContent = "صورة " + (state.activeExteriorPhotoIdx + 1) + " من " + images.length;
    $("extPhotoCaption").textContent = currentImg.caption || ("صورة الواجهة رقم " + (state.activeExteriorPhotoIdx + 1));
    $("btnDeleteExtPhoto").style.display = many ? "" : "none";
    $("extPrevBtn").style.display = many ? "" : "none";
    $("extNextBtn").style.display = many ? "" : "none";

    const isGrid = state.exteriorViewMode === "grid";
    $("extSingleStage").style.display = isGrid ? "none" : "flex";
    $("extGridStage").style.display = isGrid ? "grid" : "none";
    const toggleBtn = $("btnToggleExtViewMode");
    toggleBtn.style.display = many ? "" : "none";
    toggleBtn.innerHTML = isGrid
      ? ic("single") + '<span class="btn-label">عرض منفرد</span>'
      : ic("grid") + '<span class="btn-label">عرض الشبكة (' + images.length + ")</span>";

    $("extStripWrap").hidden = !many || isGrid;
    $("extThumbnailsStrip").innerHTML = images.map(function (imgObj, idx) {
      const cap = imgObj.caption || ("صورة الواجهة " + (idx + 1));
      return '<button type="button" class="thumb' + (idx === state.activeExteriorPhotoIdx ? " active" : "") + '" data-act="ext-select" data-idx="' + idx + '" title="' + esc(cap) + '" aria-label="' + esc(cap) + '">' +
        '<img src="' + esc(imgObj.url) + '" alt="" /><span class="thumb-index">' + (idx + 1) + "</span></button>";
    }).join("") +
      '<button type="button" class="thumb-add edit-control" data-act="ext-add" title="إضافة صور للواجهة">' + ic("plus") + "<span>إضافة</span></button>";

    $("extGridStage").innerHTML = images.map(function (imgObj, idx) {
      const cap = imgObj.caption || ("صورة الواجهة " + (idx + 1));
      return '<figure class="grid-card">' +
        '<img src="' + esc(imgObj.url) + '" alt="' + esc(cap) + '" data-act="ext-lightbox" data-idx="' + idx + '" />' +
        '<figcaption class="grid-card-foot"><span title="' + esc(cap) + '"><strong>' + (idx + 1) + ".</strong> " + esc(cap) + "</span>" +
        '<div class="grid-card-actions"><button type="button" class="btn btn-sm" data-act="ext-select" data-idx="' + idx + '">عرض منفرد</button>' +
        '<button type="button" class="btn btn-sm btn-danger btn-icon edit-control" data-act="ext-delete" data-idx="' + idx + '" aria-label="حذف الصورة">' + ic("trash") + "</button></div></figcaption></figure>";
    }).join("");
  }

  function selectExteriorPhoto(idx) {
    state.activeExteriorPhotoIdx = idx;
    state.exteriorViewMode = "single";
    renderExteriorGallery();
  }

  function stepExteriorPhoto(dir) {
    const images = state.data.projectInfo.exteriorImages || [];
    if (images.length <= 1) return;
    state.activeExteriorPhotoIdx = (state.activeExteriorPhotoIdx + dir + images.length) % images.length;
    renderExteriorGallery();
  }

  function toggleExteriorViewMode() {
    state.exteriorViewMode = (state.exteriorViewMode === "single") ? "grid" : "single";
    renderExteriorGallery();
  }

  function openCurrentExteriorLightbox() {
    openExteriorLightboxByIndex(state.activeExteriorPhotoIdx);
  }

  function openExteriorLightboxByIndex(idx) {
    const item = (state.data.projectInfo.exteriorImages || [])[idx];
    if (!item) return;
    openPhotoLightbox(item.url, item.caption || "واجهة المطبخ المركزي 52");
  }

  function openEvacLightbox() {
    const src = (state.data.projectInfo && state.data.projectInfo.evacuationImage) || "assets/evacuation_plan_b52.jpg";
    openPhotoLightbox(src, "المخطط الهندسي المعتمد — مبنى 52");
  }

  function renderEvacuationSlide() {
    const defaultSrc = "assets/evacuation_plan_b52.jpg";
    const currentSrc = (state.data && state.data.projectInfo && state.data.projectInfo.evacuationImage) || defaultSrc;
    const img = $("evacImg");
    if (img && img.src !== currentSrc) {
      img.src = currentSrc;
    }
    const overlay = $("evacOverlayImg");
    if (overlay && overlay.src !== currentSrc) {
      overlay.src = currentSrc;
    }
    const btnReset = $("btnResetEvac");
    if (btnReset) {
      btnReset.style.display = (currentSrc && currentSrc !== defaultSrc) ? "inline-flex" : "none";
    }
  }

  function handleEvacPhotoChange(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    readImageFileAsDataUrl(file, 2000, function (dataUrl) {
      if (!state.data.projectInfo) state.data.projectInfo = {};
      state.data.projectInfo.evacuationImage = dataUrl;
      input.value = "";
      renderEvacuationSlide();
      saveData("تم تحديث صورة المخطط الهندسي بنجاح");
    });
  }

  async function resetEvacPhoto() {
    const ok = await confirmDialog("هل تريد استعادة صورة المخطط الهندسي الأصلية المعتمدة للمبنى 52؟", {
      title: "استعادة المخطط الأصلي",
      okText: "نعم، استعادة"
    });
    if (!ok) return;
    if (!state.data.projectInfo) state.data.projectInfo = {};
    state.data.projectInfo.evacuationImage = "assets/evacuation_plan_b52.jpg";
    renderEvacuationSlide();
    saveData("تمت استعادة صورة المخطط الهندسي الأصلية");
  }

  function handleExteriorPhotoChange(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    readImageFileAsDataUrl(file, 1600, function (dataUrl) {
      const images = state.data.projectInfo.exteriorImages;
      const idx = state.activeExteriorPhotoIdx;
      images[idx] = {
        id: "ext-" + Date.now(),
        url: dataUrl,
        caption: "صورة الواجهة الخارجية (" + (idx + 1) + ") — " + (file.name.replace(/\.[^/.]+$/, "") || "محدثة")
      };
      state.data.projectInfo.exteriorImage = images[0].url;
      input.value = "";
      saveData("تم تغيير صورة الواجهة الخارجية");
    });
  }

  function handleAddExteriorPhotos(input) {
    if (!input.files || !input.files.length) return;
    const files = Array.from(input.files);
    let processed = 0;
    files.forEach(function (file) {
      readImageFileAsDataUrl(file, 1600, function (dataUrl) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const images = state.data.projectInfo.exteriorImages;
        images.push({
          id: "ext-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          url: dataUrl,
          caption: "واجهة المطبخ المركزي — " + (cleanName || ("صورة " + (images.length + 1)))
        });
        processed++;
        if (processed === files.length) {
          state.activeExteriorPhotoIdx = images.length - 1;
          state.exteriorViewMode = "single";
          input.value = "";
          saveData("تمت إضافة " + files.length + " صورة إلى معرض الواجهة");
        }
      });
    });
  }

  function deleteCurrentExteriorPhoto() {
    deleteExteriorPhotoByIndex(state.activeExteriorPhotoIdx);
  }

  async function deleteExteriorPhotoByIndex(idx) {
    const images = state.data.projectInfo.exteriorImages;
    if (!images || images.length <= 1) {
      showToast("يجب الإبقاء على صورة واحدة على الأقل للواجهة. يمكنك استبدالها بزر «تغيير الصورة».", "error");
      return;
    }
    const ok = await confirmDialog("هل تريد حذف هذه الصورة من معرض الواجهة الخارجية؟", { title: "حذف صورة", okText: "حذف" });
    if (!ok) return;
    images.splice(idx, 1);
    state.activeExteriorPhotoIdx = Math.min(state.activeExteriorPhotoIdx, images.length - 1);
    state.data.projectInfo.exteriorImage = images[0].url;
    saveData("تم حذف الصورة من معرض الواجهة");
  }

  // --------------------------------------------------------------------------
  // الشريحة 2: الخريطة الكروكية
  // --------------------------------------------------------------------------
  function renderCategoryChips() {
    const wrap = $("categoryChips");
    if (!wrap) return;
    const rooms = state.data.rooms || [];
    const counts = {};
    rooms.forEach(function (r) { counts[r.category] = (counts[r.category] || 0) + 1; });
    const extra = Object.keys(counts).filter(function (c) { return CATEGORIES.indexOf(c) === -1; });
    const cats = CATEGORIES.concat(extra).filter(function (c) { return counts[c]; });
    if (state.selectedCategory !== "all" && cats.indexOf(state.selectedCategory) === -1) state.selectedCategory = "all";

    const chip = function (key, label, count) {
      const on = state.selectedCategory === key;
      return '<button type="button" class="chip' + (on ? " active" : "") + '" data-act="filter" data-cat="' + esc(key) + '" aria-pressed="' + on + '">' +
        esc(label) + '<span class="chip-count">' + count + "</span></button>";
    };
    wrap.innerHTML = chip("all", "كافة الأقسام", rooms.length) + cats.map(function (c) { return chip(c, c, counts[c]); }).join("");
  }

  function roomMatches(room, q) {
    if (!q) return true;
    const hay = [room.name, room.mapLabel, room.b52Code, room.category]
      .concat((room.assets || []).map(function (a) { return a.name + " " + (a["function"] || ""); }))
      .concat((room.staff || []).map(function (s) { return s.name + " " + (s.position || ""); }));
    return normAr(hay.join(" | ")).indexOf(q) !== -1;
  }

  function renderCroquisMap() {
    const canvas = $("croquisCanvas");
    if (!canvas) return;

    const evacImgSrc = (state.data.projectInfo && state.data.projectInfo.evacuationImage) || "assets/evacuation_plan_b52.jpg";
    let html = '<img src="' + esc(evacImgSrc) + '" id="evacOverlayImg" class="evac-overlay-layer' + (state.showEvacOverlay ? " visible" : "") + '" alt="" aria-hidden="true"/>';

    (state.data.structuralZones || []).forEach(function (st) {
      html += '<div class="croquis-structural" style="left:' + num(st.x, 0) + "%; top:" + num(st.y, 0) + "%; width:" + num(st.w, 0) + "%; height:" + num(st.h, 0) + "%; background:" +
        safeColor(st.bg, "#E9EEF5") + ";" + (st.rounded ? " border-radius:10px;" : "") + '">' +
        (st.label ? "<span>" + esc(st.label) + "</span>" : "") + "</div>";
    });

    const q = normAr(state.searchQuery);
    const catFilter = state.selectedCategory;

    (state.data.rooms || []).forEach(function (room) {
      const matches = (catFilter === "all" || room.category === catFilter) && roomMatches(room, q);
      const hasRealPhoto = Array.isArray(room.images) && room.images.some(function (img) {
        return img && img.url && !isGenerated(img.url);
      });
      let extraClass = "";
      if (state.filterMissingPhotosOnly) {
        if (!hasRealPhoto) {
          extraClass = " missing-photo-highlight";
        } else {
          extraClass = " dimmed";
        }
      } else if (!matches) {
        extraClass = " dimmed";
      }

      const assetsCount = (room.assets || []).length;
      const staffCount = (room.staff || []).length;
      const w = num(room.w, 8);
      const h = num(room.h, 10);
      const isLarge = (w >= 9.0 && h >= 14.0);
      const isMedium = (w >= 7.2 && h >= 11.5);
      const label = room.mapLabel || room.name;

      html += '<button type="button" class="croquis-room' + extraClass + (room.id === state.activeRoomId ? " is-active" : "") + '"' +
        ' data-room-id="' + esc(room.id) + '"' +
        ' aria-label="' + esc(room.name + (room.b52Code ? " — غرفة " + room.b52Code : "") + " — " + assetsCount + " أصل، " + staffCount + " موظف") + '"' +
        ' style="left:' + Math.max(0, num(room.x, 0)) + "%; top:" + Math.max(0, num(room.y, 0)) + "%; width:" + w + "%; height:" + h + "%; background:" +
        safeColor(room.color, "#3B6998") + "; color:" + safeColor(room.textColor, "#ffffff") + ";" + (room.id === "hot-kitchen-main" ? " border-radius:8px;" : "") + '">' +
        '<span class="room-title-label">' + esc(label) + "</span>" +
        (isMedium && room.b52Code ? '<span class="room-code-tag">غرفة ' + esc(room.b52Code) + "</span>" : "") +
        (isLarge ? '<span class="room-mini-counts"><span>الأصول: ' + assetsCount + "</span><span>·</span><span>الكوادر: " + staffCount + "</span></span>" : "") +
        "</button>";
    });

    canvas.innerHTML = html;
  }

  function showRoomTooltip(target, roomId, point) {
    const room = getRoomById(roomId);
    const tip = $("croquisTooltip");
    if (!room || !tip) return;
    tip.style.setProperty("--tip-color", safeColor(room.color, "#2e5a88"));
    tip.innerHTML =
      '<div class="tooltip-title"><span>' + esc(room.name) + "</span><small>غرفة " + esc(room.b52Code || "") + "</small></div>" +
      '<div class="tooltip-cat">' + esc(room.category || "") + (room.temp ? " — " + esc(room.temp) : "") + "</div>" +
      '<div class="tooltip-desc">' + esc(room.description || "") + "</div>" +
      '<div class="tooltip-meta"><span>الأصول المسجلة: ' + (room.assets || []).length + "</span><span>الكوادر: " + (room.staff || []).length + "</span></div>" +
      '<div class="tooltip-cta">اضغط لاستعراض الغرفة ←</div>';
    tip.classList.add("show");
    positionTooltip(target, point);
  }

  function positionTooltip(target, point) {
    const tip = $("croquisTooltip");
    if (!tip || !tip.classList.contains("show")) return;
    const rect = target.getBoundingClientRect();
    const px = point ? point.x : rect.left + rect.width / 2;
    const py = point ? point.y : rect.top;
    const tw = tip.offsetWidth || 288;
    let x = px - tw / 2;
    let y = py - tip.offsetHeight - 16;
    x = Math.max(12, Math.min(x, window.innerWidth - tw - 12));
    if (y < 70) y = (point ? py : rect.bottom) + 18;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function hideTooltip() {
    const tip = $("croquisTooltip");
    if (tip) tip.classList.remove("show");
  }

  function setCategoryFilter(cat) {
    state.selectedCategory = cat;
    renderCategoryChips();
    renderCroquisMap();
  }

  function setSearchQuery(val) {
    state.searchQuery = val;
    renderCroquisMap();
  }

  function toggleEvacOverlay() {
    state.showEvacOverlay = !state.showEvacOverlay;
    const img = $("evacOverlayImg");
    if (img) img.classList.toggle("visible", state.showEvacOverlay);
    const btn = $("btnToggleEvacOverlay");
    if (btn) {
      btn.classList.toggle("btn-soft", state.showEvacOverlay);
      btn.setAttribute("aria-pressed", String(state.showEvacOverlay));
      btn.innerHTML = ic("layers") + "<span>" + (state.showEvacOverlay ? "إخفاء المخطط الهندسي" : "مطابقة المخطط الهندسي") + "</span>";
    }
  }

  // --------------------------------------------------------------------------
  // الشريحة 3: بطاقة القسم
  // --------------------------------------------------------------------------
  function assetCardHtml(room, ast, idx) {
    const funcStr = ast["function"] || "-";
    const imgSrc = ast.image || window.KitchenVisuals.generateAssetImageDataUrl(ast.name, funcStr, room.color);
    const m = maintenanceInfo(ast.nextMaintDate);
    const dateCell = function (label, value) {
      return '<div class="maint-cell"><span>' + label + "</span><strong>" + esc(value || "-") + "</strong></div>";
    };
    return '<article class="asset-card">' +
      '<button type="button" class="asset-media" data-act="asset-lightbox" data-room="' + esc(room.id) + '" data-idx="' + idx + '" title="تكبير صورة الأصل" aria-label="تكبير صورة ' + esc(ast.name) + '">' +
      '<img class="' + (isGenerated(imgSrc) ? "is-generated" : "") + '" src="' + esc(imgSrc) + '" alt="' + esc(ast.name) + '" loading="lazy"/></button>' +
      '<div class="asset-body">' +
      '<div class="asset-top"><div><h4 class="asset-title">' + esc(ast.name) + "</h4>" +
      '<div class="asset-sub">كود: <bdi>' + esc(ast.code || "-") + "</bdi> · " + esc(ast.brand || "صناعي قياسي") + "</div></div>" +
      '<span class="badge ' + assetStatusClass(ast.status) + '">' + esc(ast.status || "يعمل بكفاءة") + "</span></div>" +
      '<div class="maint">' + dateCell("تاريخ الإدخال", ast.installDate) + dateCell("آخر صيانة", ast.lastMaintDate) + dateCell("الصيانة القادمة", ast.nextMaintDate) + "</div>" +
      '<div class="maint-flag ' + m.cls + '">' + ic("clock") + "<span>" + esc(m.text) + "</span></div>" +
      '<div class="field"><span class="field-label">الوظيفة</span><span class="field-text">' + esc(funcStr) + "</span></div>" +
      (ast.specs ? '<div class="field field-muted"><span class="field-label">المواصفات</span><span class="field-text">' + esc(ast.specs) + "</span></div>" : "") +
      '<div class="card-actions edit-control"><button type="button" class="btn btn-sm" data-act="asset-edit" data-room="' + esc(room.id) + '" data-idx="' + idx + '">' + ic("edit") + "<span>تعديل</span></button>" +
      '<span class="spacer"></span><button type="button" class="btn btn-sm btn-danger btn-icon" data-act="asset-delete" data-room="' + esc(room.id) + '" data-idx="' + idx + '" aria-label="حذف الأصل" title="حذف الأصل">' + ic("trash") + "</button></div>" +
      "</div></article>";
  }

  function staffCardHtml(room, emp, idx) {
    const avatarHtml = emp.customPhoto
      ? '<img src="' + esc(emp.customPhoto) + '" alt="' + esc(emp.name) + '"/>'
      : window.KitchenVisuals.getStaffAvatarSvg(emp.avatar || "executive-chef");
    const cv = emp.cv || {};
    const eduLine = [cv.education, cv.previousJobs || cv.summary].filter(Boolean).join(" — ") || "-";
    return '<article class="staff-card">' +
      '<div class="staff-head"><div class="avatar">' + avatarHtml + "</div>" +
      '<div class="staff-id"><h4 class="staff-name">' + esc(emp.name) + '</h4><div class="staff-position">' + esc(emp.position || "مختص تشغيل") + "</div>" +
      '<div class="staff-code">' + esc(emp.empCode || ("موظف-" + (idx + 1))) + "</div></div></div>" +
      '<div class="staff-facts">' +
      '<div class="fact"><span>تاريخ التعيين</span><strong dir="ltr" style="text-align:right">' + esc(emp.hireDate || "-") + "</strong></div>" +
      '<div class="fact"><span>الخبرة</span><strong>' + esc(cv.experienceYears || "-") + "</strong></div>" +
      '<div class="fact fact-wide"><span>الوردية</span><strong>' + esc(emp.shift || "-") + "</strong></div></div>" +
      '<div class="field"><span class="field-label">المهام بالغرفة</span><span class="field-text clamp-3" title="' + esc(emp.duties || "") + '">' + esc(emp.duties || "-") + "</span></div>" +
      '<div class="field field-muted"><span class="field-label">المؤهل والخبرة</span><span class="field-text clamp-2" title="' + esc(eduLine) + '">' + esc(eduLine) + "</span></div>" +
      '<div class="cert-line">' + ic("badge") + '<span class="clamp-2">' + esc(cv.certifications || "شهادة صحية سارية + هاسب") + "</span></div>" +
      '<div class="card-actions"><button type="button" class="btn btn-sm btn-soft" data-act="staff-cv" data-room="' + esc(room.id) + '" data-idx="' + idx + '">' + ic("user") + "<span>السيرة الذاتية</span></button>" +
      '<span class="spacer"></span>' +
      '<button type="button" class="btn btn-sm btn-icon edit-control" data-act="staff-edit" data-room="' + esc(room.id) + '" data-idx="' + idx + '" aria-label="تعديل الموظف" title="تعديل">' + ic("edit") + "</button>" +
      '<button type="button" class="btn btn-sm btn-danger btn-icon edit-control" data-act="staff-delete" data-room="' + esc(room.id) + '" data-idx="' + idx + '" aria-label="حذف الموظف" title="حذف">' + ic("trash") + "</button></div>" +
      "</article>";
  }

  function emptyStateHtml(text) {
    return '<div class="empty-state">' + ic("info") + "<span>" + text + "</span></div>";
  }

  function renderRoomDetail(roomId) {
    const room = getRoomById(roomId);
    if (!room) return;

    if (!Array.isArray(room.images) || room.images.length === 0) {
      room.images = window.KitchenVisuals.generateRoomDefaultImages(room);
    }
    room.image = room.images[0].url;

    const assets = room.assets || [];
    const staff = room.staff || [];

    $("roomDetailName").textContent = room.name;
    $("roomDetailCode").textContent = "غرفة " + (room.b52Code || "52");
    $("roomDetailCategory").textContent = room.category || "قسم تشغيلي";
    $("roomDetailDesc").textContent = room.description ||
      "قسم تشغيلي رئيسي ضمن منظومة مطبخ العزيزية المركزي مبنى 52، يعمل وفق معايير الجودة وسلامة الغذاء (HACCP).";
    $("roomDetailDesc").title = $("roomDetailDesc").textContent;

    $("roomDetailArea").textContent = room.area || "غير محدد";
    $("roomDetailTemp").textContent = room.temp || "20 درجة مئوية";
    const statusEl = $("roomDetailStatus");
    statusEl.textContent = room.status || "يعمل بكفاءة 100%";
    statusEl.className = "kpi-value " + (String(room.status || "").indexOf("صيانة") !== -1 ? "is-warn" : "is-ok");
    $("roomDetailAssetsCountKpi").textContent = assets.length + " أصل · " + staff.length + " موظف";

    renderRoomGallery(room);

    $("roomAssetsCountPill").textContent = assets.length;
    const tabAssetsPill = $("roomTabAssetsBadge");
    if (tabAssetsPill) tabAssetsPill.textContent = assets.length;
    $("roomAssetsList").innerHTML = assets.length === 0
      ? emptyStateHtml("لا توجد أصول مسجلة في هذا القسم. اضغط على «+ أصل» لإضافة معدة وصورتها.")
      : assets.map(function (ast, idx) { return assetCardHtml(room, ast, idx); }).join("");

    $("roomStaffCountPill").textContent = staff.length;
    const tabStaffPill = $("roomTabStaffBadge");
    if (tabStaffPill) tabStaffPill.textContent = staff.length;
    $("roomStaffList").innerHTML = staff.length === 0
      ? emptyStateHtml("لا يوجد موظفون مسجلون في هذا القسم. اضغط على «+ موظف» لإضافة بياناته.")
      : staff.map(function (emp, idx) { return staffCardHtml(room, emp, idx); }).join("");

    setRoomTab(state.activeRoomTab || "overview");
  }

  function renderRoomGallery(room) {
    const images = room.images || [];
    if (images.length === 0) return;
    state.activeRoomPhotoIdx = Math.max(0, Math.min(state.activeRoomPhotoIdx, images.length - 1));
    const currentImg = images[state.activeRoomPhotoIdx];
    const many = images.length > 1;
    const generated = isGenerated(currentImg.url);

    const photoEl = $("roomDetailPhoto");
    photoEl.src = currentImg.url;
    photoEl.alt = currentImg.caption || room.name;
    $("roomPhotoCounter").textContent = "صورة " + (state.activeRoomPhotoIdx + 1) + " من " + images.length;
    $("roomPhotoCaption").textContent = currentImg.caption || (room.name + " — صورة " + (state.activeRoomPhotoIdx + 1));
    $("btnDeleteRoomPhoto").style.display = many ? "" : "none";
    $("roomPrevPhotoBtn").style.display = many ? "" : "none";
    $("roomNextPhotoBtn").style.display = many ? "" : "none";

    const stage = $("roomSinglePhotoStage");
    stage.classList.toggle("is-light", generated);
    stage.classList.toggle("is-contain", !generated);
    $("roomIllusBadge").hidden = !generated;

    const isGrid = state.roomViewMode === "grid";
    stage.style.display = isGrid ? "none" : "flex";
    $("roomGridPhotoStage").style.display = isGrid ? "grid" : "none";
    const toggleBtn = $("btnToggleRoomViewMode");
    toggleBtn.style.display = many ? "" : "none";
    toggleBtn.innerHTML = isGrid
      ? ic("single") + '<span class="btn-label">عرض منفرد</span>'
      : ic("grid") + '<span class="btn-label">عرض الشبكة (' + images.length + ")</span>";

    $("roomStripWrap").hidden = !many || isGrid;
    $("roomThumbnailsStrip").innerHTML = images.map(function (imgObj, idx) {
      const cap = imgObj.caption || ("صورة " + (idx + 1));
      return '<button type="button" class="thumb' + (idx === state.activeRoomPhotoIdx ? " active" : "") + '" data-act="room-select" data-idx="' + idx + '" title="' + esc(cap) + '" aria-label="' + esc(cap) + '">' +
        '<img class="' + (isGenerated(imgObj.url) ? "is-generated" : "") + '" src="' + esc(imgObj.url) + '" alt="" /><span class="thumb-index">' + (idx + 1) + "</span></button>";
    }).join("") +
      '<button type="button" class="thumb-add edit-control" data-act="room-add" title="إضافة صور للغرفة">' + ic("plus") + "<span>إضافة</span></button>";

    $("roomGridPhotoStage").innerHTML = images.map(function (imgObj, idx) {
      const cap = imgObj.caption || (room.name + " — صورة " + (idx + 1));
      return '<figure class="grid-card">' +
        '<img class="' + (isGenerated(imgObj.url) ? "is-generated" : "") + '" src="' + esc(imgObj.url) + '" alt="' + esc(cap) + '" data-act="room-lightbox" data-idx="' + idx + '" />' +
        '<figcaption class="grid-card-foot"><span title="' + esc(cap) + '"><strong>' + (idx + 1) + ".</strong> " + esc(cap) + "</span>" +
        '<div class="grid-card-actions"><button type="button" class="btn btn-sm" data-act="room-select" data-idx="' + idx + '">عرض منفرد</button>' +
        '<button type="button" class="btn btn-sm btn-danger btn-icon edit-control" data-act="room-photo-delete" data-idx="' + idx + '" aria-label="حذف الصورة">' + ic("trash") + "</button></div></figcaption></figure>";
    }).join("");
  }

  function selectRoomPhoto(idx) {
    state.activeRoomPhotoIdx = idx;
    state.roomViewMode = "single";
    const room = getRoomById(state.activeRoomId);
    if (room) renderRoomGallery(room);
  }

  function stepRoomPhoto(dir) {
    const room = getRoomById(state.activeRoomId);
    if (!room || !room.images || room.images.length <= 1) return;
    state.activeRoomPhotoIdx = (state.activeRoomPhotoIdx + dir + room.images.length) % room.images.length;
    renderRoomGallery(room);
  }

  function toggleRoomViewMode() {
    state.roomViewMode = (state.roomViewMode === "single") ? "grid" : "single";
    const room = getRoomById(state.activeRoomId);
    if (room) renderRoomGallery(room);
  }

  function openCurrentRoomLightbox() {
    openRoomLightboxByIndex(state.activeRoomPhotoIdx);
  }

  function openRoomLightboxByIndex(idx) {
    const room = getRoomById(state.activeRoomId);
    if (!room || !room.images || !room.images[idx]) return;
    const item = room.images[idx];
    openPhotoLightbox(item.url, item.caption || room.name);
  }

  function openAssetLightbox(roomId, assetIdx) {
    const room = getRoomById(roomId);
    if (!room || !room.assets || !room.assets[assetIdx]) return;
    const ast = room.assets[assetIdx];
    const imgSrc = ast.image || window.KitchenVisuals.generateAssetImageDataUrl(ast.name, ast["function"], room.color);
    openPhotoLightbox(imgSrc, ast.name + " — " + room.name);
  }

  function triggerQuickRoomPhotoUpload() {
    const input = $("quickRoomPhotoUpload");
    if (input) input.click();
  }

  function handleQuickRoomPhotoChange(input) {
    if (!input.files || !input.files[0] || !state.activeRoomId) return;
    const room = getRoomById(state.activeRoomId);
    if (!room) return;
    const file = input.files[0];
    readImageFileAsDataUrl(file, 1400, function (dataUrl) {
      if (!Array.isArray(room.images) || room.images.length === 0) {
        room.images = window.KitchenVisuals.generateRoomDefaultImages(room);
      }
      const idx = state.activeRoomPhotoIdx;
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      room.images[idx] = {
        id: "rm-img-" + Date.now(),
        url: dataUrl,
        caption: room.name + " — " + (cleanName || ("صورة " + (idx + 1)))
      };
      room.image = room.images[0].url;
      input.value = "";
      saveData("تم تغيير صورة الغرفة");
    });
  }

  function triggerAddRoomPhotos() {
    const input = $("addRoomMultiPhotoUpload");
    if (input) input.click();
  }

  function handleAddRoomPhotos(input) {
    if (!input.files || !input.files.length || !state.activeRoomId) return;
    const room = getRoomById(state.activeRoomId);
    if (!room) return;
    if (!Array.isArray(room.images)) room.images = [];

    const files = Array.from(input.files);
    let processed = 0;
    files.forEach(function (file) {
      readImageFileAsDataUrl(file, 1400, function (dataUrl) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        room.images.push({
          id: "rm-img-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          url: dataUrl,
          caption: room.name + " — " + (cleanName || ("صورة " + (room.images.length + 1)))
        });
        processed++;
        if (processed === files.length) {
          room.image = room.images[0].url;
          state.activeRoomPhotoIdx = room.images.length - 1;
          state.roomViewMode = "single";
          input.value = "";
          saveData("تمت إضافة " + files.length + " صورة جديدة للغرفة");
        }
      });
    });
  }

  function deleteCurrentRoomPhoto() {
    deleteRoomPhotoByIndex(state.activeRoomPhotoIdx);
  }

  async function deleteRoomPhotoByIndex(idx) {
    const room = getRoomById(state.activeRoomId);
    if (!room || !Array.isArray(room.images)) return;
    if (room.images.length <= 1) {
      showToast("يجب الإبقاء على صورة واحدة على الأقل للغرفة. يمكنك استبدالها بزر «تغيير الصورة».", "error");
      return;
    }
    const ok = await confirmDialog("هل تريد حذف هذه الصورة من معرض الغرفة؟", { title: "حذف صورة", okText: "حذف" });
    if (!ok) return;
    room.images.splice(idx, 1);
    state.activeRoomPhotoIdx = Math.min(state.activeRoomPhotoIdx, room.images.length - 1);
    room.image = room.images[0].url;
    saveData("تم حذف الصورة من معرض الغرفة");
  }

  // --------------------------------------------------------------------------
  // تبويبات بطاقة الغرفة (نظرة عامة | أصول | موظفون) لدعم البروجكتور والشاشات المختلفة
  // --------------------------------------------------------------------------
  function setRoomTab(tab) {
    const valid = (tab === "assets" || tab === "staff") ? tab : "overview";
    state.activeRoomTab = valid;
    const layout = $("roomLayout");
    if (layout) layout.setAttribute("data-tab", valid);
    const tabs = [
      { key: "overview", btn: $("tabBtnOverview") },
      { key: "assets", btn: $("tabBtnAssets") },
      { key: "staff", btn: $("tabBtnStaff") }
    ];
    tabs.forEach(function (t) {
      if (t.btn) {
        const active = (t.key === valid);
        t.btn.classList.toggle("active", active);
        t.btn.setAttribute("aria-selected", active ? "true" : "false");
      }
    });
  }

  // --------------------------------------------------------------------------
  // تعتيم الشاشة للمتحدث (Blackout) بمفتاح B
  // --------------------------------------------------------------------------
  function toggleBlackout(force) {
    const box = $("speakerBlackout");
    if (!box) return;
    const next = (typeof force === "boolean") ? force : box.hidden;
    box.hidden = !next;
    state.isBlackout = next;
    const btn = $("btnBlackout");
    if (btn) btn.classList.toggle("btn-accent", next);
    if (next) {
      box.focus();
      const msg = box.querySelector(".speaker-blackout-msg");
      if (msg) {
        msg.style.animation = "none";
        void msg.offsetWidth;
        msg.style.animation = "";
      }
    }
  }

  // --------------------------------------------------------------------------
  // إخفاء مؤشر الفأرة تلقائياً بعد 3 ثوانٍ من عدم الحركة
  // --------------------------------------------------------------------------
  let cursorHideTimer = null;
  function resetCursorHideTimer() {
    document.body.classList.remove("hide-cursor");
    if (cursorHideTimer) clearTimeout(cursorHideTimer);
    cursorHideTimer = setTimeout(function () {
      if (!modalStack.length && !state.isBlackout) {
        document.body.classList.add("hide-cursor");
      }
    }, 3000);
  }

  // --------------------------------------------------------------------------
  // الجولة التقديمية الاسترشادية (Guided Presentation Tour)
  // --------------------------------------------------------------------------
  function getTourStops() {
    if (state.data && Array.isArray(state.data.tourOrder) && state.data.tourOrder.length > 0) {
      return state.data.tourOrder;
    }
    return [
      { type: "slide", slide: "exterior", title: "الواجهة المعمارية لمبنى 52" },
      { type: "slide", slide: "croquis", title: "الخريطة الكروكية الشاملة للأقسام" },
      { type: "room", roomId: "central-warehouse-52", title: "المستودع المركزي 52 (غرفة 153/154)" },
      { type: "room", roomId: "central-cooling-fridge", title: "ثلاجة التبريد المركزية" },
      { type: "room", roomId: "freezer-room", title: "غرفة التجميد العميق" },
      { type: "room", roomId: "hot-kitchen-main", title: "المطبخ الساخن — صالة الطبخ الرئيسية 174" },
      { type: "room", roomId: "meat-cutting-room", title: "قسم تقطيع اللحوم — المجزر الداخلي" },
      { type: "room", roomId: "bakery-section", title: "قسم المخبوزات والحلواني" },
      { type: "room", roomId: "water-desalination-147", title: "محطة تحلية وتنقية المياه" },
      { type: "room", roomId: "control-room-center", title: "غرفة التحكم المركزية والسلامة" },
      { type: "slide", slide: "evacuation", title: "المخطط الهندسي ومسارات الإخلاء" },
      { type: "slide", slide: "exterior", title: "ملخص العرض الاستثماري والتشغيلي" }
    ];
  }

  function startTour() {
    state.tourActive = true;
    state.tourIndex = 0;
    const banner = $("tourProgressBanner");
    if (banner) banner.hidden = false;
    applyTourStop();
  }

  function applyTourStop() {
    if (!state.tourActive) return;
    const stops = getTourStops();
    if (state.tourIndex < 0 || state.tourIndex >= stops.length) return;
    const stop = stops[state.tourIndex];
    const banner = $("tourProgressBanner");
    if (banner) {
      banner.hidden = false;
      const badge = $("tourStepBadge");
      if (badge) badge.textContent = "محطة " + (state.tourIndex + 1) + " من " + stops.length;
      const titleEl = $("tourStepTitle");
      if (titleEl) titleEl.textContent = stop.title || "";
      const pct = Math.round(((state.tourIndex + 1) / stops.length) * 100);
      const bar = $("tourProgressBar");
      if (bar) bar.style.width = pct + "%";
    }

    if (stop.type === "slide") {
      goToSlide(stop.slide);
    } else if (stop.type === "room" && stop.roomId) {
      openRoomSlide(stop.roomId);
      setRoomTab("overview");
    }
  }

  function nextTourStop() {
    if (!state.tourActive) return;
    const stops = getTourStops();
    if (state.tourIndex < stops.length - 1) {
      state.tourIndex++;
      applyTourStop();
    } else {
      showToast("اكتملت الجولة التقديمية بنجاح");
      exitTour();
    }
  }

  function prevTourStop() {
    if (!state.tourActive) return;
    if (state.tourIndex > 0) {
      state.tourIndex--;
      applyTourStop();
    }
  }

  function exitTour() {
    state.tourActive = false;
    const banner = $("tourProgressBanner");
    if (banner) banner.hidden = true;
  }

  // --------------------------------------------------------------------------
  // الصور الفعلية الناقصة (وضع التحرير فقط)
  // --------------------------------------------------------------------------
  function updateMissingPhotosCount() {
    if (!state.data || !Array.isArray(state.data.rooms)) return 0;
    let missing = 0;
    state.data.rooms.forEach(function (room) {
      const hasReal = Array.isArray(room.images) && room.images.some(function (img) {
        return img && img.url && !isGenerated(img.url);
      });
      if (!hasReal) missing++;
    });
    const el = $("missingPhotosCount");
    if (el) el.textContent = missing;
    return missing;
  }

  function toggleMissingPhotosFilter() {
    state.filterMissingPhotosOnly = !state.filterMissingPhotosOnly;
    const btn = $("btnFilterMissingPhotos");
    if (btn) {
      btn.classList.toggle("btn-primary", state.filterMissingPhotosOnly);
      btn.classList.toggle("btn-soft", !state.filterMissingPhotosOnly);
      btn.setAttribute("aria-pressed", state.filterMissingPhotosOnly ? "true" : "false");
    }
    renderCroquisMap();
  }

  // --------------------------------------------------------------------------
  // السيرة الذاتية
  // --------------------------------------------------------------------------
  function openCvModal(roomId, staffIdx) {
    const room = getRoomById(roomId);
    if (!room || !room.staff || !room.staff[staffIdx]) return;
    const emp = room.staff[staffIdx];
    const cv = emp.cv || {};
    const avatarHtml = emp.customPhoto
      ? '<img src="' + esc(emp.customPhoto) + '" alt="' + esc(emp.name) + '"/>'
      : window.KitchenVisuals.getStaffAvatarSvg(emp.avatar || "executive-chef");

    const skillsList = Array.isArray(cv.skills)
      ? cv.skills
      : (cv.skills ? String(cv.skills).split(/[،,]+/) : ["سلامة الغذاء — هاسب", "التشغيل القياسي", "إدارة الجودة"]);

    const fact = function (label, value) {
      return '<div class="fact"><span>' + label + "</span><strong>" + esc(value || "-") + "</strong></div>";
    };

    $("cvModalBody").innerHTML =
      '<div class="cv-sheet" id="printableCvArea">' +
      '<div class="cv-banner"><div class="cv-avatar">' + avatarHtml + "</div><div>" +
      "<h2>" + esc(emp.name) + '</h2><div class="cv-position">' + esc(emp.position) + "</div>" +
      '<span class="cv-room">' + esc(room.name) + " — غرفة " + esc(room.b52Code || "52") + "</span></div></div>" +
      '<div class="cv-facts">' + fact("الرقم الوظيفي", emp.empCode) + fact("تاريخ التعيين", emp.hireDate) + fact("الوردية", emp.shift) + "</div>" +
      '<div class="cv-block"><h4>النبذة المهنية</h4><p>' + esc(cv.summary || emp.duties || "-") + "</p></div>" +
      '<div class="cv-block"><h4>المهام والمسؤوليات التشغيلية داخل القسم</h4><p>' + esc(emp.duties || "-") + "</p></div>" +
      '<div class="cv-cols">' +
      '<div class="cv-block"><h4>المؤهل العلمي وسنوات الخبرة</h4><p><strong>المؤهل:</strong> ' + esc(cv.education || "-") + "</p><p><strong>الخبرة العملية:</strong> " + esc(cv.experienceYears || "-") + "</p></div>" +
      '<div class="cv-block"><h4>الشهادات المهنية والصحية</h4><p>' + esc(cv.certifications || "شهادة صحية سارية + شهادة سلامة الغذاء") + "</p></div></div>" +
      '<div class="cv-block"><h4>الخبرات وأماكن العمل السابقة</h4><p>' + esc(cv.previousJobs || "-") + "</p></div>" +
      '<div class="cv-block"><h4>المهارات الفنية والتخصصية</h4><div class="cv-skills">' +
      skillsList.map(function (sk) { return '<span class="cv-skill">' + esc(String(sk).trim()) + "</span>"; }).join("") + "</div></div>" +
      "</div>";
    openModal("cvModal");
  }

  // --------------------------------------------------------------------------
  // إضافة / تعديل أصل
  // --------------------------------------------------------------------------
  let editingAssetContext = { roomId: null, assetIdx: null, imageBase64: null };

  function openAssetModal(roomId, assetIdx) {
    const targetRoomId = roomId || state.activeRoomId;
    const room = getRoomById(targetRoomId);
    if (!room) return;

    editingAssetContext = { roomId: targetRoomId, assetIdx: assetIdx, imageBase64: null };
    const isEdit = (assetIdx !== null && assetIdx !== undefined && room.assets[assetIdx]);
    const today = new Date().toISOString().slice(0, 10);
    const ast = isEdit ? room.assets[assetIdx] : {
      name: "",
      code: "أصل-" + Math.floor(1000 + Math.random() * 9000),
      brand: "",
      installDate: today,
      lastMaintDate: today,
      nextMaintDate: "",
      status: "ممتاز",
      "function": "",
      specs: ""
    };

    $("assetModalTitle").textContent = isEdit
      ? "تعديل الأصل — " + ast.name
      : "إضافة أصل / معدة جديدة في: " + room.name;

    $("astName").value = ast.name || "";
    $("astCode").value = ast.code || "";
    $("astBrand").value = ast.brand || "";
    $("astStatus").value = ast.status || "ممتاز";
    $("astInstallDate").value = ast.installDate || "";
    $("astLastMaint").value = ast.lastMaintDate || "";
    $("astNextMaint").value = ast.nextMaintDate || "";
    $("astFunction").value = ast["function"] || "";
    $("astSpecs").value = ast.specs || "";
    $("astPhotoInput").value = "";
    $("astName").classList.remove("is-invalid");

    const previewImg = $("astPhotoPreview");
    if (isEdit && ast.image && !isGenerated(ast.image)) {
      previewImg.src = ast.image;
      previewImg.style.display = "block";
    } else {
      previewImg.style.display = "none";
    }

    openModal("assetModal");
  }

  function handleAssetPhotoFile(input) {
    if (!input.files || !input.files[0]) return;
    readImageFileAsDataUrl(input.files[0], 900, function (dataUrl) {
      editingAssetContext.imageBase64 = dataUrl;
      const previewImg = $("astPhotoPreview");
      previewImg.src = dataUrl;
      previewImg.style.display = "block";
    });
  }

  function saveAssetForm() {
    const room = getRoomById(editingAssetContext.roomId);
    if (!room) return;
    if (!requireField("astName", "يرجى إدخال اسم الأصل / المعدة.")) return;

    const name = $("astName").value.trim();
    const funcText = $("astFunction").value.trim();
    const isEdit = (editingAssetContext.assetIdx !== null && editingAssetContext.assetIdx !== undefined);
    const existing = isEdit ? room.assets[editingAssetContext.assetIdx] : {};
    const today = new Date().toISOString().slice(0, 10);

    const newAsset = {
      id: existing.id || ("AST-" + Date.now()),
      name: name,
      code: $("astCode").value.trim() || "أصل-52",
      brand: $("astBrand").value.trim() || "قياسي معتمد",
      status: $("astStatus").value,
      installDate: $("astInstallDate").value || today,
      lastMaintDate: $("astLastMaint").value || today,
      nextMaintDate: $("astNextMaint").value || "",
      "function": funcText || "معدة تشغيلية أساسية ضمن خط إنتاج الغرفة.",
      specs: $("astSpecs").value.trim(),
      image: editingAssetContext.imageBase64 ||
        (existing.image && !isGenerated(existing.image) ? existing.image : window.KitchenVisuals.generateAssetImageDataUrl(name, funcText, room.color))
    };

    if (!Array.isArray(room.assets)) room.assets = [];
    if (isEdit) room.assets[editingAssetContext.assetIdx] = newAsset;
    else room.assets.push(newAsset);

    closeModal("assetModal");
    saveData(isEdit ? "تم تحديث بيانات الأصل" : "تمت إضافة الأصل إلى الغرفة");
  }

  async function deleteAsset(roomId, assetIdx) {
    const room = getRoomById(roomId);
    if (!room || !room.assets || !room.assets[assetIdx]) return;
    const ok = await confirmDialog("هل تريد حذف «" + room.assets[assetIdx].name + "» من هذه الغرفة؟", { title: "حذف أصل", okText: "حذف" });
    if (!ok) return;
    room.assets.splice(assetIdx, 1);
    saveData("تم حذف الأصل من الغرفة");
  }

  // --------------------------------------------------------------------------
  // إضافة / تعديل موظف
  // --------------------------------------------------------------------------
  let editingStaffContext = { roomId: null, staffIdx: null, selectedAvatar: "executive-chef", customPhotoBase64: null };

  function openStaffModal(roomId, staffIdx) {
    const targetRoomId = roomId || state.activeRoomId;
    const room = getRoomById(targetRoomId);
    if (!room) return;

    const isEdit = (staffIdx !== null && staffIdx !== undefined && room.staff[staffIdx]);
    const emp = isEdit ? room.staff[staffIdx] : {
      name: "",
      empCode: "موظف-" + Math.floor(1000 + Math.random() * 9000),
      position: "",
      hireDate: new Date().toISOString().slice(0, 10),
      shift: "الوردية الصباحية — 06:00 ص - 02:00 م",
      avatar: "hot-chef",
      duties: "",
      cv: {
        education: "",
        experienceYears: "",
        previousJobs: "",
        certifications: "شهادة سلامة الغذاء هاسب — شهادة صحية سارية",
        skills: ["سلامة الغذاء", "إدارة التشغيل", "الالتزام بمعايير الجودة"],
        summary: ""
      }
    };

    editingStaffContext = {
      roomId: targetRoomId,
      staffIdx: staffIdx,
      selectedAvatar: emp.avatar || "hot-chef",
      customPhotoBase64: emp.customPhoto || null
    };

    $("staffModalTitle").textContent = isEdit
      ? "تعديل بيانات الموظف — " + emp.name
      : "إضافة موظف جديد في: " + room.name;

    $("empName").value = emp.name || "";
    $("empCode").value = emp.empCode || "";
    $("empPosition").value = emp.position || "";
    $("empHireDate").value = emp.hireDate || "";
    $("empShift").value = emp.shift || "الوردية الصباحية — 06:00 ص - 02:00 م";
    $("empDuties").value = emp.duties || "";

    const cv = emp.cv || {};
    $("empEducation").value = cv.education || "";
    $("empExpYears").value = cv.experienceYears || "";
    $("empPrevJobs").value = cv.previousJobs || "";
    $("empCerts").value = cv.certifications || "";
    $("empSkills").value = Array.isArray(cv.skills) ? cv.skills.join("، ") : (cv.skills || "");
    $("empSummary").value = cv.summary || "";
    $("empPhotoInput").value = "";
    $("empName").classList.remove("is-invalid");
    $("empPosition").classList.remove("is-invalid");

    renderAvatarPickerGrid();
    openModal("staffModal");
  }

  function renderAvatarPickerGrid() {
    const grid = $("avatarPickerGrid");
    if (!grid) return;
    const avatars = window.KitchenVisuals.staffAvatars;
    grid.innerHTML = Object.keys(avatars).map(function (key) {
      const item = avatars[key];
      const isSelected = (editingStaffContext.selectedAvatar === key && !editingStaffContext.customPhotoBase64);
      return '<button type="button" role="radio" aria-checked="' + isSelected + '" class="avatar-option' + (isSelected ? " selected" : "") + '" data-act="avatar" data-key="' + esc(key) + '">' +
        item.svg + "<span>" + esc(item.label) + "</span></button>";
    }).join("");
  }

  function selectStaffAvatar(key) {
    editingStaffContext.selectedAvatar = key;
    editingStaffContext.customPhotoBase64 = null;
    renderAvatarPickerGrid();
  }

  function handleStaffPhotoFile(input) {
    if (!input.files || !input.files[0]) return;
    readImageFileAsDataUrl(input.files[0], 450, function (dataUrl) {
      editingStaffContext.customPhotoBase64 = dataUrl;
      renderAvatarPickerGrid();
      showToast("تم اختيار الصورة الشخصية للموظف");
    });
  }

  function saveStaffForm() {
    const room = getRoomById(editingStaffContext.roomId);
    if (!room) return;
    if (!requireField("empName", "يرجى إدخال اسم الموظف.")) return;
    if (!requireField("empPosition", "يرجى إدخال المنصب الوظيفي.")) return;

    const isEdit = (editingStaffContext.staffIdx !== null && editingStaffContext.staffIdx !== undefined);
    const existing = isEdit ? room.staff[editingStaffContext.staffIdx] : {};
    const skillsRaw = $("empSkills").value.trim();
    const skillsArr = skillsRaw ? skillsRaw.split(/[،,]+/).map(function (s) { return s.trim(); }).filter(Boolean) : ["سلامة الغذاء"];

    const newStaff = {
      id: existing.id || ("EMP-" + Date.now()),
      name: $("empName").value.trim(),
      empCode: $("empCode").value.trim() || "موظف-52",
      position: $("empPosition").value.trim(),
      hireDate: $("empHireDate").value || new Date().toISOString().slice(0, 10),
      shift: $("empShift").value,
      avatar: editingStaffContext.selectedAvatar || "hot-chef",
      customPhoto: editingStaffContext.customPhotoBase64 || null,
      duties: $("empDuties").value.trim() || "القيام بالمهام التشغيلية المعتمدة داخل الغرفة وفق معايير الجودة.",
      cv: {
        education: $("empEducation").value.trim() || "دبلوم تخصصي معتمد",
        experienceYears: $("empExpYears").value.trim() || "—",
        previousJobs: $("empPrevJobs").value.trim() || "خبرة سابقة في المطابخ المركزية والفندقية الكبرى",
        certifications: $("empCerts").value.trim() || "شهادة سلامة الغذاء هاسب — شهادة صحية سارية",
        skills: skillsArr,
        summary: $("empSummary").value.trim() || "كفاءة مهنية متميزة في تشغيل المطبخ المركزي والالتزام بمعايير سلامة الغذاء."
      }
    };

    if (!Array.isArray(room.staff)) room.staff = [];
    if (isEdit) room.staff[editingStaffContext.staffIdx] = newStaff;
    else room.staff.push(newStaff);

    closeModal("staffModal");
    saveData(isEdit ? "تم تحديث بيانات الموظف" : "تمت إضافة الموظف إلى الغرفة");
  }

  async function deleteStaff(roomId, staffIdx) {
    const room = getRoomById(roomId);
    if (!room || !room.staff || !room.staff[staffIdx]) return;
    const ok = await confirmDialog("هل تريد حذف بيانات «" + room.staff[staffIdx].name + "» من هذه الغرفة؟", { title: "حذف موظف", okText: "حذف" });
    if (!ok) return;
    room.staff.splice(staffIdx, 1);
    saveData("تم حذف الموظف من الغرفة");
  }

  // --------------------------------------------------------------------------
  // تعديل بيانات الغرفة أو إضافة غرفة جديدة
  // --------------------------------------------------------------------------
  let editingRoomContext = { roomId: null, isNew: false, newPhotos: [] };

  function openRoomModal(roomId) {
    const targetId = (roomId === "current") ? state.activeRoomId : roomId;
    const isNew = !targetId;
    const room = isNew ? {
      name: "", mapLabel: "", b52Code: "", category: "الإنتاج والطبخ", color: "#3B6998", textColor: "#ffffff",
      area: "80 متر مربع", temp: "18 درجة مئوية", status: "يعمل بكفاءة 100%", description: "",
      x: 10, y: 10, w: 12, h: 14
    } : getRoomById(targetId);

    if (!room) return;
    editingRoomContext = { roomId: targetId, isNew: isNew, newPhotos: [] };

    $("roomModalTitle").textContent = isNew
      ? "إضافة قسم / غرفة جديدة إلى الخريطة الكروكية"
      : "تعديل بيانات القسم — " + room.name;

    $("rmName").value = room.name || "";
    $("rmMapLabel").value = room.mapLabel || room.name || "";
    $("rmCode").value = room.b52Code || "";
    $("rmCategory").value = room.category || "الإنتاج والطبخ";
    $("rmArea").value = room.area || "";
    $("rmTemp").value = room.temp || "";
    $("rmStatus").value = room.status || "يعمل بكفاءة 100%";
    $("rmColor").value = safeColor(room.color, "#3B6998").slice(0, 7);
    $("rmDesc").value = room.description || "";
    $("rmX").value = room.x !== undefined ? room.x : 10;
    $("rmY").value = room.y !== undefined ? room.y : 10;
    $("rmW").value = room.w !== undefined ? room.w : 12;
    $("rmH").value = room.h !== undefined ? room.h : 14;
    $("rmPhotoInput").value = "";
    $("rmName").classList.remove("is-invalid");

    let del = $("btnDeleteRoom");
    if (!del) {
      del = document.createElement("button");
      del.type = "button";
      del.id = "btnDeleteRoom";
      del.className = "btn btn-danger";
      del.style.marginInlineEnd = "auto";
      del.setAttribute("data-act", "room-delete");
      del.innerHTML = ic("trash") + "<span>حذف القسم</span>";
      $("roomModal").querySelector(".modal-footer").prepend(del);
    }
    del.hidden = isNew;

    openModal("roomModal");
  }

  function handleRoomPhotoFile(input) {
    if (!input.files || !input.files.length) return;
    const files = Array.from(input.files);
    editingRoomContext.newPhotos = [];
    let count = 0;
    files.forEach(function (file) {
      readImageFileAsDataUrl(file, 1400, function (dataUrl) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        editingRoomContext.newPhotos.push({
          id: "rm-img-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          url: dataUrl,
          caption: cleanName || "صورة مرفوعة للقسم"
        });
        count++;
        if (count === files.length) showToast("تم تجهيز " + files.length + " صورة للغرفة — اضغط «حفظ» لإضافتها");
      });
    });
  }

  function clampPct(value, fallback, min) {
    return Math.max(min, Math.min(100, num(value, fallback)));
  }

  function saveRoomForm() {
    if (!requireField("rmName", "يرجى إدخال اسم الغرفة.")) return;
    const name = $("rmName").value.trim();

    const geo = {
      x: clampPct($("rmX").value, 10, 0),
      y: clampPct($("rmY").value, 10, 0),
      w: clampPct($("rmW").value, 12, 1),
      h: clampPct($("rmH").value, 14, 1)
    };

    if (editingRoomContext.isNew) {
      const newRoom = {
        id: "room-custom-" + Date.now(),
        name: name,
        mapLabel: $("rmMapLabel").value.trim() || name,
        b52Code: $("rmCode").value.trim() || "52",
        category: $("rmCategory").value,
        area: $("rmArea").value.trim() || "80 متر مربع",
        temp: $("rmTemp").value.trim() || "20 درجة مئوية",
        status: $("rmStatus").value.trim() || "يعمل بكفاءة 100%",
        color: $("rmColor").value || "#3B6998",
        textColor: "#ffffff",
        description: $("rmDesc").value.trim() || "قسم تشغيلي ضمن مشروع المطبخ المركزي 52.",
        x: geo.x, y: geo.y, w: geo.w, h: geo.h,
        assets: [],
        staff: []
      };
      newRoom.images = (editingRoomContext.newPhotos && editingRoomContext.newPhotos.length)
        ? editingRoomContext.newPhotos
        : window.KitchenVisuals.generateRoomDefaultImages(newRoom);
      newRoom.image = newRoom.images[0].url;
      state.data.rooms.push(newRoom);
      closeModal("roomModal");
      saveData("تمت إضافة القسم الجديد إلى الخريطة الكروكية");
      openRoomSlide(newRoom.id);
    } else {
      const room = getRoomById(editingRoomContext.roomId);
      if (!room) return;
      room.name = name;
      room.mapLabel = $("rmMapLabel").value.trim() || name;
      room.b52Code = $("rmCode").value.trim();
      room.category = $("rmCategory").value;
      room.area = $("rmArea").value.trim();
      room.temp = $("rmTemp").value.trim();
      room.status = $("rmStatus").value.trim();
      room.color = $("rmColor").value;
      room.description = $("rmDesc").value.trim();
      room.x = geo.x; room.y = geo.y; room.w = geo.w; room.h = geo.h;

      if (editingRoomContext.newPhotos && editingRoomContext.newPhotos.length) {
        if (!Array.isArray(room.images)) room.images = [];
        editingRoomContext.newPhotos.forEach(function (p) { room.images.push(p); });
        room.image = room.images[0].url;
        state.activeRoomPhotoIdx = room.images.length - 1;
      }
      closeModal("roomModal");
      saveData("تم حفظ تعديلات القسم");
      const pill = $("navPillRoom");
      if (pill && state.activeRoomId === room.id) pill.lastElementChild.textContent = room.name;
    }
  }

  async function deleteCurrentEditingRoom() {
    const room = getRoomById(editingRoomContext.roomId);
    if (!room) return;
    const ok = await confirmDialog("سيتم حذف القسم «" + room.name + "» وكل أصوله وموظفيه من الخريطة. لا يمكن التراجع إلا باستعادة نسخة احتياطية. هل تريد المتابعة؟", {
      title: "حذف القسم", okText: "حذف القسم"
    });
    if (!ok) return;
    state.data.rooms = state.data.rooms.filter(function (r) { return r.id !== room.id; });
    closeModal("roomModal");
    if (state.activeRoomId === room.id) {
      state.activeRoomId = null;
      $("navPillRoom").style.display = "none";
      goToSlide("croquis");
    }
    saveData("تم حذف القسم من الخريطة");
  }

  // --------------------------------------------------------------------------
  // الصور والنسخ الاحتياطي والتصدير
  // --------------------------------------------------------------------------
  function readImageFileAsDataUrl(file, maxWidth, callback) {
    const reader = new FileReader();
    reader.onerror = function () { showToast("تعذر قراءة الملف المحدد.", "error"); };
    reader.onload = function (e) {
      const img = new Image();
      img.onerror = function () { showToast("الملف المحدد ليس صورة صالحة.", "error"); };
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1600;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        const maxSide = Math.max(w, h);
        const limit = Math.min(maxWidth || MAX_DIM, MAX_DIM);
        if (maxSide > limit) {
          const ratio = limit / maxSide;
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        // حد أقصى 1600px للضلع الأطول، JPEG جودة 0.82
        callback(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function exportJsonBackup() {
    showToast("جارٍ تجهيز النسخة الاحتياطية الشاملة…");
    let dataStr = "";
    if (window.KitchenStorage) {
      dataStr = await window.KitchenStorage.exportFullBackupJson(state.data);
    } else {
      dataStr = JSON.stringify(state.data, null, 2);
    }
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "بيانات_مطبخ_العزيزية_المركزي_52.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    showToast("تم تحميل نسخة احتياطية شاملة لكافة البيانات والصور بنجاح");
  }

  function importJsonBackup(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
      input.value = "";
      const text = e.target.result;
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        showToast("تعذر قراءة ملف البيانات — تأكد أنه ملف JSON صحيح.", "error");
        return;
      }
      if (!parsed || !Array.isArray(parsed.rooms) || parsed.rooms.length === 0) {
        showToast("ملف البيانات غير صالح: يجب أن يحتوي على قائمة أقسام صحيحة.", "error");
        return;
      }
      const ok = await confirmDialog("سيتم استبدال البيانات الحالية بمحتوى الملف المستورد (" + parsed.rooms.length + " قسماً) وتخزين صوره الفعلية. هل تريد المتابعة؟", {
        title: "استيراد نسخة احتياطية", okText: "نعم، استيراد", danger: false
      });
      if (!ok) return;

      if (window.KitchenStorage) {
        try {
          const hydrated = await window.KitchenStorage.importBackupJson(text);
          state.data = hydrated;
        } catch (err) {
          console.warn("Storage import error, using parsed directly:", err);
          state.data = parsed;
        }
      } else {
        state.data = parsed;
      }

      normalizeData(state.data);
      state.activeRoomId = null;
      $("navPillRoom").style.display = "none";
      if (state.currentSlide === "room") goToSlide("croquis");
      await saveData("تم استيراد البيانات وتحديث العرض بنجاح");
    };
    reader.readAsText(file);
  }

  async function downloadPowerPoint() {
    const btn = $("btnPptx");
    if (btn.disabled) return;
    btn.disabled = true;
    showToast("جارٍ تجهيز ملف PowerPoint بكافة الصور والبيانات…");
    try {
      await window.PptxExporter.exportPresentationToPptx(state.data);
      showToast("تم تحميل ملف العرض (.pptx) بنجاح");
    } catch (err) {
      console.error(err);
      showToast("تعذّر تصدير ملف PowerPoint: " + (err && err.message ? err.message : "خطأ غير معروف"), "error");
    } finally {
      btn.disabled = false;
    }
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  // --------------------------------------------------------------------------
  // الأحداث العامة (تفويض الأحداث + لوحة المفاتيح)
  // --------------------------------------------------------------------------
  function handleAction(el) {
    const act = el.getAttribute("data-act");
    const idx = parseInt(el.getAttribute("data-idx"), 10);
    const roomId = el.getAttribute("data-room");
    switch (act) {
      case "filter": setCategoryFilter(el.getAttribute("data-cat")); break;
      case "ext-select": selectExteriorPhoto(idx); break;
      case "ext-lightbox": openExteriorLightboxByIndex(idx); break;
      case "ext-delete": deleteExteriorPhotoByIndex(idx); break;
      case "ext-add": $("extMultiPhotoUpload").click(); break;
      case "room-select": selectRoomPhoto(idx); break;
      case "room-lightbox": openRoomLightboxByIndex(idx); break;
      case "room-photo-delete": deleteRoomPhotoByIndex(idx); break;
      case "room-add": triggerAddRoomPhotos(); break;
      case "asset-lightbox": openAssetLightbox(roomId, idx); break;
      case "asset-edit": openAssetModal(roomId, idx); break;
      case "asset-delete": deleteAsset(roomId, idx); break;
      case "staff-cv": openCvModal(roomId, idx); break;
      case "staff-edit": openStaffModal(roomId, idx); break;
      case "staff-delete": deleteStaff(roomId, idx); break;
      case "avatar": selectStaffAvatar(el.getAttribute("data-key")); break;
      case "room-delete": deleteCurrentEditingRoom(); break;
      case "evac-upload": $("evacPhotoUpload").click(); break;
      case "evac-reset": resetEvacPhoto(); break;
    }
  }

  function isTypingTarget(t) {
    if (!t || !t.tagName) return false;
    const tag = t.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
  }

  function onKeyDown(e) {
    if (e.key === "Tab") trapFocus(e);

    // تجاهل تكرار الضغط المستمر (auto-repeat) لمنع الإلغاء الفوري
    if (e.repeat) return;

    // فحص ما إذا كان المفتاح المضغوط هو مفتاح B بأي لغة أو كود
    const isKeyB = (e.code === "KeyB") ||
      (e.key === "b" || e.key === "B" || e.key === "لا" || e.key === "لآ" || e.key === "لأ" || e.key === "لإ");

    // إذا كانت الشاشة معتمة للمتحدث: أي نقرة أو B أو Esc تلغي التعتيم
    if (state.isBlackout) {
      if (isKeyB || e.key === "Escape" || e.key === " " || e.key === "Enter") {
        toggleBlackout(false);
        e.preventDefault();
        return;
      }
    }

    if (e.key === "Escape") {
      if (state.tourActive) {
        exitTour();
        return;
      }
      if (modalStack.length) {
        const id = topModalId();
        if (id === "confirmModal") resolveConfirm(false); else closeModal(id);
        return;
      }
      const menu = $("moreMenu");
      if (menu && !menu.hidden) { closeMoreMenu(); $("btnMore").focus(); return; }
      if (isTypingTarget(e.target)) { e.target.blur(); return; }
      if (state.currentSlide === "room") goToSlide("croquis");
      else if (state.currentSlide === "croquis" || state.currentSlide === "evacuation") goToSlide("exterior");
      return;
    }

    // تفعيل تعتيم الشاشة بمفتاح B طالما لا نكتب في حقل إدخال
    if (isKeyB && !isTypingTarget(e.target)) {
      toggleBlackout();
      e.preventDefault();
      return;
    }

    if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey || modalStack.length) return;

    // التنقل أثناء الجولة التقديمية
    if (state.tourActive) {
      if (e.key === " " || e.key === "ArrowLeft" || e.key === "PageDown" || e.key === "n" || e.key === "N") {
        nextTourStop();
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageUp" || e.key === "p" || e.key === "P") {
        prevTourStop();
        e.preventDefault();
        return;
      }
    }

    // في اتجاه RTL: السهم الأيسر = التالي، والسهم الأيمن = السابق
    const next = (e.key === "ArrowLeft" || e.key === "PageDown");
    const prev = (e.key === "ArrowRight" || e.key === "PageUp");
    if (next || prev) {
      if (state.currentSlide === "room") {
        navigateAdjacentRoom(next ? 1 : -1);
      } else {
        const i = SLIDE_ORDER.indexOf(state.currentSlide);
        const target = SLIDE_ORDER[i + (next ? 1 : -1)];
        if (target) goToSlide(target);
      }
      e.preventDefault();
      return;
    }

    if (e.key === "1" || e.key === "2" || e.key === "3") {
      goToSlide(SLIDE_ORDER[parseInt(e.key, 10) - 1]);
    } else if (e.key === "f" || e.key === "F" || e.key === "ب") {
      toggleFullScreen();
    } else if (e.key === "/" && state.currentSlide === "croquis") {
      e.preventDefault();
      $("croquisSearch").focus();
    }
  }

  async function init() {
    await loadData();
    refreshAll();
    updateStorageUsageDisplay();

    let saved = null;
    try { saved = localStorage.getItem(MODE_KEY); } catch (e) { /* تجاهل */ }
    applyInvestorMode(saved === "1", true);

    // تفويض النقرات للأزرار الديناميكية
    document.addEventListener("click", function (e) {
      const actEl = e.target.closest && e.target.closest("[data-act]");
      if (actEl) { handleAction(actEl); return; }

      const roomEl = e.target.closest && e.target.closest(".croquis-room");
      if (roomEl) { openRoomSlide(roomEl.getAttribute("data-room-id")); return; }

      if (!e.target.closest(".menu-wrap")) closeMoreMenu();
    });

    // إغلاق النافذة عند الضغط على الخلفية (بدء الضغط والإفلات على الخلفية معاً)
    let downOnBackdrop = null;
    document.addEventListener("mousedown", function (e) {
      downOnBackdrop = (e.target.classList && e.target.classList.contains("modal-backdrop")) ? e.target : null;
    });
    document.addEventListener("mouseup", function (e) {
      if (downOnBackdrop && e.target === downOnBackdrop) {
        if (downOnBackdrop.id === "confirmModal") resolveConfirm(false); else closeModal(downOnBackdrop.id);
      }
      downOnBackdrop = null;
    });

    // تلميح الخريطة الكروكية (فأرة + لوحة مفاتيح)
    const canvas = $("croquisCanvas");
    canvas.addEventListener("mouseover", function (e) {
      const el = e.target.closest(".croquis-room");
      if (el) showRoomTooltip(el, el.getAttribute("data-room-id"), { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener("mousemove", function (e) {
      const el = e.target.closest(".croquis-room");
      if (el) positionTooltip(el, { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener("mouseout", function (e) {
      const el = e.target.closest(".croquis-room");
      if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) hideTooltip();
    });
    canvas.addEventListener("focusin", function (e) {
      const el = e.target.closest(".croquis-room");
      if (el) showRoomTooltip(el, el.getAttribute("data-room-id"), null);
    });
    canvas.addEventListener("focusout", hideTooltip);

    // ملء الشاشة: إخفاء الأشرطة وإظهارها عند الاقتراب من حافة الشاشة العلوية أو السفلية
    document.addEventListener("fullscreenchange", function () {
      document.body.classList.toggle("is-fullscreen", !!document.fullscreenElement);
      document.body.classList.remove("show-bars");
      closeMoreMenu();
    });
    document.addEventListener("mousemove", function (e) {
      resetCursorHideTimer();
      if (!document.fullscreenElement) return;
      const menuOpen = !$("moreMenu").hidden;
      const near = e.clientY < 70 || e.clientY > window.innerHeight - 50;
      document.body.classList.toggle("show-bars", near || menuOpen);
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("hashchange", function () {
      if (suppressHashEvent) { suppressHashEvent = false; return; }
      applyRoute();
    });
    window.addEventListener("resize", hideTooltip);

    if (location.hash) applyRoute();
  }

  return {
    init: init,
    goToSlide: goToSlide,
    openRoomSlide: openRoomSlide,
    navigateAdjacentRoom: navigateAdjacentRoom,
    setCategoryFilter: setCategoryFilter,
    setSearchQuery: setSearchQuery,
    toggleEvacOverlay: toggleEvacOverlay,
    toggleInvestorMode: toggleInvestorMode,
    toggleMoreMenu: toggleMoreMenu,
    closeMoreMenu: closeMoreMenu,
    openPhotoLightbox: openPhotoLightbox,
    openEvacLightbox: openEvacLightbox,
    renderEvacuationSlide: renderEvacuationSlide,
    handleEvacPhotoChange: handleEvacPhotoChange,
    resetEvacPhoto: resetEvacPhoto,
    // صور الواجهة
    stepExteriorPhoto: stepExteriorPhoto,
    toggleExteriorViewMode: toggleExteriorViewMode,
    openCurrentExteriorLightbox: openCurrentExteriorLightbox,
    handleExteriorPhotoChange: handleExteriorPhotoChange,
    handleAddExteriorPhotos: handleAddExteriorPhotos,
    deleteCurrentExteriorPhoto: deleteCurrentExteriorPhoto,
    // صور الغرفة
    stepRoomPhoto: stepRoomPhoto,
    toggleRoomViewMode: toggleRoomViewMode,
    openCurrentRoomLightbox: openCurrentRoomLightbox,
    triggerQuickRoomPhotoUpload: triggerQuickRoomPhotoUpload,
    handleQuickRoomPhotoChange: handleQuickRoomPhotoChange,
    triggerAddRoomPhotos: triggerAddRoomPhotos,
    handleAddRoomPhotos: handleAddRoomPhotos,
    deleteCurrentRoomPhoto: deleteCurrentRoomPhoto,
    // النوافذ والبيانات
    openAssetModal: openAssetModal,
    handleAssetPhotoFile: handleAssetPhotoFile,
    saveAssetForm: saveAssetForm,
    openStaffModal: openStaffModal,
    handleStaffPhotoFile: handleStaffPhotoFile,
    saveStaffForm: saveStaffForm,
    openRoomModal: openRoomModal,
    handleRoomPhotoFile: handleRoomPhotoFile,
    saveRoomForm: saveRoomForm,
    exportJsonBackup: exportJsonBackup,
    importJsonBackup: importJsonBackup,
    resetToDefaultData: resetToDefaultData,
    downloadPowerPoint: downloadPowerPoint,
    openModal: openModal,
    closeModal: closeModal,
    resolveConfirm: resolveConfirm,
    updateStorageUsageDisplay: updateStorageUsageDisplay,
    toggleFullScreen: toggleFullScreen,
    setRoomTab: setRoomTab,
    toggleBlackout: toggleBlackout,
    startTour: startTour,
    nextTourStop: nextTourStop,
    prevTourStop: prevTourStop,
    exitTour: exitTour,
    updateMissingPhotosCount: updateMissingPhotosCount,
    toggleMissingPhotosFilter: toggleMissingPhotosFilter
  };
})();

window.addEventListener("DOMContentLoaded", function () {
  window.KitchenApp.init();
});

// ============================================================================
// مكتبة الأيقونات والرسوم الهندسية والمعمارية — مشروع مطبخ العزيزية المركزي 52
// تدعم المشاهد المتعددة للغرف، رسوم المعدات الصناعية، والرموز المهنية للكادر البشري
// ============================================================================

window.KitchenVisuals = (function () {
  function escapeXml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // --------------------------------------------------------------------------
  // 1. أيقونات العاملين الاحترافية (توضح الزي الرسمي والتخصص المهني بدقة)
  // --------------------------------------------------------------------------
  const staffAvatars = {
    "executive-chef": {
      label: "شيف تنفيذي / رئيس طهاة",
      badgeColor: "#b45309",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#fef3c7" fill-opacity="0.45"/>
        <path d="M38 36 C33 21, 45 14, 52 20 C56 12, 64 12, 68 20 C75 14, 87 21, 82 36 Z" fill="#ffffff" stroke="#64748b" stroke-width="1.4"/>
        <rect x="38" y="34" width="44" height="8" rx="2.5" fill="#ffffff" stroke="#64748b" stroke-width="1.3"/>
        <line x1="41" y1="38" x2="79" y2="38" stroke="#b45309" stroke-width="1.8"/>
        <circle cx="60" cy="54" r="14" fill="#ead2b8" stroke="#94a3b8" stroke-width="1.1"/>
        <path d="M51 51 Q54 49 57 51 M63 51 Q66 49 69 51" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M53 58 Q60 61 67 58" stroke="#334155" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#64748b" stroke-width="1.4"/>
        <path d="M47 71 L60 85 L73 71" fill="none" stroke="#b45309" stroke-width="2"/>
        <line x1="54" y1="82" x2="54" y2="103" stroke="#cbd5e1" stroke-width="1.2"/>
        <line x1="66" y1="82" x2="66" y2="103" stroke="#cbd5e1" stroke-width="1.2"/>
        <circle cx="51" cy="86" r="2" fill="#b45309"/><circle cx="69" cy="86" r="2" fill="#b45309"/>
        <circle cx="51" cy="94" r="2" fill="#b45309"/><circle cx="69" cy="94" r="2" fill="#b45309"/>
        <circle cx="90" cy="90" r="13" fill="#b45309" stroke="#ffffff" stroke-width="2"/>
        <polygon points="90,82 92.2,86.8 97.5,87.4 93.5,90.8 94.6,96 90,93.2 85.4,96 86.5,90.8 82.5,87.4 87.8,86.8" fill="#ffffff"/>
      </svg>`
    },
    "hot-chef": {
      label: "طاهي المطبخ الساخن",
      badgeColor: "#9b2c2c",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#fee2e2" fill-opacity="0.4"/>
        <path d="M39 37 C34 23, 48 16, 60 19 C72 16, 86 23, 81 37 Z" fill="#ffffff" stroke="#64748b" stroke-width="1.3"/>
        <rect x="39" y="35" width="42" height="7" rx="2" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
        <circle cx="60" cy="54" r="14" fill="#e6c4a2" stroke="#94a3b8" stroke-width="1.1"/>
        <circle cx="54" cy="52" r="1.6" fill="#1e293b"/><circle cx="66" cy="52" r="1.6" fill="#1e293b"/>
        <path d="M55 60 Q60 63 65 60" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
        <path d="M48 71 L60 84 L72 71" fill="#dc2626"/>
        <circle cx="54" cy="88" r="1.8" fill="#e2e8f0"/><circle cx="66" cy="88" r="1.8" fill="#e2e8f0"/>
        <circle cx="54" cy="96" r="1.8" fill="#e2e8f0"/><circle cx="66" cy="96" r="1.8" fill="#e2e8f0"/>
        <circle cx="90" cy="90" r="13" fill="#9b2c2c" stroke="#ffffff" stroke-width="2"/>
        <path d="M90 81 C94 86, 96 90, 92 95 C90 97, 87 96, 86 93 C85 89, 88 85, 90 81 Z" fill="#fde68a"/>
      </svg>`
    },
    "butcher": {
      label: "جزار / أخصائي تقطيع لحوم",
      badgeColor: "#9f1239",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#fff1f2"/>
        <path d="M41 40 C41 24, 79 24, 79 40 Z" fill="#9f1239"/>
        <rect x="38" y="37" width="44" height="5" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.1"/>
        <circle cx="60" cy="54" r="14" fill="#dfc0a3" stroke="#94a3b8" stroke-width="1.1"/>
        <circle cx="54" cy="52" r="1.6" fill="#1e293b"/><circle cx="66" cy="52" r="1.6" fill="#1e293b"/>
        <path d="M55 59 Q60 62 65 59" stroke="#1e293b" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
        <path d="M42 72 L45 104 L75 104 L78 72 Z" fill="#9f1239"/>
        <line x1="48" y1="72" x2="48" y2="104" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.5"/>
        <circle cx="90" cy="90" r="13" fill="#9f1239" stroke="#ffffff" stroke-width="2"/>
        <rect x="83" y="85" width="10" height="6.5" rx="1" fill="#ffffff"/>
        <rect x="93" y="88" width="4.5" height="2.5" fill="#fde68a"/>
      </svg>`
    },
    "poultry-fish": {
      label: "أخصائي تقطيع دواجن وأسماك",
      badgeColor: "#0369a1",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#f0f9ff"/>
        <path d="M41 40 C41 24, 79 24, 79 40 Z" fill="#0369a1"/>
        <rect x="38" y="37" width="44" height="5" rx="2" fill="#ffffff" stroke="#bae6fd" stroke-width="1.1"/>
        <circle cx="60" cy="54" r="14" fill="#e6c4a2" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="50" r="1.6" fill="#0f172a"/><circle cx="66" cy="50" r="1.6" fill="#0f172a"/>
        <rect x="49" y="54" width="22" height="10" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.1"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
        <path d="M42 72 L45 104 L75 104 L78 72 Z" fill="#0369a1"/>
        <circle cx="90" cy="90" r="13" fill="#0369a1" stroke="#ffffff" stroke-width="2"/>
        <path d="M83 90 Q90 84 97 90 Q90 96 83 90 Z" fill="#ffffff"/>
      </svg>`
    },
    "baker": {
      label: "خباز / شيف مخبوزات وتنور",
      badgeColor: "#b45309",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#fffbeb"/>
        <path d="M38 37 C35 20, 85 20, 82 37 Z" fill="#ffffff" stroke="#d97706" stroke-width="1.3"/>
        <rect x="39" y="35" width="42" height="6" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.1"/>
        <circle cx="60" cy="54" r="14" fill="#e5b887" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="52" r="1.6" fill="#334155"/><circle cx="66" cy="52" r="1.6" fill="#334155"/>
        <path d="M55 59 Q60 63 65 59" stroke="#78350f" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
        <path d="M43 72 L46 104 L74 104 L77 72 Z" fill="#d97706"/>
        <circle cx="90" cy="90" r="13" fill="#b45309" stroke="#ffffff" stroke-width="2"/>
        <ellipse cx="90" cy="90" rx="7" ry="4.5" fill="#fef3c7"/>
      </svg>`
    },
    "cold-prep": {
      label: "شيف سلطات وعصائر وتحضير بارد",
      badgeColor: "#15803d",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#f0fdf4"/>
        <path d="M40 37 C37 21, 83 21, 80 37 Z" fill="#ffffff" stroke="#16a34a" stroke-width="1.3"/>
        <rect x="40" y="35" width="40" height="6" rx="2" fill="#15803d"/>
        <circle cx="60" cy="54" r="14" fill="#e6c4a2" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="52" r="1.6" fill="#1e293b"/><circle cx="66" cy="52" r="1.6" fill="#1e293b"/>
        <path d="M55 59 Q60 63 65 59" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
        <path d="M43 72 L46 104 L74 104 L77 72 Z" fill="#15803d"/>
        <circle cx="90" cy="90" r="13" fill="#15803d" stroke="#ffffff" stroke-width="2"/>
        <path d="M85 92 C85 86, 95 84, 95 91 C95 95, 88 96, 85 92 Z" fill="#ffffff"/>
      </svg>`
    },
    "warehouse": {
      label: "أمين مستودع / مشرف مخزون وإمداد",
      badgeColor: "#c2410c",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#fff7ed"/>
        <path d="M39 39 C39 23, 81 23, 81 39 Z" fill="#ea580c"/>
        <rect x="36" y="37" width="48" height="5" rx="2" fill="#9a3412"/>
        <circle cx="60" cy="54" r="14" fill="#dfc0a3" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="52" r="1.6" fill="#1e293b"/><circle cx="66" cy="52" r="1.6" fill="#1e293b"/>
        <path d="M55 60 Q60 63 65 60" stroke="#1e293b" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#334155"/>
        <path d="M40 72 L43 104 L77 104 L80 72 Z" fill="#ea580c"/>
        <rect x="43" y="83" width="34" height="3.5" fill="#fde047"/>
        <rect x="43" y="93" width="34" height="3.5" fill="#fde047"/>
        <circle cx="90" cy="90" r="13" fill="#c2410c" stroke="#ffffff" stroke-width="2"/>
        <rect x="84.5" y="84.5" width="11" height="11" rx="1.5" fill="#ffffff"/>
      </svg>`
    },
    "cold-chain": {
      label: "فني / مشرف ثلاجات وتبريد وتجميد",
      badgeColor: "#0284c7",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#e0f2fe" fill-opacity="0.55"/>
        <path d="M40 40 C40 24, 80 24, 80 40 Z" fill="#0369a1"/>
        <rect x="38" y="36" width="44" height="6" rx="3" fill="#0284c7"/>
        <circle cx="60" cy="54" r="14" fill="#e2b07e" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="52" r="1.6" fill="#0f172a"/><circle cx="66" cy="52" r="1.6" fill="#0f172a"/>
        <path d="M55 59 Q60 62 65 59" stroke="#0f172a" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#0369a1" stroke="#075985" stroke-width="1.4"/>
        <line x1="60" y1="71" x2="60" y2="104" stroke="#bae6fd" stroke-width="2"/>
        <circle cx="90" cy="90" r="13" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <line x1="90" y1="83" x2="90" y2="97" stroke="#ffffff" stroke-width="2"/>
        <line x1="83" y1="90" x2="97" y2="90" stroke="#ffffff" stroke-width="2"/>
      </svg>`
    },
    "engineer": {
      label: "مهندس تحكم وصيانة ومرافق فنية",
      badgeColor: "#475569",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#f1f5f9"/>
        <path d="M39 39 C39 23, 81 23, 81 39 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
        <rect x="36" y="37" width="48" height="4.5" rx="2" fill="#d97706"/>
        <circle cx="60" cy="54" r="14" fill="#e0ac69" stroke="#94a3b8" stroke-width="1"/>
        <rect x="49" y="49" width="9" height="5.5" rx="1.2" fill="none" stroke="#1e293b" stroke-width="1.5"/>
        <rect x="62" y="49" width="9" height="5.5" rx="1.2" fill="none" stroke="#1e293b" stroke-width="1.5"/>
        <line x1="58" y1="51.5" x2="62" y2="51.5" stroke="#1e293b" stroke-width="1.5"/>
        <path d="M55 60 Q60 63 65 60" stroke="#1e293b" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#334155"/>
        <polygon points="51,71 60,86 69,71" fill="#ffffff"/>
        <circle cx="90" cy="90" r="13" fill="#475569" stroke="#ffffff" stroke-width="2"/>
        <circle cx="90" cy="90" r="5" fill="none" stroke="#ffffff" stroke-width="2.2"/>
      </svg>`
    },
    "water-chem": {
      label: "أخصائي تحلية مياه ومواد كيميائية",
      badgeColor: "#0e7490",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#ecfeff"/>
        <path d="M40 39 C40 24, 80 24, 80 39 Z" fill="#0e7490"/>
        <rect x="38" y="37" width="44" height="4.5" rx="2" fill="#67e8f9"/>
        <circle cx="60" cy="54" r="14" fill="#e5b887" stroke="#94a3b8" stroke-width="1"/>
        <rect x="48" y="48" width="24" height="7" rx="3" fill="#e0f2fe" stroke="#0e7490" stroke-width="1.4"/>
        <path d="M55 60 Q60 63 65 60" stroke="#1e293b" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
        <polygon points="51,71 60,87 69,71" fill="#0e7490"/>
        <circle cx="90" cy="90" r="13" fill="#0e7490" stroke="#ffffff" stroke-width="2"/>
        <path d="M90 83 C94 88, 95 92, 90 96 C85 92, 86 88, 90 83 Z" fill="#ffffff"/>
      </svg>`
    },
    "steward": {
      label: "مشرف / فني غسيل وتعقيم مركزي",
      badgeColor: "#4338ca",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#eef2ff"/>
        <path d="M40 39 C40 24, 80 24, 80 39 Z" fill="#4338ca"/>
        <circle cx="60" cy="54" r="14" fill="#d9a066" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="52" r="1.6" fill="#1e293b"/><circle cx="66" cy="52" r="1.6" fill="#1e293b"/>
        <path d="M55 59 Q60 63 65 59" stroke="#1e293b" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
        <path d="M42 72 L45 104 L75 104 L78 72 Z" fill="#4338ca"/>
        <circle cx="90" cy="90" r="13" fill="#4338ca" stroke="#ffffff" stroke-width="2"/>
        <circle cx="90" cy="90" r="5" fill="#ffffff"/>
      </svg>`
    },
    "admin-quality": {
      label: "مدير إدارة / أخصائي جودة وسلامة غذاء",
      badgeColor: "#0f766e",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="50" fill="#f0fdfa"/>
        <path d="M44 44 C42 28, 78 28, 76 44 Z" fill="#1e293b"/>
        <circle cx="60" cy="54" r="14" fill="#e8b88a" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="54" cy="52" r="1.6" fill="#1e293b"/><circle cx="66" cy="52" r="1.6" fill="#1e293b"/>
        <path d="M55 59 Q60 62 65 59" stroke="#1e293b" stroke-width="1.5" fill="none"/>
        <path d="M27 104 C30 79, 44 71, 60 71 C76 71, 90 79, 93 104 Z" fill="#1e293b"/>
        <polygon points="51,71 60,91 69,71" fill="#ffffff"/>
        <polygon points="58,74 62,74 63,94 60,98 57,94" fill="#0f766e"/>
        <circle cx="90" cy="90" r="13" fill="#0f766e" stroke="#ffffff" stroke-width="2"/>
        <polyline points="84.5,90 88.5,94 95.5,85.5" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    }
  };

  function getStaffAvatarSvg(avatarKey) {
    if (staffAvatars[avatarKey]) {
      return staffAvatars[avatarKey].svg;
    }
    return staffAvatars["executive-chef"].svg;
  }

  function getStaffAvatarDataUrl(avatarKey) {
    const svg = getStaffAvatarSvg(avatarKey);
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  // --------------------------------------------------------------------------
  // 2. مولّد المشاهد المعمارية والهندسية للغرف (بدقة 1200x750 ودعم تعدد الصور)
  // --------------------------------------------------------------------------
  function generateRoomSceneDataUrl(room, viewIndex) {
    const vIdx = viewIndex || 0;
    const title = escapeXml(room.name || "غرفة المطبخ المركزي");
    const code = escapeXml(room.b52Code || "52");
    const cat = escapeXml(room.category || "قسم تشغيلي");
    const area = escapeXml(room.area || "90 متر مربع");
    const temp = escapeXml(room.temp || "18 درجة مئوية");

    // المشهد الثاني (viewIndex === 1): مخطط هندسي لتوزيع المعدات ومسارات العمل داخل الغرفة
    if (vIdx === 1) {
      // نفس نسبة الأبعاد 1200×750 (يعتمدها مُصدِّر PowerPoint) مع قص الهوامش الفارغة وإزالة الشريط السفلي المكرر
      const layoutSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 -12 1120 700" width="1200" height="750">
        <rect x="-300" y="-300" width="1800" height="1300" fill="#f8fafc"/>
        <!-- شبكة هندسية دقيقة -->
        <g stroke="#e2e8f0" stroke-width="1">
          <line x1="100" y1="80" x2="100" y2="630"/><line x1="250" y1="80" x2="250" y2="630"/>
          <line x1="400" y1="80" x2="400" y2="630"/><line x1="550" y1="80" x2="550" y2="630"/>
          <line x1="700" y1="80" x2="700" y2="630"/><line x1="850" y1="80" x2="850" y2="630"/>
          <line x1="1000" y1="80" x2="1000" y2="630"/><line x1="1100" y1="80" x2="1100" y2="630"/>
          <line x1="80" y1="140" x2="1120" y2="140"/><line x1="80" y1="260" x2="1120" y2="260"/>
          <line x1="80" y1="380" x2="1120" y2="380"/><line x1="80" y1="500" x2="1120" y2="500"/>
        </g>

        <!-- جدران الغرفة المعتمدة -->
        <rect x="90" y="95" width="1020" height="520" rx="12" fill="#ffffff" fill-opacity="0.88" stroke="#1e3a5f" stroke-width="4"/>
        <rect x="104" y="109" width="992" height="492" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="8,6"/>

        <!-- مناطق الأصول والمعدات داخل المسقط الهندسي -->
        <rect x="140" y="140" width="280" height="165" rx="8" fill="#eff6ff" stroke="#3b6998" stroke-width="2.2"/>
        <text x="280" y="212" text-anchor="middle" fill="#1e3a5f" font-family="Tahoma, Arial, sans-serif" font-size="19" font-weight="bold">منطقة المعدات الرئيسية (أ)</text>
        <text x="280" y="242" text-anchor="middle" fill="#475569" font-family="Tahoma, Arial, sans-serif" font-size="14">وحدات تشغيل معيارية فولاذ 304</text>

        <rect x="460" y="140" width="280" height="165" rx="8" fill="#f0fdf4" stroke="#15803d" stroke-width="2.2"/>
        <text x="600" y="212" text-anchor="middle" fill="#166534" font-family="Tahoma, Arial, sans-serif" font-size="19" font-weight="bold">منطقة الرقابة والفرز القياسي</text>
        <text x="600" y="242" text-anchor="middle" fill="#475569" font-family="Tahoma, Arial, sans-serif" font-size="14">نقاط فحص الجودة وسلامة الغذاء</text>

        <rect x="780" y="140" width="290" height="165" rx="8" fill="#fffbeb" stroke="#b45309" stroke-width="2.2"/>
        <text x="925" y="212" text-anchor="middle" fill="#92400e" font-family="Tahoma, Arial, sans-serif" font-size="19" font-weight="bold">منطقة التجهيز والمناولة (ب)</text>
        <text x="925" y="242" text-anchor="middle" fill="#475569" font-family="Tahoma, Arial, sans-serif" font-size="14">طاولات ومنصات العمل المعتمدة</text>

        <!-- ممر الحركة القياسي بالمنتصف -->
        <rect x="140" y="335" width="930" height="76" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="200" y1="373" x2="1000" y2="373" stroke="#2e5a88" stroke-width="2.5" stroke-dasharray="12,8"/>
        <polygon points="195,373 215,363 215,383" fill="#2e5a88"/>
        <text x="600" y="366" text-anchor="middle" fill="#1e3a5f" font-family="Tahoma, Arial, sans-serif" font-size="15">مسار الحركة التشغيلية القياسي وممر السلامة المعتمد — عرض 2.4 متر</text>

        <!-- صف التجهيزات السفلي -->
        <rect x="140" y="440" width="430" height="130" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <text x="355" y="500" text-anchor="middle" fill="#1e293b" font-family="Tahoma, Arial, sans-serif" font-size="18">وحدات الإمداد والتعقيم وتصريف الأرضيات</text>
        <text x="355" y="528" text-anchor="middle" fill="#64748b" font-family="Tahoma, Arial, sans-serif" font-size="14">أرضيات إيبوكسي مضادة للانزلاق والبكتيريا</text>

        <rect x="610" y="440" width="460" height="130" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <text x="840" y="500" text-anchor="middle" fill="#1e293b" font-family="Tahoma, Arial, sans-serif" font-size="18">لوحة التحكم والقياس الرقمي للغرفة ${code}</text>
        <text x="840" y="528" text-anchor="middle" fill="#2e5a88" font-family="Tahoma, Arial, sans-serif" font-size="14">المساحة: ${area}  |  الحرارة المعيارية: ${temp}</text>

        <!-- شريط العنوان العلوي والسفلي -->
        <rect x="90" y="26" width="1020" height="50" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="1085" y="58" text-anchor="end" fill="#1e3a5f" font-family="Tahoma, Arial, sans-serif" font-size="18" font-weight="bold">المسقط الهندسي وتوزيع الأصول — ${title} (غرفة ${code})</text>
        <text x="115" y="58" text-anchor="start" fill="#64748b" font-family="Tahoma, Arial, sans-serif" font-size="14">مشروع مطبخ العزيزية المركزي 52</text>

      </svg>`;
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(layoutSvg);
    }

    // المشهد الأول الرئيسي (viewIndex === 0): منظور معماري داخلي مفصل بحجم كبير 1200x750
    let interiorElements = "";
    if (cat.indexOf("التبريد") !== -1) {
      interiorElements = `
        <!-- جدران ألواح العزل الحراري Sandwich Panels -->
        <rect x="70" y="70" width="1060" height="470" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <g stroke="#e2e8f0" stroke-width="2">
          <line x1="220" y1="70" x2="220" y2="540"/><line x1="370" y1="70" x2="370" y2="540"/>
          <line x1="520" y1="70" x2="520" y2="540"/><line x1="670" y1="70" x2="670" y2="540"/>
          <line x1="820" y1="70" x2="820" y2="540"/><line x1="970" y1="70" x2="970" y2="540"/>
        </g>
        <!-- وحدة المبخرات والتبريد المركزية بالسقف -->
        <rect x="340" y="88" width="520" height="95" rx="10" fill="#eff6ff" stroke="#60a5fa" stroke-width="2.2"/>
        <circle cx="430" cy="135" r="30" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
        <circle cx="600" cy="135" r="30" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
        <circle cx="770" cy="135" r="30" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
        <circle cx="430" cy="135" r="10" fill="#93c5fd"/><circle cx="600" cy="135" r="10" fill="#93c5fd"/><circle cx="770" cy="135" r="10" fill="#93c5fd"/>

        <!-- ستانلس ستيل أرفف التخزين المبرد يميناً ويساراً -->
        <rect x="115" y="220" width="310" height="295" fill="none" stroke="#64748b" stroke-width="3.5"/>
        <line x1="115" y1="315" x2="425" y2="315" stroke="#64748b" stroke-width="3"/>
        <line x1="115" y1="410" x2="425" y2="410" stroke="#64748b" stroke-width="3"/>
        <rect x="140" y="255" width="110" height="52" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
        <rect x="275" y="255" width="120" height="52" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
        <rect x="140" y="350" width="130" height="52" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
        <rect x="290" y="350" width="105" height="52" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
        <rect x="140" y="445" width="255" height="52" rx="5" fill="#eff6ff" stroke="#60a5fa" stroke-width="1.5"/>

        <rect x="775" y="220" width="310" height="295" fill="none" stroke="#64748b" stroke-width="3.5"/>
        <line x1="775" y1="315" x2="1085" y2="315" stroke="#64748b" stroke-width="3"/>
        <line x1="775" y1="410" x2="1085" y2="410" stroke="#64748b" stroke-width="3"/>
        <rect x="800" y="255" width="120" height="52" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
        <rect x="940" y="255" width="115" height="52" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
        <rect x="800" y="350" width="255" height="52" rx="5" fill="#eff6ff" stroke="#60a5fa" stroke-width="1.5"/>
        <rect x="800" y="445" width="125" height="52" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
        <rect x="945" y="445" width="110" height="52" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>

        <!-- لوحة القياس الرقمي في الوسط -->
        <rect x="485" y="245" width="230" height="125" rx="10" fill="#f8fafc" stroke="#60a5fa" stroke-width="2"/>
        <rect x="515" y="268" width="170" height="46" rx="6" fill="#0f172a"/>
        <text x="600" y="298" text-anchor="middle" fill="#38bdf8" font-family="Tahoma, Arial, sans-serif" font-size="20" font-weight="bold">${temp}</text>
        <text x="600" y="346" text-anchor="middle" fill="#1e3a5f" font-family="Tahoma, Arial, sans-serif" font-size="15">مراقبة حرارية رقمية مستمرة</text>
      `;
    } else if (cat.indexOf("الإنتاج") !== -1 || cat.indexOf("الطبخ") !== -1) {
      interiorElements = `
        <rect x="70" y="70" width="1060" height="470" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- هود الشفط المركزي من الاستانلس ستيل -->
        <polygon points="180,75 1020,75 1070,185 130,185" fill="#f1f5f9" stroke="#64748b" stroke-width="2.2"/>
        <line x1="330" y1="75" x2="310" y2="185" stroke="#94a3b8" stroke-width="1.8"/>
        <line x1="600" y1="75" x2="600" y2="185" stroke="#94a3b8" stroke-width="1.8"/>
        <line x1="870" y1="75" x2="890" y2="185" stroke="#94a3b8" stroke-width="1.8"/>
        <rect x="155" y="160" width="890" height="14" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2"/>

        <!-- أفران كومبي ذكية يساراً -->
        <rect x="130" y="225" width="240" height="295" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <rect x="152" y="252" width="150" height="190" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
        <line x1="168" y1="295" x2="285" y2="295" stroke="#f59e0b" stroke-width="2.5"/>
        <line x1="168" y1="345" x2="285" y2="345" stroke="#f59e0b" stroke-width="2.5"/>
        <line x1="168" y1="395" x2="285" y2="395" stroke="#f59e0b" stroke-width="2.5"/>
        <rect x="316" y="255" width="36" height="95" rx="4" fill="#0f172a"/>
        <circle cx="334" cy="390" r="11" fill="#d97706"/>

        <!-- قدور البخار المزدوجة في المنتصف -->
        <rect x="430" y="285" width="340" height="235" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <ellipse cx="525" cy="285" rx="62" ry="18" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
        <ellipse cx="675" cy="285" rx="62" ry="18" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
        <rect x="465" y="340" width="120" height="110" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8"/>
        <rect x="615" y="340" width="120" height="110" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8"/>

        <!-- خط الطهي والتحمير يميناً -->
        <rect x="830" y="265" width="245" height="255" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <rect x="855" y="290" width="195" height="80" rx="5" fill="#fffbeb" stroke="#d97706" stroke-width="1.8"/>
        <rect x="855" y="395" width="195" height="95" rx="5" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8"/>
      `;
    } else if (cat.indexOf("التحضير") !== -1 || cat.indexOf("التقطيع") !== -1) {
      interiorElements = `
        <rect x="70" y="70" width="1060" height="470" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- وحدات تعقيم السكاكين بالأشعة فوق البنفسجية -->
        <rect x="150" y="105" width="230" height="75" rx="8" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2"/>
        <text x="265" y="150" text-anchor="middle" fill="#0369a1" font-family="Tahoma, Arial, sans-serif" font-size="18" font-weight="bold">خزانة تعقيم السكاكين UV</text>
        <rect x="440" y="105" width="320" height="75" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
        <text x="600" y="150" text-anchor="middle" fill="#1e3a5f" font-family="Tahoma, Arial, sans-serif" font-size="18" font-weight="bold">نظام التكييف الصحي المفلتر (${temp})</text>

        <!-- طاولات التقطيع الاستانلس ستيل 304 -->
        <rect x="130" y="320" width="430" height="24" rx="4" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
        <rect x="175" y="302" width="150" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1.2"/>
        <rect x="355" y="302" width="150" height="18" rx="3" fill="#fecdd3" stroke="#e11d48" stroke-width="1.2"/>
        <line x1="160" y1="344" x2="160" y2="520" stroke="#64748b" stroke-width="5"/>
        <line x1="530" y1="344" x2="530" y2="520" stroke="#64748b" stroke-width="5"/>
        <line x1="160" y1="465" x2="530" y2="465" stroke="#94a3b8" stroke-width="3.5"/>

        <!-- ماكينات التقطيع والفرم والمناشير الكهربائية -->
        <rect x="640" y="235" width="200" height="285" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <circle cx="740" cy="335" r="48" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
        <circle cx="740" cy="335" r="16" fill="#94a3b8"/>
        <rect x="880" y="295" width="190" height="225" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <rect x="905" y="325" width="140" height="75" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
      `;
    } else if (cat.indexOf("المستودعات") !== -1) {
      interiorElements = `
        <rect x="70" y="70" width="1060" height="470" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- راكات التخزين الثقيلة المعيارية -->
        <g stroke="#475569" stroke-width="4.5">
          <line x1="140" y1="95" x2="140" y2="525"/><line x1="520" y1="95" x2="520" y2="525"/>
          <line x1="680" y1="95" x2="680" y2="525"/><line x1="1060" y1="95" x2="1060" y2="525"/>
        </g>
        <g stroke="#64748b" stroke-width="3.5">
          <line x1="140" y1="210" x2="520" y2="210"/><line x1="140" y1="345" x2="520" y2="345"/><line x1="140" y1="480" x2="520" y2="480"/>
          <line x1="680" y1="210" x2="1060" y2="210"/><line x1="680" y1="345" x2="1060" y2="345"/><line x1="680" y1="480" x2="1060" y2="480"/>
        </g>
        <!-- طرود وباليتات التخزين المرقمة -->
        <rect x="170" y="130" width="145" height="74" rx="6" fill="#fed7aa" stroke="#d97706" stroke-width="1.8"/>
        <rect x="340" y="130" width="150" height="74" rx="6" fill="#fde68a" stroke="#d97706" stroke-width="1.8"/>
        <rect x="170" y="265" width="155" height="74" rx="6" fill="#fde68a" stroke="#d97706" stroke-width="1.8"/>
        <rect x="350" y="265" width="140" height="74" rx="6" fill="#fed7aa" stroke="#d97706" stroke-width="1.8"/>
        <rect x="170" y="400" width="320" height="74" rx="6" fill="#ffedd5" stroke="#ea580c" stroke-width="1.8"/>

        <rect x="710" y="130" width="150" height="74" rx="6" fill="#fed7aa" stroke="#d97706" stroke-width="1.8"/>
        <rect x="880" y="130" width="150" height="74" rx="6" fill="#fde68a" stroke="#d97706" stroke-width="1.8"/>
        <rect x="710" y="265" width="320" height="74" rx="6" fill="#ffedd5" stroke="#ea580c" stroke-width="1.8"/>
        <rect x="710" y="400" width="150" height="74" rx="6" fill="#fde68a" stroke="#d97706" stroke-width="1.8"/>
        <rect x="880" y="400" width="150" height="74" rx="6" fill="#fed7aa" stroke="#d97706" stroke-width="1.8"/>
      `;
    } else {
      interiorElements = `
        <rect x="70" y="70" width="1060" height="470" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- لوحات التحكم والمراقبة الهندسية -->
        <rect x="130" y="115" width="320" height="400" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <rect x="160" y="150" width="260" height="115" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2"/>
        <polyline points="178,235 218,192 260,218 310,175 365,205 400,180" fill="none" stroke="#10b981" stroke-width="3"/>
        <circle cx="205" cy="315" r="14" fill="#10b981"/><circle cx="290" cy="315" r="14" fill="#f59e0b"/><circle cx="375" cy="315" r="14" fill="#3b82f6"/>
        <rect x="165" y="365" width="250" height="110" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.8"/>

        <rect x="500" y="135" width="570" height="380" rx="12" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
        <circle cx="660" cy="325" r="82" fill="#ffffff" stroke="#2e5a88" stroke-width="3"/>
        <circle cx="660" cy="325" r="42" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
        <circle cx="910" cy="325" r="82" fill="#ffffff" stroke="#0f766e" stroke-width="3"/>
        <circle cx="910" cy="325" r="42" fill="#f0fdfa" stroke="#14b8a6" stroke-width="2"/>
      `;
    }

    // رسم توضيحي للمنظور الداخلي بدون نصوص مكررة (الاسم والمساحة والحرارة تظهر في بطاقة القسم نفسها)
    // نفس نسبة الأبعاد 1200×750 (يعتمدها مُصدِّر PowerPoint) مع قص الهوامش الفارغة
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 12 1120 700" width="1200" height="750">
      <rect x="-300" y="-300" width="1800" height="1300" fill="#f4f6f9"/>
      <rect x="-300" y="540" width="1800" height="400" fill="#e2e8f0"/>
      <line x1="-300" y1="540" x2="1500" y2="540" stroke="#94a3b8" stroke-width="2"/>
      ${interiorElements}
    </svg>`;

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  // توليد مصفوفة صور افتراضية لكل غرفة (مشهد داخلي + مسقط توزيع المعدات)
  function generateRoomDefaultImages(room) {
    return [
      {
        id: "rm-img-1-" + (room.id || "52"),
        url: generateRoomSceneDataUrl(room, 0),
        caption: "المنظور الداخلي والتجهيزات الصناعية — " + (room.name || "")
      },
      {
        id: "rm-img-2-" + (room.id || "52"),
        url: generateRoomSceneDataUrl(room, 1),
        caption: "المسقط الهندسي وتوزيع الأصول ومسار الحركة — " + (room.name || "")
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 3. مولّد صور الأصول والمعدات الصناعية (بدقة 600x380 واضحة ومفصلة)
  // --------------------------------------------------------------------------
  function generateAssetImageDataUrl(assetName, assetType, accentColor) {
    const safeName = escapeXml(assetName || "معدة صناعية");
    const color = "#2e5a88";
    let iconGraphic = "";
    const t = (assetType || assetName || "");

    if (t.indexOf("فرن") !== -1 || t.indexOf("كومبي") !== -1 || t.indexOf("تنور") !== -1 || t.indexOf("مخبوزات") !== -1 || t.indexOf("حلة") !== -1 || t.indexOf("مقلاة") !== -1) {
      iconGraphic = `
        <rect x="160" y="32" width="280" height="245" rx="10" fill="#ffffff" stroke="#64748b" stroke-width="2.5"/>
        <rect x="185" y="55" width="175" height="185" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
        <line x1="205" y1="98" x2="340" y2="98" stroke="#f59e0b" stroke-width="3"/>
        <line x1="205" y1="145" x2="340" y2="145" stroke="#f59e0b" stroke-width="3"/>
        <line x1="205" y1="192" x2="340" y2="192" stroke="#f59e0b" stroke-width="3"/>
        <rect x="378" y="60" width="42" height="90" rx="5" fill="#0f172a"/>
        <circle cx="399" cy="185" r="12" fill="#d97706"/>
        <circle cx="399" cy="220" r="10" fill="#10b981"/>
      `;
    } else if (t.indexOf("ثلاجة") !== -1 || t.indexOf("تبريد") !== -1 || t.indexOf("تجميد") !== -1 || t.indexOf("خزانة") !== -1) {
      iconGraphic = `
        <rect x="145" y="32" width="310" height="245" rx="10" fill="#ffffff" stroke="#3b82f6" stroke-width="2.5"/>
        <line x1="300" y1="32" x2="300" y2="277" stroke="#94a3b8" stroke-width="2"/>
        <rect x="274" y="130" width="8" height="48" rx="3" fill="#64748b"/>
        <rect x="318" y="130" width="8" height="48" rx="3" fill="#64748b"/>
        <rect x="175" y="55" width="95" height="36" rx="5" fill="#0f172a"/>
        <text x="222" y="79" text-anchor="middle" fill="#38bdf8" font-family="Tahoma, Arial, sans-serif" font-size="15" font-weight="bold">-18° / +2°C</text>
      `;
    } else if (t.indexOf("منشار") !== -1 || t.indexOf("مفرمة") !== -1 || t.indexOf("تقطيع") !== -1 || t.indexOf("سكاكين") !== -1) {
      iconGraphic = `
        <rect x="130" y="185" width="340" height="24" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
        <line x1="165" y1="209" x2="165" y2="280" stroke="#475569" stroke-width="5"/>
        <line x1="435" y1="209" x2="435" y2="280" stroke="#475569" stroke-width="5"/>
        <circle cx="255" cy="120" r="54" fill="#ffffff" stroke="#64748b" stroke-width="3"/>
        <circle cx="255" cy="120" r="18" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
        <rect x="345" y="78" width="80" height="107" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="2.5"/>
      `;
    } else if (t.indexOf("غسالة") !== -1 || t.indexOf("غسيل") !== -1 || t.indexOf("حوض") !== -1 || t.indexOf("تحلية") !== -1 || t.indexOf("معقم") !== -1) {
      iconGraphic = `
        <rect x="135" y="45" width="330" height="225" rx="10" fill="#ffffff" stroke="#64748b" stroke-width="2.5"/>
        <circle cx="240" cy="158" r="56" fill="#f0f9ff" stroke="#0284c7" stroke-width="2.5"/>
        <path d="M198 158 Q219 138 240 158 T282 158" fill="none" stroke="#0284c7" stroke-width="3"/>
        <rect x="335" y="82" width="95" height="150" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
      `;
    } else if (t.indexOf("أرفف") !== -1 || t.indexOf("مستودع") !== -1 || t.indexOf("رافعة") !== -1 || t.indexOf("منصات") !== -1 || t.indexOf("حافظات") !== -1) {
      iconGraphic = `
        <rect x="135" y="40" width="330" height="235" fill="none" stroke="#475569" stroke-width="4"/>
        <line x1="135" y1="120" x2="465" y2="120" stroke="#64748b" stroke-width="3.5"/>
        <line x1="135" y1="200" x2="465" y2="200" stroke="#64748b" stroke-width="3.5"/>
        <rect x="165" y="65" width="110" height="48" rx="5" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
        <rect x="305" y="65" width="130" height="48" rx="5" fill="#fed7aa" stroke="#d97706" stroke-width="1.5"/>
        <rect x="165" y="145" width="270" height="48" rx="5" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
      `;
    } else {
      iconGraphic = `
        <rect x="145" y="45" width="310" height="225" rx="10" fill="#ffffff" stroke="${color}" stroke-width="2.5"/>
        <rect x="180" y="75" width="240" height="95" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2"/>
        <polyline points="198,145 245,108 290,135 340,95 395,122" fill="none" stroke="#10b981" stroke-width="3"/>
        <circle cx="225" cy="215" r="13" fill="#0f766e"/>
        <circle cx="300" cy="215" r="13" fill="#d97706"/>
        <circle cx="375" cy="215" r="13" fill="#2563eb"/>
      `;
    }

    // رسم توضيحي للمعدة بدون شريط عنوان مكرر (الاسم يظهر في بطاقة الأصل). نفس نسبة 600×380 التي يعتمدها المُصدِّر
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="90 20 420 266" width="600" height="380">
      <rect x="-300" y="-300" width="1500" height="1000" fill="#f8fafc"/>
      ${iconGraphic}
    </svg>`;

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  return {
    staffAvatars: staffAvatars,
    getStaffAvatarSvg: getStaffAvatarSvg,
    getStaffAvatarDataUrl: getStaffAvatarDataUrl,
    generateRoomSceneDataUrl: generateRoomSceneDataUrl,
    generateRoomDefaultImages: generateRoomDefaultImages,
    generateAssetImageDataUrl: generateAssetImageDataUrl
  };
})();

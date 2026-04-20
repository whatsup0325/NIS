// 病患資料 generation
const DX = [
  "急性冠心症 (ACS)", "肺炎 (Pneumonia)", "泌尿道感染 (UTI)", "糖尿病酮酸中毒 (DKA)",
  "慢性阻塞性肺病 (COPD) 急性惡化", "腦梗塞 (CVA)", "腸胃出血 (GI bleeding)",
  "術後照護 — 膽囊切除", "術後照護 — 全膝關節置換", "蜂窩性組織炎 (Cellulitis)",
  "心房顫動 (AF) 合併心衰", "急性胰臟炎", "敗血症 (Sepsis)", "慢性腎病 (CKD) stage 4",
  "甲狀腺功能亢進", "肝硬化合併腹水"
];
const SURNAMES = ["王","李","張","陳","林","黃","吳","劉","蔡","楊","許","鄭","謝","郭","洪","邱","曾","廖","賴","徐","周","葉","蘇","莊","呂"];
const GIVEN_M = ["志明","建國","俊傑","家豪","文雄","宗翰","冠宇","宏志","明德","振國","昱廷","品翰","昊天"];
const GIVEN_F = ["淑芬","美玲","雅婷","怡君","佩珊","欣怡","麗華","秀英","惠君","淑惠","曉雯","婉婷","靜怡"];
const DOCS = ["林明德 醫師","陳怡慧 醫師","張懷恩 醫師","黃志賢 醫師","吳佳玲 醫師"];
const NURSES = ["李靜宜","王佳穎","林詩婷","陳佩君","張雅芳"];
const ATTENTION = [
  { k: "fall", label: "跌倒高風險" },
  { k: "restraint", label: "約束中" },
  { k: "isolation", label: "接觸隔離" },
  { k: "npo", label: "NPO" },
  { k: "dnr", label: "DNR" },
];

function seed(n) {
  let s = n;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rnd = seed(42);
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function range(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

function makePatient(i) {
  const gender = rnd() > 0.5 ? "M" : "F";
  const age = range(32, 88);
  const name = pick(SURNAMES) + (gender === "M" ? pick(GIVEN_M) : pick(GIVEN_F));
  const statusRoll = rnd();
  const status = statusRoll < 0.08 ? "crit" : statusRoll < 0.25 ? "warn" : "ok";
  const attentions = [];
  if (rnd() < 0.25) attentions.push(ATTENTION[0]);
  if (rnd() < 0.1) attentions.push(ATTENTION[1]);
  if (rnd() < 0.12) attentions.push(ATTENTION[2]);
  if (rnd() < 0.18) attentions.push(ATTENTION[3]);
  if (rnd() < 0.08) attentions.push(ATTENTION[4]);

  const hrBase = status === "crit" ? range(110, 135) : status === "warn" ? range(92, 108) : range(62, 88);
  const spo2Base = status === "crit" ? range(88, 93) : status === "warn" ? range(93, 96) : range(96, 99);
  const sbp = status === "crit" ? range(78, 98) : range(108, 142);
  const dbp = Math.floor(sbp * 0.62) + range(-5, 5);
  const tempBase = status === "crit" ? 38.5 + rnd() * 1.5 : status === "warn" ? 37.5 + rnd() : 36.4 + rnd() * 0.9;
  const rr = status === "crit" ? range(22, 30) : range(14, 20);

  const adm = Date.now() - range(1, 12) * 86400000;
  return {
    id: `P${1000 + i}`,
    bedNum: String(i + 1).padStart(2, "0"),
    roomNum: `A${Math.floor(i / 4) + 1}`,
    name,
    gender,
    age,
    dx: pick(DX),
    doctor: pick(DOCS),
    nurse: pick(NURSES),
    status,
    attentions,
    admitDate: adm,
    vitals: {
      hr: hrBase,
      spo2: spo2Base,
      sbp, dbp,
      temp: Math.round(tempBase * 10) / 10,
      rr,
    },
    pendingMeds: range(0, 3),
    pendingTasks: range(0, 4),
    allergies: rnd() > 0.6 ? pick(["Penicillin", "NSAIDs", "顯影劑", "海鮮", "無"]) : "無",
    bloodType: pick(["A+", "B+", "O+", "AB+", "A-", "O-"]),
    weight: range(48, 92),
    height: range(150, 182),
  };
}

const BEDS = [];
for (let i = 0; i < 24; i++) {
  // ~15% beds empty
  if (rnd() < 0.13) {
    BEDS.push({
      id: `BED${i}`,
      bedNum: String(i + 1).padStart(2, "0"),
      roomNum: `A${Math.floor(i / 4) + 1}`,
      empty: true,
    });
  } else {
    const p = makePatient(i);
    BEDS.push({ id: `BED${i}`, ...p, empty: false });
  }
}

// Meds schedule — per patient
function makeMeds(patient) {
  if (!patient || patient.empty) return [];
  const names = [
    ["Aspirin", "100 mg PO"], ["Metformin", "500 mg PO"], ["Lisinopril", "10 mg PO"],
    ["Atorvastatin", "40 mg PO"], ["Furosemide", "40 mg IV"], ["Omeprazole", "20 mg PO"],
    ["Ceftriaxone", "1 g IV"], ["Heparin", "5000 u SC"], ["Insulin Regular", "8 u SC"],
    ["Paracetamol", "500 mg PO"], ["Enoxaparin", "40 mg SC"], ["Potassium Cl", "20 mEq PO"],
  ];
  const now = new Date();
  const list = [];
  const count = 4 + Math.floor((patient.id.charCodeAt(2) * 7) % 5);
  for (let i = 0; i < count; i++) {
    const hour = [6, 8, 10, 12, 14, 16, 18, 20, 22][(i + patient.id.charCodeAt(3)) % 9];
    const [med, dose] = names[(i + patient.id.charCodeAt(1)) % names.length];
    const t = new Date(now);
    t.setHours(hour, 0, 0, 0);
    const isPast = t < now;
    const isRecent = Math.abs(t - now) < 3600000 * 0.5;
    let status;
    if (isPast && !isRecent) status = Math.random() > 0.1 ? "given" : "overdue";
    else if (isRecent) status = "pending";
    else status = "scheduled";
    list.push({ time: `${String(hour).padStart(2, "0")}:00`, name: med, dose, status });
  }
  return list.sort((a, b) => a.time.localeCompare(b.time));
}

// Tasks
function makeTasks(patient) {
  if (!patient || patient.empty) return [];
  const templates = [
    "量測生命徵象", "更換點滴", "協助翻身 Q2H", "血糖檢測", "傷口換藥",
    "協助進食", "CVP 記錄", "協助沐浴", "抽血 — CBC/CRP", "導尿管護理",
    "氧氣濃度確認", "心電圖 12-lead", "採集痰液培養", "下床活動",
  ];
  const list = [];
  const count = 3 + Math.floor((patient.id.charCodeAt(3) * 3) % 4);
  for (let i = 0; i < count; i++) {
    const t = templates[(i + patient.id.charCodeAt(2)) % templates.length];
    const hour = [8, 10, 12, 14, 15, 16, 18, 20][(i + patient.id.charCodeAt(1)) % 8];
    const done = Math.random() > 0.55;
    list.push({
      time: `${String(hour).padStart(2, "0")}:00`,
      title: t,
      done,
      priority: i === 0 ? "high" : "normal",
    });
  }
  return list;
}

// Notes
function makeNotes(patient) {
  if (!patient || patient.empty) return [];
  return [
    {
      at: "今日 14:20",
      author: patient.nurse,
      role: "護理師",
      body: `病患意識清醒，主訴${patient.status === "crit" ? "胸悶感加劇，立即通知主治醫師並給氧。SpO2 由 94% 降至 89%，已調整氧氣流量。" : patient.status === "warn" ? "輕微頭暈，量測血壓正常範圍，持續觀察。" : "狀況穩定，活動耐受度良好，已協助下床坐椅 30 分鐘。"}`
    },
    {
      at: "今日 08:15",
      author: patient.doctor,
      role: "主治醫師",
      body: `查房評估，${patient.dx}。${patient.status === "ok" ? "復原情況良好，繼續原有治療計畫，預計 2-3 天後可考慮出院。" : "持續監測生命徵象，若有惡化立即 call。藥物依原處方給予。"}`
    },
    {
      at: "昨日 22:40",
      author: "夜班護理",
      role: "護理師",
      body: "夜間睡眠品質尚可，呼吸平順，無不適主訴。凌晨 02:00 例行翻身，皮膚完整無壓瘡。"
    }
  ];
}

// Movement feed (ward-wide)
const MOVEMENT_FEED = [
  { t: "14:32", type: "admit", bed: "12", name: "廖美雲", note: "急診新入院 — 肺炎" },
  { t: "13:58", type: "transfer", bed: "07→ICU", name: "陳志強", note: "呼吸衰竭轉加護" },
  { t: "13:15", type: "med", bed: "03", name: "林建國", note: "Ceftriaxone 1g 已執行" },
  { t: "12:40", type: "alert", bed: "18", name: "王淑芬", note: "SpO2 掉至 88%" },
  { t: "11:55", type: "discharge", bed: "05", name: "黃文雄", note: "出院返家" },
  { t: "11:20", type: "order", bed: "09", name: "李佩珊", note: "新醫囑 — CBC 追蹤" },
  { t: "10:45", type: "task", bed: "14", name: "吳雅婷", note: "傷口換藥完成" },
  { t: "10:08", type: "admit", bed: "21", name: "蔡昱廷", note: "排刀 — 全膝置換術後" },
  { t: "09:30", type: "alert", bed: "11", name: "鄭麗華", note: "跌倒風險評估 +" },
];

Object.assign(window, { BEDS, makeMeds, makeTasks, makeNotes, MOVEMENT_FEED });

// Patient detail view

function LiveWave({ type, hr, rr, color, label, value, unit, range }) {
  const points = useWaveform({
    generator: (i) => {
      if (type === "ecg") return ecgAt(i, hr);
      if (type === "pleth") return plethAt(i, hr);
      if (type === "resp") return respAt(i, rr);
      return 0;
    },
    length: 240,
    interval: 50,
  });
  const W = 520, H = 52;
  return (
    <div className={`wave-card ${type === "ecg" ? "hr" : type === "pleth" ? "spo2" : "resp"}`}>
      <div className="wave-head">
        <div>
          <div className="wave-label">{label}</div>
          <div className="wave-value">{value}<span style={{ fontSize: 14, marginLeft: 4 }}>{unit}</span></div>
          <div className="wave-range">{range}</div>
        </div>
      </div>
      <svg className="wave-canvas" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path d={toPath(points, W, H)} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PatientDetail({ bed, onBack, onToast }) {
  const [tab, setTab] = React.useState("overview");
  const [meds, setMeds] = React.useState(() => makeMeds(bed));
  const [tasks, setTasks] = React.useState(() => makeTasks(bed));
  const notes = React.useMemo(() => makeNotes(bed), [bed.id]);

  // Live vitals drift
  const [vitals, setVitals] = React.useState(bed.vitals);
  React.useEffect(() => {
    const id = setInterval(() => {
      setVitals(v => ({
        hr: Math.round(Math.max(40, Math.min(180, v.hr + (Math.random() - 0.5) * 2))),
        spo2: Math.round(Math.max(80, Math.min(100, v.spo2 + (Math.random() - 0.5) * 0.5))),
        sbp: Math.round(Math.max(60, Math.min(200, v.sbp + (Math.random() - 0.5) * 2))),
        dbp: Math.round(Math.max(40, Math.min(120, v.dbp + (Math.random() - 0.5) * 1.5))),
        temp: Math.round(Math.max(35, Math.min(41, v.temp + (Math.random() - 0.5) * 0.05)) * 10) / 10,
        rr: Math.round(Math.max(8, Math.min(40, v.rr + (Math.random() - 0.5) * 0.5))),
      }));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const giveMed = (i) => {
    setMeds(m => m.map((med, idx) => idx === i ? { ...med, status: "given" } : med));
    onToast({ type: "ok", title: `已執行 ${meds[i].name}`, meta: `床 ${bed.roomNum}-${bed.bedNum} · ${bed.name}` });
  };
  const toggleTask = (i) => {
    setTasks(t => t.map((task, idx) => idx === i ? { ...task, done: !task.done } : task));
  };

  const status = bed.status;

  return (
    <div className="detail-main">
      <div className="detail-top">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrowLeft" className="ic sm" /> 返回病床總覽
        </button>
        <div className="pt-header">
          <div className="pt-hero">
            <span className="bed-label">
              <Icon name="bed" className="ic sm" />
              {bed.roomNum}-{bed.bedNum} · 病歷 {bed.id}
            </span>
            <h1>
              {bed.name}
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-3)", marginLeft: 10 }}>
                {bed.gender === "M" ? "男" : "女"} · {bed.age} 歲 · {bed.bloodType} · {bed.height}cm / {bed.weight}kg
              </span>
            </h1>
            <div className="subline">
              <span><Icon name="flame" className="ic sm" /> {bed.dx}</span>
              <span className="sep">|</span>
              <span><Icon name="user" className="ic sm" /> 主治 {bed.doctor}</span>
              <span className="sep">|</span>
              <span><Icon name="shield" className="ic sm" /> 過敏：{bed.allergies}</span>
              <span className="sep">|</span>
              <span>{timeAgo(bed.admitDate)}</span>
            </div>
          </div>
          <div className="pt-actions">
            <button className="btn"><Icon name="phone" className="ic sm" /> 呼叫醫師</button>
            <button className="btn"><Icon name="clipboard" className="ic sm" /> 新增護理紀錄</button>
            <button className="btn primary"><Icon name="pill" className="ic sm" /> 給藥</button>
          </div>
        </div>
        <div className="tabs">
          {[
            { id: "overview", label: "總覽" },
            { id: "vitals", label: "生命徵象" },
            { id: "meds", label: `用藥排程 (${meds.filter(m => m.status === "pending" || m.status === "overdue").length})` },
            { id: "tasks", label: `護理任務 (${tasks.filter(t => !t.done).length})` },
            { id: "notes", label: "護理紀錄" },
            { id: "labs", label: "檢驗" },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="detail-body">
        {tab === "overview" && (
          <>
            <div className="grid-3">
              <LiveWave
                type="ecg" hr={vitals.hr}
                label="ECG LEAD II" unit="bpm" value={Math.round(vitals.hr)}
                color="oklch(72% 0.18 145)"
                range={`正常 60-100`}
              />
              <LiveWave
                type="pleth" hr={vitals.hr}
                label="SpO₂" unit="%" value={Math.round(vitals.spo2)}
                color="oklch(75% 0.13 220)"
                range={`目標 ≥ 95%`}
              />
              <LiveWave
                type="resp" rr={vitals.rr}
                label="RESP" unit="/min" value={Math.round(vitals.rr)}
                color="oklch(78% 0.12 85)"
                range={`正常 12-20`}
              />
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-head">
                  <div className="card-title"><Icon name="pulse" className="ic sm" /> 生命徵象數值</div>
                  <span className="card-sub">每 5 分鐘更新</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "血壓 BP", value: `${Math.round(vitals.sbp)}/${Math.round(vitals.dbp)}`, unit: "mmHg", warn: vitals.sbp < 100 || vitals.sbp > 160 },
                    { label: "心跳 HR", value: Math.round(vitals.hr), unit: "bpm", warn: vitals.hr > 100 || vitals.hr < 60 },
                    { label: "血氧 SpO₂", value: Math.round(vitals.spo2), unit: "%", warn: vitals.spo2 < 94 },
                    { label: "體溫 T", value: vitals.temp.toFixed(1), unit: "°C", warn: vitals.temp > 37.8 },
                    { label: "呼吸 RR", value: Math.round(vitals.rr), unit: "/min", warn: vitals.rr > 22 },
                    { label: "疼痛 Pain", value: status === "crit" ? 6 : status === "warn" ? 3 : 1, unit: "/10", warn: false },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: 10, background: "var(--bg-2)", borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: 0.3 }}>{m.label}</div>
                      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: m.warn ? "var(--crit)" : "var(--text)", marginTop: 2 }}>
                        {m.value}
                        <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: 4, fontWeight: 500 }}>{m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="card-title"><Icon name="alert" className="ic sm" /> 病患標記與風險</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {bed.attentions.length === 0 && <span style={{ fontSize: 12, color: "var(--text-3)" }}>無特殊標記</span>}
                  {bed.attentions.map((a, i) => <span key={i} className={`badge ${a.k}`} style={{ fontSize: 11, padding: "4px 10px" }}>{a.label}</span>)}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <MiniScore label="Braden 壓瘡評分" value={status === "crit" ? 12 : 18} max={23} warn={status === "crit"} />
                  <MiniScore label="Morse 跌倒評估" value={bed.attentions.some(a => a.k === "fall") ? 55 : 20} max={125} warn={bed.attentions.some(a => a.k === "fall")} />
                  <MiniScore label="疼痛 Pain Scale" value={status === "crit" ? 6 : status === "warn" ? 3 : 1} max={10} warn={status === "crit"} />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-head">
                  <div className="card-title"><Icon name="pill" className="ic sm" /> 今日用藥排程</div>
                  <span className="card-sub">{meds.filter(m => m.status === "pending").length} 項待執行</span>
                </div>
                {meds.map((m, i) => (
                  <div key={i} className="row">
                    <span className="rtime mono">{m.time}</span>
                    <span className="rname">{m.name}</span>
                    <span className="rdose">{m.dose}</span>
                    <span className={`rstatus ${m.status}`}>
                      {m.status === "pending" ? "待執行" : m.status === "given" ? "已執行" : m.status === "overdue" ? "逾時" : "預定"}
                    </span>
                    {(m.status === "pending" || m.status === "overdue") && (
                      <button className="btn primary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => giveMed(i)}>執行</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="card-title"><Icon name="clipboard" className="ic sm" /> 護理任務</div>
                  <span className="card-sub">{tasks.filter(t => !t.done).length} 項未完成</span>
                </div>
                {tasks.map((t, i) => (
                  <div key={i} className="row" onClick={() => toggleTask(i)} style={{ cursor: "pointer" }}>
                    <button className={`task-check ${t.done ? "done" : ""}`}>{t.done && "✓"}</button>
                    <span className="rtime mono">{t.time}</span>
                    <span className="rname" style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--text-3)" : "var(--text)" }}>{t.title}</span>
                    {t.priority === "high" && !t.done && <span className="rstatus overdue">優先</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title"><Icon name="chat" className="ic sm" /> 最近護理紀錄</div>
                <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }}><Icon name="plus" className="ic sm" /> 新增</button>
              </div>
              {notes.map((n, i) => (
                <div key={i} className="note">
                  <div className="note-head">
                    <span><span className="note-author">{n.author}</span> · {n.role}</span>
                    <span>{n.at}</span>
                  </div>
                  <div className="note-body">{n.body}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "vitals" && (
          <div className="card">
            <div className="card-head">
              <div className="card-title">24 小時生命徵象趨勢</div>
            </div>
            <VitalsTrend bed={bed} />
          </div>
        )}

        {tab === "meds" && (
          <div className="card">
            <div className="card-head">
              <div className="card-title">用藥排程 · 今日</div>
            </div>
            {meds.map((m, i) => (
              <div key={i} className="row">
                <span className="rtime mono">{m.time}</span>
                <span className="rname">{m.name}</span>
                <span className="rdose">{m.dose}</span>
                <span className={`rstatus ${m.status}`}>
                  {m.status === "pending" ? "待執行" : m.status === "given" ? "已執行" : m.status === "overdue" ? "逾時" : "預定"}
                </span>
                {(m.status === "pending" || m.status === "overdue") && (
                  <button className="btn primary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => giveMed(i)}>執行</button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "tasks" && (
          <div className="card">
            <div className="card-head"><div className="card-title">護理任務</div></div>
            {tasks.map((t, i) => (
              <div key={i} className="row" onClick={() => toggleTask(i)} style={{ cursor: "pointer" }}>
                <button className={`task-check ${t.done ? "done" : ""}`}>{t.done && "✓"}</button>
                <span className="rtime mono">{t.time}</span>
                <span className="rname" style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                {t.priority === "high" && !t.done && <span className="rstatus overdue">優先</span>}
              </div>
            ))}
          </div>
        )}

        {tab === "notes" && (
          <div className="card">
            <div className="card-head">
              <div className="card-title">護理紀錄</div>
              <button className="btn primary" style={{ padding: "4px 10px", fontSize: 11 }}><Icon name="plus" className="ic sm" /> 新增紀錄</button>
            </div>
            {notes.map((n, i) => (
              <div key={i} className="note">
                <div className="note-head"><span><span className="note-author">{n.author}</span> · {n.role}</span><span>{n.at}</span></div>
                <div className="note-body">{n.body}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "labs" && (
          <div className="card">
            <div className="card-head"><div className="card-title">最近檢驗結果</div></div>
            <LabResults bed={bed} />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniScore({ label, value, max, warn }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: "var(--text-2)" }}>{label}</span>
        <span className="mono" style={{ fontWeight: 700, color: warn ? "var(--crit)" : "var(--text)" }}>{value} / {max}</span>
      </div>
      <div style={{ height: 5, background: "var(--bg-2)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: warn ? "var(--crit)" : "var(--primary)", borderRadius: 99 }} />
      </div>
    </div>
  );
}

function VitalsTrend({ bed }) {
  // Generate fake 24-hour trend
  const hours = 24;
  const hrData = [], spo2Data = [], tempData = [];
  for (let i = 0; i < hours; i++) {
    hrData.push(bed.vitals.hr + Math.sin(i / 3) * 8 + (Math.random() - 0.5) * 5);
    spo2Data.push(Math.min(100, bed.vitals.spo2 + Math.sin(i / 4) * 1.5 + (Math.random() - 0.5) * 1));
    tempData.push(bed.vitals.temp + Math.sin(i / 5) * 0.3 + (Math.random() - 0.5) * 0.1);
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <TrendChart label="心跳 HR (bpm)" data={hrData} color="oklch(60% 0.16 145)" min={40} max={140} />
      <TrendChart label="血氧 SpO₂ (%)" data={spo2Data} color="oklch(58% 0.14 220)" min={85} max={100} />
      <TrendChart label="體溫 T (°C)" data={tempData} color="oklch(60% 0.15 60)" min={35} max={40} />
    </div>
  );
}

function TrendChart({ label, data, color, min, max }) {
  const W = 700, H = 120;
  const step = W / (data.length - 1);
  let d = `M 0 ${H - ((data[0] - min) / (max - min)) * H}`;
  for (let i = 1; i < data.length; i++) {
    d += ` L ${(i * step).toFixed(1)} ${(H - ((data[i] - min) / (max - min)) * H).toFixed(1)}`;
  }
  const area = d + ` L ${W} ${H} L 0 ${H} Z`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="mono" style={{ color: "var(--text-3)" }}>{min} – {max}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 120 }}>
        <path d={area} fill={color} opacity="0.12" />
        <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", marginTop: 4 }}>
        {["00:00", "06:00", "12:00", "18:00", "現在"].map(t => <span key={t}>{t}</span>)}
      </div>
    </div>
  );
}

function LabResults({ bed }) {
  const labs = [
    { name: "WBC", val: (6 + Math.random() * 8).toFixed(1), unit: "10³/µL", ref: "4.0–10.0", flag: bed.status === "crit" ? "H" : "" },
    { name: "Hgb", val: (11 + Math.random() * 3).toFixed(1), unit: "g/dL", ref: "12.0–16.0", flag: "" },
    { name: "Platelet", val: Math.floor(150 + Math.random() * 150), unit: "10³/µL", ref: "150–400", flag: "" },
    { name: "CRP", val: (0.5 + Math.random() * 12).toFixed(2), unit: "mg/dL", ref: "<0.5", flag: bed.status !== "ok" ? "H" : "" },
    { name: "Cr", val: (0.8 + Math.random() * 1).toFixed(2), unit: "mg/dL", ref: "0.6–1.2", flag: "" },
    { name: "Na⁺", val: Math.floor(135 + Math.random() * 8), unit: "mEq/L", ref: "135–145", flag: "" },
    { name: "K⁺", val: (3.5 + Math.random() * 1.5).toFixed(1), unit: "mEq/L", ref: "3.5–5.1", flag: "" },
    { name: "Glucose", val: Math.floor(90 + Math.random() * 80), unit: "mg/dL", ref: "70–100", flag: "H" },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 40px", fontSize: 11, color: "var(--text-3)", padding: "4px 0", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
        <span>項目</span><span>數值</span><span>單位</span><span>參考範圍</span><span></span>
      </div>
      {labs.map((l, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 40px", fontSize: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{l.name}</span>
          <span className="mono" style={{ color: l.flag === "H" ? "var(--crit)" : l.flag === "L" ? "var(--accent)" : "var(--text)", fontWeight: 700 }}>{l.val}</span>
          <span style={{ color: "var(--text-3)" }}>{l.unit}</span>
          <span style={{ color: "var(--text-3)" }} className="mono">{l.ref}</span>
          {l.flag && <span className="rstatus overdue">{l.flag}</span>}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { PatientDetail });

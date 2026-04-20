// Bed card + bed grid
function timeAgo(ms) {
  const d = Math.floor((Date.now() - ms) / 86400000);
  if (d === 0) return "今日入院";
  return `入院 ${d} 天`;
}

function MiniEcg({ hr, status }) {
  const points = useWaveform({
    generator: (i) => ecgAt(i, hr + (status === "crit" ? Math.sin(i / 50) * 6 : 0)),
    length: 80, interval: 80,
  });
  const color = status === "crit" ? "oklch(62% 0.19 25)" : status === "warn" ? "oklch(75% 0.15 75)" : "oklch(65% 0.14 155)";
  return (
    <svg className="mini-ecg" viewBox="0 0 80 24" preserveAspectRatio="none">
      <path d={toPath(points, 80, 24)} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function BedCard({ bed, onClick, density }) {
  if (bed.empty) {
    return (
      <div className="bed empty" onClick={onClick}>
        <div className="bed-head">
          <div className="bed-num">{bed.roomNum}-{bed.bedNum}</div>
          <div className="bed-badges">
            <span className="badge" style={{ background: "var(--bg-2)", color: "var(--text-3)" }}>空床</span>
          </div>
        </div>
        <div className="bed-body" style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 12 }}>
          <div style={{ textAlign: "center" }}>
            <Icon name="plus" className="ic" />
            <div style={{ marginTop: 6 }}>可接收新病患</div>
          </div>
        </div>
      </div>
    );
  }
  const v = bed.vitals;
  const hrWarn = v.hr > 100 || v.hr < 60;
  const spo2Warn = v.spo2 < 94;
  const tempWarn = v.temp > 37.8;
  const bpWarn = v.sbp < 100 || v.sbp > 160;

  const className = `bed ${bed.status} ${density || ""}`;

  return (
    <div className={className} onClick={onClick}>
      <div className="bed-head">
        <div className="bed-num">{bed.roomNum}-{bed.bedNum}</div>
        <div className="bed-badges">
          {bed.attentions.map((a, i) => (
            <span key={i} className={`badge ${a.k}`}>{a.label}</span>
          ))}
        </div>
      </div>
      <div className="bed-body">
        <div className="pt-name">{bed.name} <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>{bed.gender} · {bed.age}歲</span></div>
        <div className="pt-dx" title={bed.dx}>{bed.dx}</div>
      </div>
      <div className="vitals">
        <div className={`vital hr ${hrWarn ? 'abn' : ''}`}>
          <span className="label">HR</span>
          <span className="value">{Math.round(v.hr)}</span>
        </div>
        <div className={`vital spo2 ${spo2Warn ? 'abn' : ''}`}>
          <span className="label">SpO₂</span>
          <span className="value">{v.spo2}<span className="unit">%</span></span>
        </div>
        <div className={`vital bp ${bpWarn ? 'abn' : ''}`}>
          <span className="label">BP</span>
          <span className="value">{v.sbp}/{v.dbp}</span>
        </div>
        <div className={`vital temp ${tempWarn ? 'abn' : ''}`}>
          <span className="label">T</span>
          <span className="value">{v.temp.toFixed(1)}</span>
        </div>
      </div>
      <div className="bed-foot">
        {bed.pendingMeds > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className={`pending-dot ${bed.pendingMeds > 2 ? "crit" : "warn"}`}></span>
            {bed.pendingMeds} 項用藥待執行
          </span>
        )}
        {bed.pendingMeds === 0 && bed.pendingTasks > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="pending-dot ok"></span>
            {bed.pendingTasks} 項任務
          </span>
        )}
        {bed.pendingMeds === 0 && bed.pendingTasks === 0 && (
          <span style={{ color: "var(--text-3)" }}>無待辦</span>
        )}
      </div>
      <MiniEcg hr={v.hr} status={bed.status} />
    </div>
  );
}

Object.assign(window, { BedCard });

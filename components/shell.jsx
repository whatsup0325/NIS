// Sidebar + topbar + rail + layout shell

function Sidebar({ currentWard, onWardChange, stats }) {
  const wards = [
    { id: "A", name: "一般病房 A", count: 24 },
    { id: "B", name: "一般病房 B", count: 18 },
    { id: "ICU", name: "加護病房", count: 12 },
    { id: "ER", name: "急診觀察", count: 8 },
  ];
  const quick = [
    { name: "儀表板", icon: "home", active: true },
    { name: "病患清單", icon: "user", count: stats.total },
    { name: "用藥排程", icon: "pill", count: stats.meds },
    { name: "護理任務", icon: "clipboard", count: stats.tasks },
    { name: "警示中心", icon: "bell", count: stats.alerts },
    { name: "交班紀錄", icon: "chat" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">護</div>
        <div>
          <div className="brand-name">NurseBoard</div>
          <div className="brand-sub">v4.2 · 工作站</div>
        </div>
      </div>

      <div className="nav-section">工作區</div>
      {quick.map((q, i) => (
        <button key={i} className={`nav-item ${q.active ? "active" : ""}`}>
          <Icon name={q.icon} className="ic sm" />
          <span>{q.name}</span>
          {q.count > 0 && <span className="count">{q.count}</span>}
        </button>
      ))}

      <div className="nav-section">病房切換</div>
      {wards.map(w => (
        <button
          key={w.id}
          className={`nav-item ${currentWard === w.id ? "active" : ""}`}
          onClick={() => onWardChange(w.id)}
        >
          <Icon name="bed" className="ic sm" />
          <span>{w.name}</span>
          <span className="count">{w.count}</span>
        </button>
      ))}

      <div className="nurse-card">
        <div className="avatar">佳穎</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>王佳穎 N3</div>
          <div style={{ fontSize: 10, color: "var(--text-3)" }}>白班 · 責任區 01-12</div>
        </div>
        <button style={{ color: "var(--text-3)" }} title="登出">
          <Icon name="logout" className="ic sm" />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ stats, clock, ward, scenario }) {
  return (
    <div className="topbar">
      <div>
        <div className="ward-title">{ward} 病房 · 白班儀表板</div>
        <div className="ward-sub">責任護理師：王佳穎 N3 · 支援：李靜宜、林詩婷 · 值班醫師：林明德</div>
      </div>
      <div className="topbar-meta">
        <div className="meta-chip"><span className="k">在床</span><span className="v">{stats.occupied}/{stats.total}</span></div>
        <div className="meta-chip"><span className="k">空床</span><span className="v ok">{stats.empty}</span></div>
        <div className="meta-chip"><span className="k">警示</span><span className="v crit">{stats.alerts}</span></div>
        <div className="meta-chip"><span className="k">待辦</span><span className="v warn">{stats.meds + stats.tasks}</span></div>
        <div className="clock mono">{clock}</div>
      </div>
    </div>
  );
}

function FilterBar({ filter, setFilter, counts, viewMode, setViewMode }) {
  const filters = [
    { id: "all", label: "全部", num: counts.total },
    { id: "crit", label: "危急", num: counts.crit, dot: "crit" },
    { id: "warn", label: "注意", num: counts.warn, dot: "warn" },
    { id: "ok", label: "穩定", num: counts.ok, dot: "ok" },
    { id: "empty", label: "空床", num: counts.empty },
    { id: "pending", label: "有待辦", num: counts.pending },
  ];
  return (
    <div className="filters">
      {filters.map(f => (
        <button
          key={f.id}
          className={`filter-chip ${filter === f.id ? "active" : ""}`}
          onClick={() => setFilter(f.id)}
        >
          {f.dot && <span className={`dot ${f.dot}`} />}
          {f.label}
          <span className="num">{f.num}</span>
        </button>
      ))}
      <div style={{ marginLeft: "auto" }} className="seg">
        <button className={viewMode === "comfort" ? "on" : ""} onClick={() => setViewMode("comfort")}>標準</button>
        <button className={viewMode === "compact" ? "on" : ""} onClick={() => setViewMode("compact")}>緊湊</button>
        <button className={viewMode === "large" ? "on" : ""} onClick={() => setViewMode("large")}>放大</button>
      </div>
    </div>
  );
}

function RightRail({ alerts, tasks, feed, onToggleTask }) {
  return (
    <aside className="rail">
      <div className="rail-section">
        <div className="rail-head">
          <div className="rail-title">
            <Icon name="bell" className="ic sm" />
            即時警示
          </div>
          <span className="rail-count">{alerts.length}</span>
        </div>
        {alerts.length === 0 && <div className="empty-state">目前無警示</div>}
        {alerts.map((a, i) => (
          <div key={i} className={`alert-item ${a.level}`}>
            <div className="alert-icon">{a.level === "crit" ? "!" : a.level === "warn" ? "△" : "i"}</div>
            <div className="alert-body">
              <div className="alert-title">{a.title}</div>
              <div className="alert-meta">{a.bed} · {a.time} · {a.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rail-section">
        <div className="rail-head">
          <div className="rail-title">
            <Icon name="clipboard" className="ic sm" />
            我的任務
          </div>
          <span className="rail-count">{tasks.filter(t => !t.done).length} / {tasks.length}</span>
        </div>
        {tasks.map((t, i) => (
          <div key={i} className={`task-item ${t.done ? 'task-done' : ''}`}>
            <button className={`task-check ${t.done ? "done" : ""}`} onClick={() => onToggleTask(i)}>
              {t.done && "✓"}
            </button>
            <div className="task-body">
              <div className="task-title">{t.title}</div>
              <div className="task-meta">
                <span className={`task-time ${t.urgency}`}>{t.time}</span>
                <span>·</span>
                <span>床 {t.bed}</span>
                <span>·</span>
                <span>{t.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rail-section">
        <div className="rail-head">
          <div className="rail-title">
            <Icon name="chart" className="ic sm" />
            病患異動
          </div>
        </div>
        {feed.slice(0, 8).map((f, i) => {
          const color = {
            admit: "var(--ok)", discharge: "var(--text-3)", transfer: "var(--accent)",
            alert: "var(--crit)", med: "var(--primary)", order: "var(--purple)", task: "var(--text-3)"
          }[f.type] || "var(--text-3)";
          const label = {
            admit: "入院", discharge: "出院", transfer: "轉床",
            alert: "警示", med: "給藥", order: "醫囑", task: "任務"
          }[f.type];
          return (
            <div key={i} className="feed-item">
              <span className="feed-time mono">{f.t}</span>
              <span className="feed-dot" style={{ background: color }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  <span style={{ color: "var(--text-3)" }}> · 床 {f.bed}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-2)" }}>{f.name} — {f.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar, Topbar, FilterBar, RightRail });

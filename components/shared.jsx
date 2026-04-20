// Small presentational helpers shared across views

const Icon = ({ name, className = "ic" }) => {
  const paths = {
    heart: "M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z",
    pulse: "M3 12h4l2-7 4 14 2-7h6",
    pill: "M10.5 3.5L20 13a4.5 4.5 0 01-6.5 6.5L4 10A4.5 4.5 0 0110.5 3.5zM8 8l8 8",
    bell: "M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2zM10 21a2 2 0 004 0",
    user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    bed: "M2 7v10M22 17V11a2 2 0 00-2-2H10v8M2 17h20M6 13a2 2 0 100-4 2 2 0 000 4z",
    arrowLeft: "M19 12H5M12 19l-7-7 7-7",
    arrowRight: "M5 12h14M12 5l7 7-7 7",
    search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
    filter: "M3 4h18l-7 9v6l-4 2v-8L3 4z",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    alert: "M12 9v4M12 17h0M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    plus: "M12 5v14M5 12h14",
    clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
    flame: "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z",
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-8h-6v8H5a2 2 0 01-2-2V9z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    chat: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
    chart: "M3 3v18h18M7 14l4-4 4 4 5-5",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
    phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    info: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h0",
  };
  return React.createElement("svg", { className, viewBox: "0 0 24 24" },
    React.createElement("path", { d: paths[name] || paths.info })
  );
};

// Live waveform hook — returns an array of y values that shifts every tick
function useWaveform({ generator, length = 200, interval = 50 }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);
  const points = [];
  for (let i = 0; i < length; i++) {
    points.push(generator(i + tick));
  }
  return points;
}

// Generate ECG-like shape at phase p
function ecgAt(p, hr) {
  const period = Math.max(40, Math.floor(6000 / hr)); // samples per beat
  const x = p % period;
  const n = x / period;
  // QRS complex around 0.15-0.25, P around 0.05, T around 0.55
  if (n < 0.04) return 0;
  if (n < 0.08) return -0.08 * Math.sin((n - 0.04) / 0.04 * Math.PI);
  if (n < 0.14) return 0;
  if (n < 0.16) return -0.15;
  if (n < 0.18) return 1.0;
  if (n < 0.20) return -0.4;
  if (n < 0.25) return 0;
  if (n < 0.45) return 0.15 * Math.sin((n - 0.25) / 0.2 * Math.PI);
  return 0;
}

function plethAt(p, hr) {
  const period = Math.max(40, Math.floor(6000 / hr));
  const x = p % period;
  const n = x / period;
  // Smooth dicrotic pulse
  if (n < 0.1) return 0;
  if (n < 0.4) return Math.pow(Math.sin((n - 0.1) / 0.3 * Math.PI), 1.5);
  if (n < 0.6) return 0.25 * Math.sin((n - 0.4) / 0.2 * Math.PI);
  return 0;
}

function respAt(p, rr) {
  const period = Math.max(60, Math.floor(6000 / rr * 0.06));
  return Math.sin((p / period) * Math.PI * 2) * 0.7;
}

// Draw waveform inline SVG path
function toPath(values, w, h) {
  if (!values.length) return "";
  const step = w / (values.length - 1);
  const mid = h / 2;
  const amp = h * 0.45;
  let d = `M 0 ${mid - values[0] * amp}`;
  for (let i = 1; i < values.length; i++) {
    d += ` L ${(i * step).toFixed(1)} ${(mid - values[i] * amp).toFixed(1)}`;
  }
  return d;
}

Object.assign(window, { Icon, useWaveform, ecgAt, plethAt, respAt, toPath });

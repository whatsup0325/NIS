# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

No build step. Open `護理工作站.html` directly in a browser (file:// or any static server). React 18, ReactDOM, and Babel are loaded via CDN; JSX is transpiled in-browser at runtime.

## Architecture

This is a zero-dependency single-page prototype. There is no npm, no bundler, no module system.

**Script loading order** (defined in `護理工作站.html`):
1. `data.jsx` — generates mock patient/bed data, exposes to `window`: `BEDS`, `makeMeds`, `makeTasks`, `makeNotes`, `MOVEMENT_FEED`
2. `components/shared.jsx` — exposes shared helpers to `window`: `Icon`, `useWaveform`, `ecgAt`, `plethAt`, `respAt`, `toPath`
3. `components/bed.jsx` — `BedCard`, `MiniEcg` (depends on shared.jsx globals)
4. `components/shell.jsx` — `Sidebar`, `TopBar`, `RailPanel`, layout wrappers
5. `components/detail.jsx` — `PatientDetail` full-screen overlay with tabs (overview, meds, tasks, notes)
6. Inline `<script type="text/babel">` in the HTML — defines `App` (root component with all top-level state)

**Global state** lives in `App` (`護理工作站.html`): theme, scenario, density, selected bed, ward filter, toast queue, live beds array, movement feed, rail tasks.

**Inter-script communication** is done exclusively via `Object.assign(window, {...})` at the bottom of each file. Never use ES module syntax (`import`/`export`).

**Runtime config** is `window.TWEAKS` (set in an inline `<script>` block between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` markers). Changing this object changes defaults without touching component code.

## Key patterns

- **Theming**: CSS custom properties (`--bg-0` through `--bg-3`, `--text-1` through `--text-3`, `--accent-*`). Dark/light themes are controlled by a `data-theme` attribute on `<html>`.
- **Live waveforms**: `useWaveform({ generator, length, interval })` in `shared.jsx` drives animated SVG paths. ECG, pleth, and resp waveform math is in `ecgAt`, `plethAt`, `respAt`.
- **Vitals drift simulation**: `setInterval` in `PatientDetail` mutates vitals state every 1200 ms to simulate live monitoring.
- **Patient status**: `"ok"` / `"warn"` / `"crit"` — drives CSS class names on bed cards and color coding throughout.
- **Density modes**: `"comfort"` / `"compact"` passed as className to `BedCard` and grid containers, controlled via CSS.
- **Toasts**: pushed into `toasts` state in `App`, consumed and rendered by the shell.

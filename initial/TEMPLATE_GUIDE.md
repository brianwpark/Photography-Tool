# AstroPro Web App Template — Technical & Architecture Guide

This document provides a comprehensive technical breakdown of [`index.html`](file:///d:/Web/index.html). It describes the design system, DOM hierarchy, state management, calculation formulas, and steps to customize or extend the template for production photography field tools.

---

## 1. Architectural Overview

- **Format:** Single-File Application (SPA) containing HTML, CSS, and Vanilla JavaScript.
- **Dependencies:** 
  - [Tailwind CSS CDN](https://cdn.tailwindcss.com) (Utility-first styling with runtime custom configuration).
  - [Google Fonts](https://fonts.google.com) (`Plus Jakarta Sans` for interface typography; `JetBrains Mono` for optical/astronomical measurements).
- **Responsive Targets:** Mobile-first design optimized for iOS Safari / Android Chrome (`viewport-fit=cover`), tablets (iPad portrait/landscape), and desktop displays with responsive max-width containment (`max-w-4xl`).
- **Zero Build Step:** Double-clicking `index.html` runs natively in any modern browser without Node.js, bundlers, or compilation.

---

## 2. Design System & Visual Language

The visual system is modeled after professional dark-mode field photography apps (e.g., PhotoPills) to preserve night-adjusted vision in low-light and astrophotography environments.

### 2.1 Color Tokens

| Token Name | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| **Obsidian Dark** | `#080d16` to `#0e1524` | Ambient radial and linear background gradient |
| **Card Glass Surface** | `rgba(19, 27, 41, 0.75)` | Floating card background with `backdrop-filter: blur(20px)` |
| **Card Border** | `rgba(255, 255, 255, 0.08)` | High-precision translucent border separating modules |
| **Electric Cyan** | `#12d6c7` (Glow: `rgba(18, 214, 199, 0.35)`) | Primary interactive accents, active tabs, optical focus metrics |
| **Solar Amber** | `#fca311` (Glow: `rgba(252, 163, 17, 0.35)`) | ND bulb timers, warning indicators, and ISS transit alerts |
| **Terminal Mono** | `#e2e8f0` / `#94a3b8` | Numerical values, coordinates, and optical parameters |

### 2.2 Custom Graphical Components

1. **3D Realistic Moon & Orbital Ring:**
   - **Moon Disk:** Pure CSS radial gradient with layered blend-mode crater textures and terminator shadow simulating a 93% Waning Gibbous phase.
   - **Orbital Ellipse:** Rotated SVG-style border ellipse (`transform: rotate(-22deg)`) holding an animated pulsing satellite node (`@keyframes satPulse`).
2. **Rotary Aperture Dial (`.dial-knob`):**
   - Skeuomorphic tactile knob with multi-layer radial gradient, bevel lighting, and an active cyan indicator notch.
3. **Circular SVG Countdown Ring (`.timer-ring-circle`):**
   - SVG `<circle>` with `stroke-dasharray="283"` and dynamic `stroke-dashoffset` calculated via remaining exposure seconds.
4. **AR Viewfinder HUD (`#arOverlay`):**
   - High-contrast crosshairs, projected lunar target lock box, and trajectory vector lines for camera alignment.

---

## 3. DOM Structure & View Architecture

The application uses an inline view-switching model where all modular views coexist in `<main>` and toggle via the `showView(viewId)` controller function.

```
index.html
├── <head> (Meta tags, Tailwind config, Font imports, Component CSS)
├── <header> (Sticky app bar)
│   ├── Logo & Brand Title ("AstroPro")
│   ├── Geolocation Badge (GPS Coordinates + Location)
│   ├── Quick Action: AR Camera launcher
│   └── Category Tabs Bar (Dashboard, DoF, ND Timer, Astro, Moon, FoV)
├── <main> (Single-page view container)
│   ├── #view-dashboard (Hub overview matching design preview)
│   │   ├── Hero Row: Moon Orbit Card + ISS Transit Card + AR Viewfinder Button
│   │   ├── 3-Card Grid: DoF Card + ND Countdown Card + Astrophotography Card
│   │   └── FoV Comparison Banner
│   ├── #view-dof (Full Depth of Field & Hyperfocal calculator)
│   ├── #view-nd (Full Reciprocity Exposure & ND Filter Timer)
│   ├── #view-astro (500 Rule, NPF Rule & Hyperlapse Shoot Calculator)
│   ├── #view-moon (Lunar Ephemeris & TransitChaser schedule)
│   └── #view-fov (Multi-sensor crop factor comparison preview)
├── <nav> (Fixed bottom navigation bar for thumb-friendly mobile access)
├── <div id="arOverlay"> (Fullscreen AR Camera Simulator HUD)
└── <script> (Mathematical engines, timers, and DOM event bindings)
```

---

## 4. Functional Modules & Mathematics

### 4.1 Depth of Field (DoF) & Hyperfocal Distance
Located in `#view-dof` and summarized on Dashboard Card 1.

- **Formula for Hyperfocal Distance ($H$):**
  $$H = \frac{f^2}{N \cdot c} + f$$
  Where:
  - $f$: Focal length in millimeters.
  - $N$: Aperture $f$-number (e.g., $2.8$).
  - $c$: Circle of Confusion in millimeters, calculated dynamically as $c = \frac{0.029\text{ mm}}{\text{crop\_factor}}$.
- **Near Sharp Limit ($D_n$):**
  $$D_n = \frac{s \cdot H}{H + s}$$
- **Far Sharp Limit ($D_f$):**
  $$D_f = \begin{cases} \frac{s \cdot H}{H - s} & \text{if } H > s \\ \infty & \text{if } H \le s \end{cases}$$
- **Total Depth of Field:** $\text{DoF} = D_f - D_n$.

### 4.2 Exposure & ND Filter Timer
Located in `#view-nd` and summarized on Dashboard Card 2.

- **Reciprocity Law:**
  $$T_{\text{ND}} = T_{\text{base}} \times 2^{\text{stops}}$$
  *Example:* A base daylight shutter speed of $1/125\text{s}$ with a 10-stop ND filter ($2^{10} = 1024$) yields:
  $$T_{\text{ND}} = \frac{1}{125} \times 1024 \approx 8.19\text{ seconds}$$
  A $1/8\text{s}$ base exposure with a 10-stop filter yields $128\text{ seconds}$ ($02\text{m } 08\text{s}$).
- **Timer Engine:**
  - Standard JavaScript `setInterval` managing `timerRemaining` and updating `dashTimerCircle` and `bigTimerCircle` offsets in real time.
  - Supports Pause, Resume, and Reset states.

### 4.3 Astrophotography Rules (500 Rule vs. NPF Rule)
Located in `#view-astro` and summarized on Dashboard Card 3.

- **Classic 500 Rule:**
  $$t_{\text{max}} = \frac{500}{f \times \text{crop}}$$
- **Accurate NPF Rule:**
  $$t_{\text{max}} = \frac{35 \times N + 30 \times p}{f}$$
  Where $p$ is sensor pixel pitch in microns ($\mu\text{m}$) and $N$ is aperture. This prevents trailing on high-resolution modern camera sensors.

### 4.4 Hyperlapse Photo Shoot Calculator
Computes exact intervalometer requirements for night sky and motion timelapse:
- $\text{Total Frames} = \text{Target Video Length (s)} \times \text{Target FPS}$
- $\text{Total Session Duration} = \text{Total Frames} \times \text{Interval Between Shots (s)}$
- Accommodates celestial rotation angle (approx. $15^\circ$ per hour).

### 4.5 Moon Alignment & TransitChaser
Located in `#view-moon`.
- Displays real-time altitude, azimuth, and illumination percentage.
- Lists transit events for the International Space Station (ISS), commercial aircraft, and rocket launches crossing the lunar disk.
- Ties into the AR Viewfinder simulator (`#arOverlay`).

### 4.6 Field of View (FoV) & Sensor Crop Converter
Located in `#view-fov`.
- Computes 35mm equivalent focal lengths across four standard formats:
  - Medium Format ($44 \times 33\text{mm}$, Crop factor $0.79\times$)
  - Full Frame ($36 \times 24\text{mm}$, Crop factor $1.0\times$)
  - APS-C ($23.6 \times 15.6\text{mm}$, Crop factor $1.5\times$ / $1.6\times$)
  - Micro Four Thirds ($17.3 \times 13\text{mm}$, Crop factor $2.0\times$)
- Renders nested SVG/CSS bounding boxes for visual framing comparison.

---

## 5. JavaScript Controller API

| Function | Description |
| :--- | :--- |
| `showView(viewId)` | Activates `#view-${viewId}`, updates top category tab underlines, and highlights the bottom navigation bar. |
| `toggleARModal()` | Toggles the visibility of `#arOverlay` camera HUD. |
| `detectLocation()` | Queries browser `navigator.geolocation` and updates `#headerCoords` with real-time latitude/longitude. |
| `toggleTimer()` / `resetTimer()` | Starts, pauses, and resets the exposure countdown timer. |
| `selectND(stops)` | Updates active ND filter preset (3, 6, 10, or 15 stops) and recalculates bulb duration. |
| `runDoFCalc()` | Re-evaluates hyperfocal, near, far, and total DoF based on sensor, focal length, aperture, and distance. |
| `calcAstroRules()` | Updates 500 Rule and NPF Rule shutter speed limits based on pixel pitch and focal length. |
| `calcHyperlapseSuite()` | Computes total frames and shooting session duration for timelapse/hyperlapse. |
| `calcFoV()` | Computes equivalent focal lengths across all four sensor standards. |

---

## 6. How to Extend / Integrate with Backend APIs

1. **Live Transit API (TransitChaser Integration):**
   - Replace the static transit mock in `view-moon` with a fetch call to an orbital ephemeris service (e.g., CelesTrak TLE data or OpenSky Network REST API for real-time aircraft ADS-B transits).
2. **Astronomical Ephemeris Library:**
   - For offline ephemeris calculation without external network calls, include [SunCalc.js](https://github.com/mourner/suncalc) (`<script src="https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js"></script>`) to compute exact Moon position, phases, and rise/set times for any GPS coordinate.
3. **WebRTC Camera AR Stream:**
   - In `toggleARModal()`, connect `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` to stream the real smartphone camera feed behind the crosshair HUD.

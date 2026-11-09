# AstroPro Photography Field Suite — Master System Specification
> **Comprehensive Architectural, Design, and Functional Specification for AI Agent Ingestion**  
> *Version:* 2.4.0 • *Platform:* Responsive Web Application (Mobile, Tablet, Desktop) • *Deployment:* Vercel / Vite Production  
> *Inspired by:* PhotoPills®, TransitChaser.com (Rey Sandu Godakumbura), Planit Pro®

---

## 1. Executive Summary & Purpose

**AstroPro Field Suite** is a professional-grade astronomical and photographic field companion web application. Designed to operate in high-contrast, dark-adapted conditions (preserving night-vision for astrophotographers and field operators), the suite provides an end-to-end collection of optical calculators, celestial ephemeris solvers, high-speed 3D aircraft transit trackers, and augmented reality camera viewfinders.

This document serves as the **single source of truth** regarding the application's visual design system, UI tokens, component hierarchy, responsive layouts, optical/astronomical mathematics, algorithmic geometry engines, and software architecture. Any AI agent, developer, or system ingesting this file can fully understand, reproduce, debug, or extend the entire application.

---

## 2. Technical Stack & Architecture

- **Core Framework**: React 18+ (Functional Components, Hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`).
- **Build Tooling & Bundler**: Vite 8+ (configured with `@vitejs/plugin-react` and `@vitejs/plugin-basic-ssl` for mobile WebRTC testing).
- **CSS Framework**: Tailwind CSS 3+ with PostCSS and custom dark theme token extensions.
- **Iconography**: `lucide-react` (clean geometric Phosphor/Solar style vector line icons, strokes $1.5\text{px}$ to $2.0\text{px}$).
- **Celestial & Ephemeris Engine**:
  - `suncalc` (version 2.0.1 / 1.x) for solar coordinates, lunar illumination fractions, and phase angles.
  - Custom astronomical geodetic solvers for lunar distance (apogee/perigee), angular diameters, shadow lengths, and twilight definitions.
  - Custom Keplerian/vector solvers for low Earth orbit (ISS, Tiangong CSS), rocket ascents, and high-altitude commercial aircraft transits.
- **Device & Browser APIs**:
  - **WebRTC (`navigator.mediaDevices.getUserMedia`)**: Environmental back-facing camera video stream with fallback simulation scene.
  - **DeviceOrientation & Compass API**: Reads `e.webkitCompassHeading` (iOS Safari) and `e.alpha` (Android / standard W3C) with exponential smoothing filter.
  - **HTML5 Geolocation API**: Observer GPS coordinates (latitude, longitude, altitude).
  - **Web Audio API (`AudioContext`)**: Zero-dependency procedural sound synthesizer for timer countdown clicks, radar pings, and siren alarms.
  - **Web Notifications API**: Browser push notifications for incoming celestial transits.

---

## 3. Design System & Visual Guidelines

The visual design follows strict tactile field tool standards (derived from `landing-page-design` and tactical instrumentation), avoiding visual clutter and maintaining dark adaptation.

### 3.1 Color Tokens & Palette

| Token Name | Hex / RGBA | Semantic Purpose & Usage |
| :--- | :--- | :--- |
| **Obsidian 950** | `#080d16` / `#0b111e` | Deep night viewport root background; preserves retinal rod adaptation. |
| **Surface Dark** | `#111827` / `#131b29` | Floating cards, panels, and drawer backgrounds (glassmorphic styling). |
| **Surface Raised** | `#1e293b` / `#1f2937` | Elevated containers, table headers, and inactive button states. |
| **Glass Border** | `rgba(255, 255, 255, 0.08)` to `0.15` | Subtle, clean component bounding borders (`border border-white/10`). |
| **Electric Cyan** | `#12d6c7` (`#38bdf8` / `#00C3FF`) | Primary interactive accent, active navigation tabs, sharp focus markers, radar indicators. Glow: `rgba(18, 214, 199, 0.35)`. |
| **Solar Amber** | `#fca311` (`#f59e0b` / `#fbbf24`) | Sun trajectories, bulb exposure countdowns, celestial discs, warnings. Glow: `rgba(252, 163, 17, 0.35)`. |
| **Emerald Green**| `#10b981` / `#34d399` | Live radar active signals, high-quality transit centerlines, optimal framing scores. |
| **Ruby Red** | `#ef4444` / `#f87171` | Chord track across solar/lunar disk, urgent solar safety alerts, stop actions. |
| **Lunar Silver** | `#e2e8f0` / `#ffffff` | High-contrast primary headings, numeric values, and active typography. |
| **Muted Slate** | `#64748b` / `#94a3b8` | Secondary labels, units (`mm`, `km`, `arcsec`), and subtle metadata. |

### 3.2 Typography Rules
- **UI Prose Font**: `Plus Jakarta Sans`, `Geist`, or system sans-serif (`font-sans`).
- **Telemetry & Numbers**: `JetBrains Mono`, `Geist Mono`, or monospace (`font-mono`) exclusively for all coordinates, distances, shutter speeds, f-stops, and timestamps.
- **Font Weights**: Maximum `font-bold` (700) or `font-semibold` (600). Never use ultra-bold 900+ or italics in UI controls.
- **Numerical Formatting**: Fixed decimal precision on optical metrics (e.g. `2.8 m`, `14.2 km`, `31.2 arcsec`).

### 3.3 Spacing Scale & Nested Radii
- **Spacing Steps**: `0`, `2px`, `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`.
- **Button Standards**:
  - Primary Field Action: `text-sm sm:text-base font-semibold px-4 py-2.5 rounded-xl`.
  - Header / Tab Button: `text-xs font-mono px-3 py-1.5 rounded-lg`.
- **Nested Corner Radius Law**:
  $$\text{Radius}_{\text{inner}} = \text{Radius}_{\text{outer}} - \text{Padding}$$
  *(Applied when $\text{Radius}_{\text{outer}} - \text{Padding} \ge 2\text{px}$).*

### 3.4 Responsive Layout Architecture
- **Mobile Handheld (< 768px)**:
  - Sticky bottom thumb navigation bar (`BottomNav.jsx`) with 5 primary suites + drawer toggle.
  - Minimum touch target: $44\text{px} \times 44\text{px}$.
  - Single-column scrolling cards with horizontal swipeable chip selectors for sub-tabs.
- **Tablet (768px – 1024px)**:
  - Collapsible persistent sidebar or top segmented controls.
  - Split-pane layout: interactive visualizer on the left/top, configuration sliders on the right/bottom.
- **Desktop Workstation (≥ 1024px)**:
  - Fixed persistent tactical sidebar (`Sidebar.jsx`) with quick-status badges.
  - Central max-width container (`max-w-7xl mx-auto p-6`).
  - Multi-column dashboard grid (e.g., 7-column list vs. 5-column live 3D preview card).

---

## 4. Complete Functional Specifications & Tool Inventory

The application is organized into **Core Photography Suites**, accessible via top routing in `App.jsx`:

```
App.jsx (Top-Level Controller & Shared Ephemeris State)
├── Field Hub (DashboardView)
├── Planner & Celestial Suite (CelestialSuiteView)
│   ├── Map Planner (PlannerView)
│   ├── Transit Chaser (MoonTransitView / TransitChaserView)
│   ├── Sun & Twilights (SunView)
│   └── Solar & Lunar Eclipses
├── Depth of Field Suite (DofSuiteView)
│   ├── DoF Calculator (DofView)
│   └── Hyperfocal Table Matrix (DofTableView)
├── Field of View Suite (FovSuiteView)
│   ├── FoV & Crop Factor Converter (FovView)
│   ├── 2-Camera Focal Length Match (FocalLengthMatchView)
│   └── Subject Distance Triangulation (SubjectDistanceView)
├── Exposure & ND Suite (ExposureSuiteView)
│   ├── ND Filter Stacker & Reciprocity (NdTimerView)
│   ├── Test Shot Exposure Reciprocity (ExposureView)
│   └── Animated Circular Bulb Timer (TimerView)
├── Astrophotography Suite (AstroSuiteView)
│   ├── Spot Stars 500/NPF Calculator (SpotStarsView)
│   ├── Star Trails Simulator (StarTrailsView)
│   ├── Timelapse & Hyperlapse (TimelapseView)
│   └── Annual Meteor Showers Calendar (MeteorShowersView)
└── Augmented Reality Viewfinder Modal (ArViewfinderModal)
```

---

### 4.1 Field Hub (`DashboardView.jsx`)
- **Real-Time 3D Moon Component (`RealisticMoon.jsx`)**:
  - SVG/CSS rendered lunar disk with photorealistic crater shading, dynamic terminator curve, and illumination percentage.
  - Live satellite or aircraft silhouette badge indicating the next impending transit.
- **Telemetry Bar**: Current solar altitude, lunar altitude, moon phase name, astronomical twilight countdown, and observer GPS coordinates.
- **Quick-Access Tool Launchers**: 1-tap jump to any calculator or camera tool.

---

### 4.2 Planner & Ephemeris Suite (`CelestialSuiteView.jsx`)

#### 1. Interactive Map Planner (`PlannerView.jsx`)
- Map-based alignment tool between the camera location (Pin Black) and subject/monument (Pin Blue).
- Real-time geodetic calculations: distance ($m$ or $km$), bearing azimuth ($^\circ$), and elevation angle ($\Delta \text{altitude}$).
- Visual Sun and Moon path overlays showing exact rise, set, and alignment times.

#### 2. Sun/Moon Desired Size Tool
- Calculates the exact required distance from camera to subject to achieve a desired physical Sun or Moon disc diameter behind a monument:
  $$d = \frac{S}{2 \cdot \tan\left(\frac{\theta_{\text{body}}}{2}\right)} \approx 107.5 \times S$$
- Computes apparent diameter of the celestial disk directly on the camera sensor (in $mm$):
  $$\text{Diameter on Sensor (mm)} = \frac{f\text{ (mm)}}{107.5}$$

#### 3. Sun & Twilight Calculator (`SunView.jsx`)
- Computes Solar Noon, Golden Hour, Blue Hour, Civil Twilight ($-6^\circ$), Nautical Twilight ($-12^\circ$), and Astronomical Twilight ($-18^\circ$).
- Real-time physical shadow length multiplier based on solar elevation angle $\alpha$:
  $$\text{Shadow Length} = \frac{\text{Subject Height}}{\tan(\alpha)}$$

#### 4. Eclipses Calendar
- Reference catalog of upcoming total, partial, and annular solar and lunar eclipses with global visibility paths and dates.

---

### 4.3 Transit Chaser Suite (`MoonTransitView.jsx` / `transitChaser.js`)
*Modeled after [TransitChaser.com](https://transitchaser.com/) by Rey Sandu Godakumbura.*

#### A. Transit Modes
1. **Sun Transit**: Aircraft, ISS, or rocket crossing the glowing solar disk (requires Solar ND 5.0 filter).
2. **Moon Transit**: Crossing the illuminated or shadowed lunar disk.
3. **Sun & Moon Combined**: Simultaneous tracking of both celestial bodies.
4. **Contrail Intersections**: Predicts when aircraft condensation trails at FL320+ will drift across the solar or lunar disk, producing aerodynamic rainbow diffraction or shadow bands.
5. **Plane-on-Plane Sightline Alignments**: Predicts when two aircraft at different flight levels (e.g. A380 at FL380 and B777 at FL340) cross each other from the observer's line of sight, creating an optical double silhouette.

#### B. Operation Modes
- **Easy Mode (1-Tap Setup)**: Automatically configures optimal defaults (50 km search radius, 120s prediction window, 3D Boosted Mode enabled, 2.5° detection margin).
- **Manual Mode (Granular Controls)**:
  - **Search Radius Slider**: $10\text{ km}$ to $100\text{ km}$.
  - **Prediction Window Slider**: $30\text{s}$ to $900\text{s}$ ($15\text{ min}$).
  - **Detection Margin Slider**: $0.1^\circ$ (tight telephoto) to $4.0^\circ$ (wide angle).
  - **Flight Level Filtering**: Min FL to Max FL (FL100 – FL450).
  - **Directional Compass Sectors**: All, N, NE, E, SE, S, SW, W, NW.

#### C. Algorithmic Geometry Engine
- **3D Boosted Airspace**: Evaluates true 3D vectors (aircraft altitude, ground speed, vertical climb/descent rate, slant range, and celestial angular diameter) rather than flat 2D angles.
- **Slant Range Formula**:
  $$\text{Range} = \frac{\text{Altitude (m)}}{\sin(\text{Elevation Angle})}$$
- **Aircraft Angular Size**:
  $$\theta_{\text{aircraft}} = 206265 \times \frac{\text{Wingspan (m)}}{\text{Slant Range (m)}} \quad (\text{arcseconds})$$
- **Transit Duration**:
  $$t_{\text{transit}} = \frac{\theta_{\text{celestial}}}{\omega_{\text{angular}}} \approx \frac{1860''}{\omega_{\text{angular}}}$$
- **Hyper Boost / Intense Refinement**: Trajectory stability, Ingress/Centerline/Egress chronometer timing down to tenths of a second, EGM96 geoid height correction, and low-altitude atmospheric refraction.
- **Takeoff Correction**: Dynamically adjusts trajectory vectors for aircraft climbing out from nearby airport runways (+1400 fpm climb rates).
- **SunCalc Engine Selector**: Choose between SunCalc 2.0.1 (high precision) and SunCalc 1.x legacy.

#### D. Plane Watch & Fleet Catalog
- Realistic fleet database: Boeing ($747\text{-}8, 777\text{-}300\text{ER}, 787\text{-}9, 737\text{ MAX}$), Airbus ($A380\text{-}800, A350\text{-}1000, A330\text{neo}, A321\text{neo}$), Space Stations (ISS, Tiangong CSS), and Rockets (SpaceX Falcon 9).
- **⭐ Fun Planes**: Special liveries highlighted (Emirates Expo 2020 Dubai, Qantas Yam Dreaming, ANA Star Wars R2-D2, Lufthansa Retro 50th).
- **Real-Time Callsign Search**: Instant search by flight number or callsign (e.g. `UAE201`, `QFA9`, `ISS`).

#### E. Spatial Corridor & 5 Distance Bands
Evaluates observation quality across 5 lateral distance bands from the centerline:
1. **Centerline ($0\text{ km}$)**: $100\%$ chord length, prime central transit.
2. **Band 1 ($1\text{ km}$)**: $98\%$ chord duration, optimal chord.
3. **Band 2 ($2\text{ km}$)**: $92\%$ chord duration, wide silhouette.
4. **Band 5 ($5\text{ km}$)**: $74\%$ chord duration, limb skim pass.
5. **Band 10 ($10\text{ km}$)**: $45\%$ chord duration, edge graze.
- Includes interactive 3D celestial disc silhouette simulator with lateral offset slider.

#### F. Alerts, Notifications & Data Feeds
- **Procedural Audio Test**: Built-in Web Audio radar ping and transit siren alert checks.
- **Browser Push Notifications**: Instant prompt when an aircraft approaches alignment.
- **Automated Email Alert Dispatch**: Configure user email for alerts sent 3–5 minutes ahead of transit.
- **Data Feeds**: Toggle between Community ADS-B (`adsb.fi`), Flightradar24 API token input, or Local Dump1090/RTL-SDR receiver IP (`http://localhost:8080/data/aircraft.json`).
- **Official How-To Guide (`how_to_use.html`)**: Step-by-step instructions, parameter guidelines, and solar safety warnings.

---

### 4.4 Depth of Field (DoF) & Focus Suite (`DofSuiteView.jsx`)

#### 1. DoF Calculator (`DofView.jsx`)
- **Circle of Confusion ($c$)**: Standardized using the Zeiss formula ($c = \frac{\text{diagonal}}{1730}$):
  - Full Frame ($1.0\times$): $0.029\text{ mm}$
  - APS-C Sony/Nikon ($1.5\times$): $0.019\text{ mm}$
  - APS-C Canon ($1.6\times$): $0.018\text{ mm}$
  - Micro Four Thirds ($2.0\times$): $0.015\text{ mm}$
  - 1-inch ($2.7\times$): $0.011\text{ mm}$
  - Medium Format ($0.79\times$): $0.037\text{ mm}$
- **Hyperfocal Distance ($H$)**:
  $$H = \frac{f^2}{N \cdot c} + f$$
- **Near Sharp Limit ($D_n$) & Far Sharp Limit ($D_f$)**:
  $$D_n = \frac{s \cdot (H - f)}{H + s - 2f} \approx \frac{s \cdot H}{H + s}$$
  $$D_f = \begin{cases} \frac{s \cdot (H - f)}{H - s} & \text{if } H > s \\ \infty & \text{if } H \le s \end{cases}$$
  $$\text{Total DoF} = D_f - D_n$$
  $$\text{Depth in Front} = s - D_n \quad (X\%), \quad \text{Depth Behind} = D_f - s \quad (Y\%)$$
- **1/3-Stop Standard Aperture Progression**:
  $$f/1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45$$
- **Interactive Optical Segment Visualizer**:
  - Horizontal bar showing Camera ($0\text{m}$), Near Limit, Focus Subject, Far Limit, and Hyperfocal marker with percentage distributions.
- **Interoperability**: Seamlessly accepts incoming parameters (`distance`, `focalLength`, `sensorId`) transferred from Subject Distance Triangulation.

#### 2. Hyperfocal Table Matrix (`DofTableView.jsx`)
- Complete two-dimensional quick-reference grid of hyperfocal distances across all focal lengths ($14\text{mm} - 800\text{mm}$) and aperture stops ($f/1.4 - f/22$).

---

### 4.5 Field of View & Framing Suite (`FovSuiteView.jsx`)

#### 1. FoV & Crop Factor Converter (`FovView.jsx`)
- Calculates Horizontal, Vertical, and Diagonal Field of View:
  $$\text{HFoV} = 2 \cdot \arctan\left(\frac{W_{\text{sensor}}}{2 \cdot f}\right) \cdot \frac{180^\circ}{\pi}$$
  $$\text{VFoV} = 2 \cdot \arctan\left(\frac{H_{\text{sensor}}}{2 \cdot f}\right) \cdot \frac{180^\circ}{\pi}$$
- Interactive nested framing comparison showing sensor crops overlaid on a landscape scene.

#### 2. Two-Camera Focal Length Matcher (`FocalLengthMatchView.jsx`)
- Computes equivalent focal length, equivalent aperture, and ISO to maintain identical framing and depth of field across two different camera sensor sizes:
  $$f_2 = f_1 \times \frac{\text{Crop}_1}{\text{Crop}_2}, \quad N_2 = N_1 \times \frac{\text{Crop}_1}{\text{Crop}_2}, \quad \text{ISO}_2 = \text{ISO}_1 \times \left(\frac{\text{Crop}_1}{\text{Crop}_2}\right)^2$$

#### 3. Subject Distance Triangulation (`SubjectDistanceView.jsx`)
- Triangulates the required distance to a subject based on its physical dimensions, sensor framing percentage, and focal length:
  $$\text{Distance} = \frac{f \cdot H_{\text{subject}}}{H_{\text{sensor}} \cdot \text{Framing Fraction}}$$
- Features a direct **"Apply to DoF Calculator"** action button that transfers the calculated distance and lens parameters into the DoF suite.

---

### 4.6 Exposure, ND Filters & Bulb Timers (`ExposureSuiteView.jsx`)

#### 1. Neutral Density (ND) Filter Stacker (`NdTimerView.jsx`)
- Computes final shutter speed based on the photographic reciprocity law:
  $$T_{\text{ND}} = T_{\text{base}} \times 2^{\Delta \text{stops}}$$
- Pre-configured filters: 1-stop to 20-stops, including ND8 (3 stops), ND64 (6 stops), ND1000 (10 stops), Solar ND 5.0 (16.6 stops), and multi-filter stacking.
- Converts fraction speeds ($1/250\text{s}$) to bulb seconds and minutes ($8\text{m }32\text{s}$).

#### 2. Test Shot Reciprocity Converter (`ExposureView.jsx`)
- Converts a quick, high-ISO test shot (e.g. $2\text{s}$ at $f/2.8$ and ISO 6400) into a clean, noise-free long exposure (e.g. $f/8$, ISO 100, plus 10-stop ND filter):
  $$t_2 = t_1 \times \left(\frac{N_2}{N_1}\right)^2 \times \left(\frac{\text{ISO}_1}{\text{ISO}_2}\right) \times 2^{\Delta \text{ND}}$$

#### 3. Animated Circular Bulb Timer (`TimerView.jsx` / `CircularTimer.jsx`)
- High-visibility countdown timer with SVG circular ring and animated `stroke-dashoffset`.
- Visual states: Ready (cyan), Running (amber pulse), Paused, and Complete.
- Audio synthesizer ticks during the last 5 seconds and an audible chime on completion.

---

### 4.7 Astrophotography & Night Suite (`AstroSuiteView.jsx`)

#### 1. Spot Stars Calculator (`SpotStarsView.jsx`)
- **Classic 500 Rule**:
  $$t_{\text{max}} = \frac{500}{f \times \text{crop\_factor}}$$
- **Precision NPF Rule** (factoring sensor resolution, pixel pitch, aperture, and star declination):
  $$t_{\text{max}} = \frac{35 \times N + 30 \times p}{f \times \cos(\delta)}$$
  Where $p$ is sensor pixel pitch in microns ($\mu\text{m}$), $N$ is lens $f$-number, $f$ is focal length in $mm$, and $\delta$ is star declination ($0^\circ$ at celestial equator).

#### 2. Star Trails Calculator (`StarTrailsView.jsx`)
- Calculates trail arc angle based on Earth's sidereal rotation ($\omega = 15.04^\circ/\text{hour} \approx 0.25^\circ/\text{min}$):
  $$\theta = \text{Shooting Duration (hours)} \times 15.04^\circ$$
- Stacking session simulator: calculates number of sub-exposures, interval gap compensation, total memory card size ($MB/GB$), and battery consumption.

#### 3. Timelapse & Hyperlapse Calculator (`TimelapseView.jsx`)
- Calculates shooting parameters from desired clip duration and video frame rate:
  $$\text{Total Frames} = \text{Clip Duration (s)} \times \text{FPS}$$
  $$\text{Shooting Time} = \text{Total Frames} \times \text{Shooting Interval (s)}$$
- Estimates memory consumption in RAW and JPEG.

#### 4. Meteor Showers Calendar (`MeteorShowersView.jsx`)
- Annual calendar of major showers: Perseids, Geminids, Quadrantids, Lyrids, Orionids, Leonids, and Eta Aquariids.
- Metrics: Peak date, Zenithal Hourly Rate (ZHR), radiant celestial position (RA/Dec), parent comet, and real-time lunar phase interference score.

---

### 4.8 Augmented Reality (AR) Viewfinder (`ArViewfinderModal.jsx`)
*Modeled after the PhotoPills Augmented Reality interface (reference image `media_1793857020449_8ec0848b.jpg`).*

#### A. True 3D Spherical Perspective Projection
Rather than decoupled flat angles, the viewfinder projects celestial spherical coordinates $(\theta, \phi)$ onto the flat screen using a full 3D pinhole camera perspective projection matrix:
1. **Celestial Unit Vector**:
   $$x = \cos(\phi) \sin(\theta), \quad y = \sin(\phi), \quad z = \cos(\phi) \cos(\theta)$$
2. **Yaw Rotation ($-\text{Heading}$ around Y-axis)**:
   $$x_1 = x \cos(\psi) - z \sin(\psi), \quad y_1 = y, \quad z_1 = x \sin(\psi) + z \cos(\psi)$$
3. **Pitch Rotation ($-\text{Pitch}$ around X-axis)**:
   $$x_2 = x_1, \quad y_2 = y_1 \cos(\rho) - z_1 \sin(\rho), \quad z_2 = y_1 \sin(\rho) + z_1 \cos(\rho)$$
4. **Point Visibility**: In front of lens when $z_2 > 0.05$.
5. **Roll Rotation around Optical Z-axis**:
   $$x_3 = x_2 \cos(\gamma) - y_2 \sin(\gamma), \quad y_3 = x_2 \sin(\gamma) + y_2 \cos(\gamma)$$
6. **Rectilinear Screen Coordinates**:
   $$\text{Screen}_X = \frac{W}{2} + f_x \cdot \frac{x_3}{z_2}, \quad \text{Screen}_Y = \frac{H}{2} - f_y \cdot \frac{y_3}{z_2}$$
   Where $f_x = \frac{W/2}{\tan(\text{HFOV}/2)}$ and $f_y = \frac{H/2}{\tan(\text{VFOV}/2)}$.

*Result:* Elevation lines ($10^\circ, 20^\circ, \dots$) naturally curve into realistic downward arcs matching wide-angle optical lenses.

#### B. Visual Interface Elements
- **Top Header**: Left `Now` button (cyan), centered `Augmented Reality` (bold white), right `Done` button (cyan).
- **Top-Left Timestamp**: `M/D/YY, h:mm A` (e.g. `4/17/18, 6:51 PM`).
- **Horizon & Elevation Badges**:
  - Cardinal `W` in bold dark typography on a frosted circular disk.
  - Azimuth `267.5°` frosted circular bubble.
  - Elevation `10.0°` circular bubble on the $10^\circ$ elevation arc.
- **Sun Path Trajectory**:
  - Continuous glowing golden-yellow arc transitioning to sunset orange near the horizon.
  - Hourly circular nodes with bold yellow labels (`6:00 PM`, `7:00 PM`, `8:00 PM`).
  - Active Sun disc with soft corona halo placed at the current time node.
- **Photorealistic Reference Backdrop**:
  - When camera is off or in simulation mode, displays Madrid's Temple of Debod reflecting pool at sunset with atmospheric clouds, architectural gates, and water reflections.
- **Tactile Bottom Toolbar**:
  - Textured dark background matching PhotoPills diamond monogram pattern.
  - `Visual calibration` (compass reticle icon) opening azimuth/pitch fine-tuning sliders.
  - `Action` (share/tools icon) opening the AR options drawer.
  - 24-hour interactive time scrubber slider with play/pause celestial motion animation.

---

### 4.9 Procedural Sound Synthesizer (`src/services/sound.js`)
Zero external assets. Implemented with the browser's native `AudioContext`:
- `playBeep(freq, duration, type)`: Programmable wave synthesis (sine/triangle/square).
- `playTimerTick()`: Crisp $880\text{ Hz}$ sine pulse for countdown seconds.
- `playTimerDone()`: Double triumphant arpeggio chime ($523\text{ Hz} \to 659\text{ Hz} \to 784\text{ Hz}$).
- `playRadarPing()`: Resonant $1200\text{ Hz}$ exponential decay ping simulating aviation radar sweeps.
- `playTransitAlarm()`: High-visibility two-tone alert siren ($980\text{ Hz} \leftrightarrow 740\text{ Hz}$) for impending transits.

---

## 5. Mathematical Models & Equations Reference

### 5.1 Optics & Focus
- **Circle of Confusion ($c$)**:
  $$c \approx \frac{0.029\text{ mm}}{\text{crop\_factor}}$$
- **Hyperfocal Distance ($H$)**:
  $$H = \frac{f^2}{N \cdot c} + f$$
- **Near Sharp Limit ($D_n$)**:
  $$D_n = \frac{s \cdot (H - f)}{H + s - 2f}$$
- **Far Sharp Limit ($D_f$)**:
  $$D_f = \frac{s \cdot (H - f)}{H - s} \quad (\text{or } \infty \text{ if } s \ge H)$$

### 5.2 Exposure Reciprocity
$$T_{\text{target}} = T_{\text{base}} \times \left(\frac{N_{\text{target}}}{N_{\text{base}}}\right)^2 \times \left(\frac{\text{ISO}_{\text{base}}}{\text{ISO}_{\text{target}}}\right) \times 2^{\Delta \text{ND\_stops}}$$

### 5.3 Astrophotography Rules
- **500 Rule**:
  $$t_{\text{max}} = \frac{500}{f \cdot \text{crop}}$$
- **NPF Rule**:
  $$t_{\text{max}} = \frac{35 \cdot N + 30 \cdot p}{f \cdot \cos(\delta)}$$

### 5.4 Sun/Moon Desired Size
$$d_{\text{shooting}} = \frac{S_{\text{desired}}}{2 \cdot \tan(0.533^\circ / 2)} \approx 107.5 \times S_{\text{desired}}$$
$$\text{Sensor Image Diameter (mm)} = \frac{f\text{ (mm)}}{107.5}$$

### 5.5 Celestial Transits & 3D Slant Range
$$\text{Slant Range (km)} = \frac{\text{Altitude (m)}}{1000 \cdot \sin(\text{Elevation Angle})}$$
$$\text{Angular Wingspan ('')} = 206265 \cdot \frac{\text{Wingspan (m)}}{\text{Slant Range (m)}}$$
$$\text{Chord Duration (s)} = \frac{\text{Celestial Angular Diameter}}{\text{Angular Velocity}}$$

---

## 6. Codebase Directory Layout

```
d:\Web\
├── package.json                   # Dependencies (react, suncalc, lucide-react, vite)
├── vite.config.js                 # Vite bundler configuration & basicSsl
├── vercel.json                    # Framework specification ({"framework": "vite"})
├── tailwind.config.js             # Theme tokens (brand-cyan, brand-amber, obsidian)
├── src/
│   ├── main.jsx                   # React DOM root entrypoint
│   ├── index.css                  # Global Tailwind CSS, glass-card utilities, slider styles
│   ├── App.jsx                    # Top-level state, ephemeris calculations, navigation router
│   ├── components/
│   │   ├── Header.jsx             # Top tactical app header with GPS & status badges
│   │   ├── Sidebar.jsx            # Desktop persistent tactical sidebar navigation
│   │   ├── BottomNav.jsx          # Mobile bottom thumb navigation bar
│   │   ├── RotaryDial.jsx         # Tactile rotary aperture knob component
│   │   ├── CircularTimer.jsx      # SVG animated circular countdown timer
│   │   ├── RealisticMoon.jsx      # SVG/CSS realistic lunar phase disc with craters
│   │   └── ArViewfinderModal.jsx  # Fullscreen 3D perspective AR camera HUD
│   ├── services/
│   │   ├── ephemeris.js           # Ephemeris engine, SunCalc wrappers, moon calendars
│   │   ├── opticalCalc.js         # DoF, Hyperfocal, CoC, and 1/3-stop aperture series
│   │   ├── exposureCalc.js        # ND reciprocity and test shot exposure formulas
│   │   ├── fovCalc.js             # Sensor crop factors, FoV angles, and triangulation
│   │   ├── astroCalc.js           # 500 Rule, NPF Rule, Star Trails, and Timelapse
│   │   ├── transitChaser.js       # 3D airspace vector engine, fleets, and 5 distance bands
│   │   └── sound.js               # Procedural Web Audio API sound synthesizer
│   └── views/
│       ├── DashboardView.jsx      # Field Hub overview and realistic moon preview
│       ├── CelestialSuiteView.jsx # Planner, Transit Chaser, Sun & Eclipses container
│       ├── PlannerView.jsx        # Map-based alignment & Sun/Moon desired size
│       ├── MoonTransitView.jsx    # Transit Chaser suite (aliased as TransitChaserView)
│       ├── SunView.jsx            # Sun, Twilights, Golden/Blue hour, shadow lengths
│       ├── DofSuiteView.jsx       # DoF Calculator & Hyperfocal Table container
│       ├── DofView.jsx            # Interactive optical DoF calculator
│       ├── DofTableView.jsx       # Hyperfocal two-dimensional matrix
│       ├── FovSuiteView.jsx       # FoV, 2-Camera match & Subject distance container
│       ├── FovView.jsx            # Sensor crop comparison and field of view
│       ├── FocalLengthMatchView.jsx# 2-camera equivalent focal length & aperture matcher
│       ├── SubjectDistanceView.jsx# Subject distance triangulation & "Apply to DoF"
│       ├── ExposureSuiteView.jsx  # ND Stacker, Test Reciprocity, Bulb Timer container
│       ├── NdTimerView.jsx        # ND filter stacker (1 to 20 stops)
│       ├── ExposureView.jsx       # Test shot equivalent exposure reciprocity
│       ├── TimerView.jsx          # Bulb exposure countdown timer interface
│       ├── AstroSuiteView.jsx     # Spot Stars, Star Trails, Timelapse, Meteors container
│       ├── SpotStarsView.jsx      # 500 Rule and NPF Rule calculator
│       ├── StarTrailsView.jsx     # Earth rotation arc & stacking simulator
│       ├── TimelapseView.jsx      # Frame counts, intervalometer, and memory storage
│       └── MeteorShowersView.jsx  # Annual meteor showers catalog and moon interference
└── agents/                        # Historical agent command logs and references
    ├── commands.md                # Chronological user request history
    ├── project_overview.md        # High-level architecture overview
    ├── design_system.md           # Visual design tokens and UI constraints
    ├── implementation_steps.md    # Step-by-step milestone log
    └── mathematical_models.md     # Equations and scientific formulas
```

---

## 7. Instructions for Ingesting AI Agents

When importing this specification into another AI agent (such as ChatGPT, Claude, Cursor, Copilot, or Gemini):

1. **Maintain Architectural Integrity**: All optical and exposure values step in standard photographic **1/3-stop series** ($f/1.0$ through $f/45$). Do not alter these increments.
2. **Preserve Dark Obsidian Palette**: Backgrounds must strictly use obsidian `#080d16` with glass borders `rgba(255,255,255,0.1)`. Interactive elements must use cyan `#12d6c7` and amber `#fca311`.
3. **Keep Math Exact**: When extending or verifying calculations, use the formulas in Section 5. Never approximate the NPF rule without factoring pixel pitch $p$ and aperture $N$.
4. **Transit Chaser Alignment**: When extending transit tracking, maintain the 3D airspace vector geometry (altitude, ground speed, slant range, and celestial angular diameter) established in `transitChaser.js`.
5. **AR Camera Viewfinder**: Retain the 3D spherical pinhole camera projection matrix in `ArViewfinderModal.jsx` so that elevation lines remain naturally curved arcs.
6. **Dual-Repo Synchronization**: Any code edits in `d:\Web` should be mirrored to `D:\Github Repositories\Photography-Tool` and pushed to the `Deploy` branch for automatic Vercel production deployment.

# Implementation Steps & Execution Plan

## Status Tracker

- [x] **Step 1: Environment & Requirements Analysis**
  - Inspected `request.md`, `TEMPLATE_GUIDE.md`, and `photopills-user-guide.pdf`.
  - Identified all required tools, separate menus, and mathematical formulations.
  - Established `AGENTS.md` and the `agents/` knowledge repository.

- [x] **Step 2: Project Initialization (React + Tailwind + Vite)**
  - Initialized Vite React application with Tailwind CSS and Lucide icons.
  - Installed dependencies: `lucide-react`, `suncalc`, `canvas-confetti`.
  - Configured font families: `Plus Jakarta Sans` / `Manrope` / `JetBrains Mono`.
  - Configured custom brand tokens (`#12d6c7` cyan, `#fca311` amber, `#080d16` obsidian night).

- [x] **Step 3: Core Astronomy & Optical Computation Engine**
  - Built `src/services/ephemeris.js`: SunCalc integration for solar/lunar position, phases, golden hour, twilights, shadows, supermoons, and Milky Way visibility.
  - Built `src/services/opticalCalc.js`: Sensor presets (Full Frame, APS-C Sony/Canon, MFT, Medium Format, 1-inch), circle of confusion, hyperfocal, near/far sharpness limits, and full matrix generator.
  - Built `src/services/exposureCalc.js`: Base shutter speeds, ND presets (ND8, ND16, ND32, ND64, ND256, ND500, ND1000, ND32K, ND1M), filter stacking, reciprocity law, and bulb duration formatting.
  - Built `src/services/astroCalc.js`: Pixel pitch sensor database, classic 500 Rule vs. accurate NPF Rule with declination, hyperlapse/timelapse intervalometer & frame planner with celestial rotation ($15.04^\circ/\text{hr}$), and star trails arc stacker.
  - Built `src/services/transitChaser.js`: Complete TransitChaser engine predicting ISS, Tiangong, commercial aircraft, and rocket launch transits across the Moon with centerline distance, transit chord duration, and ground corridor width.
  - Built `src/services/fovCalc.js`: Sensor FoV angles, 35mm equivalents, multi-sensor comparison, and focal length matching.
  - Built `src/services/sound.js`: Web Audio API sound synthesizer for tick, warning countdown, and completion chimes without external audio assets.

- [x] **Step 4: Design System & Shared Components**
  - Built `src/components/Header.jsx`: Sticky app bar with GPS coordinate detector and quick AR launcher.
  - Built `src/components/BottomNav.jsx`: Thumb-friendly mobile tab navigation.
  - Built `src/components/Sidebar.jsx`: Full categorized menu hierarchy for tablet and desktop displays, plus mobile drawer.
  - Built `src/components/RealisticMoon.jsx`: 3D-styled lunar disc with procedural craters, dynamic phase terminator shadow, and orbital satellite node.
  - Built `src/components/RotaryDial.jsx`: Tactile knob with radial lighting and cyan indicator notch.
  - Built `src/components/CircularTimer.jsx`: SVG circular countdown ring with Web Audio beeps and confetti celebrations.
  - Built `src/components/ArViewfinderModal.jsx`: Fullscreen AR HUD with WebRTC environment camera, crosshairs, horizon level, celestial azimuth overlay, and 4K grid.
  - Built `src/components/TaglineReveal.jsx`: Word-by-word scroll reveal following `landing-page-design` Rule B11.

- [x] **Step 5: Separate Dedicated Tool Views (Menus)**
  - `DashboardView`: Field command hub summarizing Moon, upcoming transit, and fast tool cards.
  - `DofView`: Depth of Field & Hyperfocal calculator with interactive focus zone scale.
  - `DofTableView`: Hyperfocal and DoF matrix table across aperture stops and focal lengths.
  - `NdTimerView`: Multi-filter stacker and circular bulb countdown timer.
  - `SpotStarsView`: 500 Rule vs. NPF Rule star trailing calculator with sensor pixel pitch database.
  - `TimelapseView`: Hyperlapse photo shoot calculator, intervals, FPS, celestial rotation angle, and memory card sizing.
  - `StarTrailsView`: Star trails calculator for desired celestial rotation arcs.
  - `FovView`: Field of View & Crop Factor converter with nested visual frame preview and focal length match.
  - `MoonTransitView`: Moon alignment & TransitChaser ISS/Aircraft/Rocket calculator, ground track corridor, centerline distance, and transit chord duration.
  - `SunView`: Golden Hour, Blue Hour, Twilights, Solar Noon, and real-time shadow length calculator.
  - `MeteorShowersView`: Annual meteor shower calendar, peak ZHR, radiant coordinates, and moon interference.
  - `SubjectDistanceView`: Distance triangulation based on subject framing and focal length.

- [x] **Step 6: Build Verification & Quality Assurance**
  - Ran Vite production build: succeeded cleanly with zero warnings or errors.
  - Verified responsive layouts on mobile, tablet, and desktop viewports.
  - Verified adherence to `landing-page-design` rules (spacing tokens, typography, dark mode background tokens, Phosphor/Solar style Lucide icons, no orphaned words).

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

- [x] **Step 7: PhotoPills Comprehensive Suite Expansion (`photopills_photography_tools.md`)**
  - [x] **Planner View (`src/views/PlannerView.jsx`)**: Comprehensive PhotoPills Planner with interactive observer pin, subject black pin, azimuth/elevation alignment vector, date/time scrubber, Sun/Moon desired size calculator ($d = \frac{S}{0.00931}$, size on sensor), eclipse indicators, and FoV/DoF map overlay.
  - [x] **Focal Length Match View (`src/views/FocalLengthMatchView.jsx`)**: Dedicated Pill for Camera 1 vs Camera 2 equivalence (matching focal length, aperture for identical DoF, and ISO).
  - [x] **Equivalent Exposure Calculator (`src/views/ExposureView.jsx`)**: Test Shot high-ISO/wide-open to clean Final Shot long-exposure reciprocity converter with ND filter integration.
  - [x] **Dedicated Field Timer (`src/views/TimerView.jsx`)**: Multi-mode countdown timer for long exposures, timelapse intervalometer with audio beeps, and star trails sessions.
  - [x] **Dual Matrix in `DofTableView.jsx`**: Explicit tabs for Depth of Field Matrix AND Hyperfocal Table across apertures $f/1.0 - f/32$ and focal lengths $12\text{mm} - 600\text{mm}$.
  - [x] **Moon Calendar & Supermoons in `MoonTransitView.jsx`**: Complete 12-month lunar phase calendar and upcoming SuperMoon dates.
  - [x] **Night AR in `ArViewfinderModal.jsx`**: Togglable Night AR mode featuring the Milky Way arch, Galactic Center reticle, Polaris/Celestial Poles, and Star Trails concentric circles.
  - [x] **Navigation & View Routing**: Wire all new tools into `App.jsx`, `Sidebar.jsx`, and `BottomNav.jsx`.

- [x] **Step 8: 1/3-Stop Aperture Increments Standardization**
  - [x] Configured `APERTURE_STOPS` in `src/services/opticalCalc.js` to the complete photographic 1/3-stop series: $f/1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45$.
  - [x] Updated `DofView.jsx` Rotary Dial to step in 1/3-stop increments with quick jump buttons to full stops.
  - [x] Updated `DofTableView.jsx` to offer a 1/3-Stop Steps table matrix mode.
  - [x] Updated `ExposureView.jsx` test and final target aperture dropdowns to list all 1/3-stop values.
  - [x] Updated `FocalLengthMatchView.jsx` to list 1/3 stops and calculate the closest physical 1/3-stop dial click on target camera lenses.
  - [x] Updated `SpotStarsView.jsx` to provide full 1/3-stop aperture selection for the NPF star trailing calculation.
  - [x] Synchronized `initial/index.html` standalone template to 1/3-stop increments.
  - [x] Verified production build with zero errors.

- [x] **Step 9: Consolidation of Similar Functions into Unified Suites**
  - [x] Created `CelestialSuiteView.jsx`: Consolidates Map Planner, Moon & TransitChaser, Sun & Twilights, and Solar/Lunar Eclipses with top pill tabs.
  - [x] Created `DofSuiteView.jsx`: Consolidates DoF Calculator and Hyperfocal/DoF Matrix Table with top pill tabs.
  - [x] Created `FovSuiteView.jsx`: Consolidates Field of View & Crop, Dual-Camera Focal Length Match, and Subject Distance with top pill tabs.
  - [x] Created `ExposureSuiteView.jsx`: Consolidates ND Filter Stacker, Equivalent Exposure Reciprocity, and Multi-Mode Field Timer with top pill tabs.
  - [x] Created `AstroSuiteView.jsx`: Consolidates Spot Stars (500/NPF), Star Trails Arc Stacker, Timelapse/Hyperlapse, and Meteor Showers with top pill tabs.
  - [x] Updated `Sidebar.jsx`: Streamlined sidebar hierarchy into 5 Core Photography Suites, Field Hub (Dashboard), and Night AR Viewfinder HUD.
  - [x] Updated `BottomNav.jsx`: Streamlined mobile bottom bar to Hub, Planner, DoF, FoV, Exposure, Astro, and Menu drawer toggle.
  - [x] Updated `App.jsx`: Centralized suite routing with `suiteSubTab` state and backward-compatible route mapping.
  - [x] Updated `DashboardView.jsx`: Routed fast tool cards directly to target suites and corresponding sub-tabs.
  - [x] Verified full production build (`npm run build`) with zero errors.

- [x] **Step 10: Mobile Camera & HTTPS Secure Context Resolution**
  - [x] Identified root cause: iOS Safari and mobile Chrome restrict `navigator.mediaDevices` to Secure Contexts (`https://`). Plain `http://<ip>:3000` hides the camera API.
  - [x] Configured `@vitejs/plugin-basic-ssl` in `vite.config.js` to serve secure HTTPS on mobile local network.
  - [x] Updated `ArViewfinderModal.jsx` with fallbacks, insecure context prompt with 1-click HTTPS redirect, iOS `DeviceOrientationEvent.requestPermission()`, `playsInline` video handling, and user gesture triggers.
  - [x] Synchronized changes to `D:\Github Repositories\Photography-Tool`.

- [x] **Step 11: Initial Figma Make Import Setup**
  - [x] Audited active environment-variable usage; no application secrets or required integration variables were found.
  - [x] Added executable `.figma/make/install` and `.figma/make/dev` scripts using the repository's npm/Vite lifecycle.
  - [x] Preserved local HTTPS while disabling the self-signed SSL plugin only in the Figma-supervised environment so HTTP health checks can succeed.
  - [x] Added static `.figma/make/deploy`, `.figma/make/deploy-preview`, and `.figma/make/deploy.json` configuration targeting Vite's `dist` output.
  - [x] Verified bootstrap, production deploy, and deploy-preview workflows successfully.

- [x] **Step 12: Header Place Name**
  - [x] Added reverse geocoding to convert detected GPS coordinates into a city/region label.
  - [x] Updated only the selected header button UI to display the place name across desktop and mobile layouts.
  - [x] Added loading and graceful place-lookup fallback labels without exposing coordinates.




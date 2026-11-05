# Master User Commands Log

## Initial Request (Source: `c:\Users\Brian\Downloads\request.md`)

1. **Web App Goal**: Build a webapp containing different photography tools to use when taking photography.
2. **Required Core Features**:
   - **Depth of Field (DoF) & Hyperfocal Calculator**: Input sensor size, focal length, aperture, and subject distance to visualize near/far acceptable sharpness limits and the exact hyperfocal distance.
   - **Exposure & ND Filter Timer**: Calculate equivalent exposures using the reciprocity law, plus a built-in countdown timer when stacking 3-stop, 6-stop, or 10-stop Neutral Density filters.
   - **Astrophotography Rule (500 / NPF Rule)**: Compute maximum shutter speed before star trailing occurs based on sensor pixel pitch, focal length, and aperture.
   - **Hyperlapse Photo Shoot Calculator**: Calculates the number of photos needed and intervals in between each photo based on the fps, length of the photo, and angle of the star rotation needed.
   - **Field of View (FoV) & Crop Factor Converter**: Compare how a specific focal length behaves across Full Frame, APS-C, Micro Four Thirds, and Medium Format sensors.
   - **Moon Alignment Calculator**: Calculate moon location from a specified location and overlay it in AR view. Also add a feature where it calculates when a plane or a rocket launch will pass by the moon.
   - **PhotoPills User Guide Features**: Include all features described in `photopills-user-guide.pdf` located in the `initial` folder (Sun, Moon, Planner, Twilights/Golden Hour, Eclipses, Meteor Showers, Star Trails, Spot Stars, Time Lapse, Hyperfocal Table, DoF Table, Subject Distance, Focal Length Match, AR Viewfinder).
3. **Menu Architecture**: Each of the features above **NEEDS to be in its separate menu**.
4. **Moon Alignment & TransitChaser Integration**:
   - Include features from [TransitChaser](https://transitchaser.com/) (ISS, satellites, commercial aircraft, and rocket launches passing across the Sun/Moon, ground tracks, centerline distance, transit chord duration, pass predictions).
   - Do NOT assume that TransitChaser features are the only features needed for the Moon alignment calculator.
   - **DO NOT copy the design of TransitChaser**.
5. **Mobile & Tablet Friendly Design**:
   - Must be fully mobile and tablet friendly, inspired by PhotoPills iOS app ([App Store Link](https://apps.apple.com/us/app/photopills/id596026805)).
6. **Design Guideline Reference**:
   - Refer to `initial/TEMPLATE_GUIDE.md` for styling, tokens, and components.
7. **Design Skill Requirement**:
   - Use the **`landing-page-design`** skill when designing.
8. **Agents Documentation Requirement**:
   - In main folder, create an `agents` folder. While making the website, store all of the commands given, important information, and important steps in each of the respective md files.
9. **AGENTS.md Requirement**:
   - Create `AGENTS.md` in main folder, instructing agents to always refer to the `agents` folder when executing tasks.
10. **Tech Stack Requirement**:
    - Use React along with Tailwind CSS. Incorporate relevant APIs (astronomy, ephemeris, geolocation, device orientation/camera for AR).

## Command Turn 2: PhotoPills Photography Tools Specification (`photopills_photography_tools.md`)
- **Source**: `agents/photopills_photography_tools.md`
- **Directive**: Add all tools listed in `photopills_photography_tools.md` as distinct separate menus to the website.
- **Full Inventory of Required Tools**:
  1. **Planner**: Advanced planning tool for Sun, Moon, Milky Way, Star Trails, Meteor Showers, and Eclipses. Map tools: FoV tool, DoF tool, and Sun/Moon tool (calculate shooting distance needed to get a desired Sun or Moon size relative to subject).
  2. **Sun**: Daily solar info (Sunrise, Sunset, golden hour, blue hour, twilight times, shadow length, and AR view).
  3. **Moon**: Moonrise, Moonset, Moon phase, SuperMoon dates, Moon calendar, and AR view.
  4. **Exposure**: Equivalent exposure calculator for long exposures, shooting in low light, at night, or when using ND filters (Test Shot -> Target Shot reciprocity).
  5. **Depth of field (DoF)**: Hyperfocal distance, total depth of field, and near/far limits.
  6. **Field of View (FoV)**: Horizontal, vertical, and diagonal angle of view and field of view dimensions.
  7. **DoF Table & Hyperfocal Table**: Depth of field and hyperfocal distance formatted into dual easy-to-read tables.
  8. **Night AR**: Augmented reality tool to visualize the night sky (Milky Way, Galactic Center, Moon, Polaris, celestial poles, Star Trails patterns).
  9. **Meteor Showers**: Calendar, peak dates/times, visibility quality, and AR radiant positioning.
  10. **Star Trails**: Star trails simulations, trail length in degrees/pixels, exposure time needed.
  11. **Spot Stars**: Maximum exposure time without star trailing (500 Rule & NPF Rule).
  12. **Time lapse**: Parameters like clip length, shooting intervals, total photos needed, and memory usage (RAW/JPEG storage).
  13. **Timer**: Dedicated countdown timer for long exposures, time lapses, and Star Trails with audio alerts.
  14. **Subject distance**: Minimum shooting distance needed to fit a subject into frame.
  15. **Focal length match**: Focal length and aperture needed on a second camera (different sensor size) to capture the same FoV and DoF.

## Command Turn 3: 1/3-Stop Increments for All F-Stop Options
- **Directive**: For ANY f-stop (aperture) option across all calculators, matrices, and dropdowns, format and step in **1/3 stop increments**.
- **Standard Photographic 1/3-Stop Aperture Scale**:
  - $f/1.0, f/1.1, f/1.2, f/1.4, f/1.6, f/1.8, f/2.0, f/2.2, f/2.5, f/2.8, f/3.2, f/3.5, f/4.0, f/4.5, f/5.0, f/5.6, f/6.3, f/7.1, f/8.0, f/9.0, f/10, f/11, f/13, f/14, f/16, f/18, f/20, f/22, f/25, f/29, f/32$
- **Affected Tools**:
  - Depth of Field (DoF) Calculator (`DofView.jsx` and rotary dial)
  - DoF & Hyperfocal Matrices (`DofTableView.jsx` and `opticalCalc.js`)
  - Equivalent Exposure Calculator (`ExposureView.jsx` test & target aperture selectors)
  - Focal Length Match (`FocalLengthMatchView.jsx` aperture selector)
  - Spot Stars Astrophotography (`SpotStarsView.jsx` aperture selector)

## Command Turn 4: Consolidate Similar Functions into Unified Cohesive Suites
- **Directive**: "combine similure functions to one menu"
- **Architecture Solution**:
  Group the 15+ individual tools into **5 Core Photography Suites** with clean, responsive sub-tabs:
  1. **Planner & Celestial Ephemeris (`celestial`)**:
     - Sub-tab 1: Pin & Alignment Map (Red/Black pin, time scrubber, Sun/Moon desired size tool)
     - Sub-tab 2: Moon & TransitChaser (ISS/satellite/aircraft/rocket transits, SuperMoons, Moon calendar)
     - Sub-tab 3: Sun & Golden Hour (Sunrise, Sunset, golden/blue hours, shadow calculator)
     - Sub-tab 4: Eclipses Calendar (Solar & lunar eclipse dates, magnitude, duration)
  2. **Depth of Field & Focus (`dof`)**:
     - Sub-tab 1: Interactive DoF Calculator (1/3-stop rotary dial, focus depth spectrum)
     - Sub-tab 2: DoF & Hyperfocal Reference Matrix (1/3-stop vs. full-stop matrix table)
  3. **Field of View & Framing (`fov`)**:
     - Sub-tab 1: FoV & Sensor Crop (Angles of view, multi-sensor comparison, framing box)
     - Sub-tab 2: Focal Length & Aperture Match (2-camera equivalence for same FoV & DoF)
     - Sub-tab 3: Subject Distance (Triangulating shooting distance from subject dimensions)
  4. **Exposure & Timers (`exposure`)**:
     - Sub-tab 1: ND Filter Stacker & Bulb Timer (Reciprocity law, 3/6/10/15 stop stacker)
     - Sub-tab 2: Equivalent Exposure Calculator (Test shot high-ISO to clean final shot converter)
     - Sub-tab 3: Multi-Mode Field Timer (Bulb exposure, timelapse intervalometer, star trails stack)
  5. **Astrophotography & Night Motion (`astrophotography`)**:
     - Sub-tab 1: Spot Stars (500 Rule vs. NPF Rule pinpoint shutter limit)
     - Sub-tab 2: Star Trails (Earth rotation arc duration & sub-exposure stacker)
     - Sub-tab 3: Hyperlapse & Timelapse (Frame counts, intervalometer, memory card sizing)
     - Sub-tab 4: Meteor Showers (Annual calendar, peak ZHR, radiant coordinates, moon interference)
  6. **Night AR & Viewfinder HUD (`ar-viewfinder`)**: Fullscreen AR camera HUD with celestial overlays.
  7. **Field Hub / Dashboard (`dashboard`)**: Unified quick-access dashboard.

## Command Turn 5: Fix "camera API not available in this enviornment" on Mobile
- **Problem**: When accessing the web app from a mobile phone (iOS Safari / Android Chrome) over the local network via `http://<ip>:3000`, mobile browsers enforce the W3C WebRTC Secure Context policy and completely disable `navigator.mediaDevices` on unencrypted HTTP.
- **Solution Implemented**:
  1. Installed `@vitejs/plugin-basic-ssl` and configured `vite.config.js` with HTTPS enabled.
  2. Vite dev server now broadcasts secure HTTPS endpoints (`https://10.100.1.180:3000` / `https://localhost:3000`).
  3. Updated `src/components/ArViewfinderModal.jsx`:
     - Added cross-browser `getUserMedia` retriever with fallback from `environment` back camera to general video.
     - Added automatic detection for insecure context with a one-click button: "Switch to HTTPS".
     - Added iOS 13+ `DeviceOrientationEvent.requestPermission` handler on user touch to unlock accelerometer and gyroscope on iPhone.
     - Added `playsInline`, `autoPlay`, and `muted` attributes to the `<video>` element with explicit `play()` error handling for iOS Safari WebKit.
     - Added "Tap to Enable Camera Stream" and "Retry Camera" actions so user gestures satisfy mobile browser permission policies.





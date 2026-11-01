# Project Overview: AstroPro Photography Field Suite

## 1. Executive Summary
AstroPro is an advanced, professional-grade photography field web application and companion suite modeled after the gold standards of outdoor and night photography tools (PhotoPills, TransitChaser, Planit Pro). Designed for responsive execution across smartphones, tablets, and desktop workstations, it provides specialized photography calculators and planning engines with a clean, dark-mode tactile interface tailored for night vision.

## 2. Separate Menu Hierarchy
Every tool is hosted in its own distinct, dedicated view/menu with persistent quick navigation, mobile thumb bar, and tablet sidebar:

1. **Planner & Ephemeris Hub (`/planner`)**: Multi-layer celestial map with Sun, Moon, Milky Way Galactic Center, and shadow vectors, geodetic info, and time scrubbing.
2. **Depth of Field (DoF) & Hyperfocal (`/dof`)**: Interactive optical visualization of near limit, far limit, hyperfocal distance, depth of field distribution, and sensor Circle of Confusion.
3. **DoF & Hyperfocal Tables (`/dof-table`)**: Quick-reference tabular matrix of hyperfocal distances and sharp ranges across aperture stops ($f/1.4$ to $f/22$) and focal lengths.
4. **Exposure & ND Filter Timer (`/nd-timer`)**: Reciprocity law calculator with stackable ND filters (1-stop to 20-stop, including ND8, ND64, ND1000, and combinations), live circular countdown timer, sound alerts, and test exposure conversion.
5. **Astrophotography / Spot Stars (`/spot-stars`)**: Shutter speed limits to eliminate star trailing using the classic 500 Rule and high-resolution NPF Rule (factoring in sensor pixel pitch, focal length, aperture, and star declination).
6. **Time Lapse & Hyperlapse Calculator (`/timelapse`)**: Complete shooting session planning: clip length, fps, frame count, memory card requirements, battery usage, intervalometer settings, and star rotation angle calculations ($15^\circ/\text{hr}$).
7. **Star Trails Calculator (`/star-trails`)**: Total exposure time for desired celestial arc degrees, individual sub-exposure stacking simulator, gap management, and battery drain forecast.
8. **Field of View (FoV) & Crop Factor Converter (`/fov`)**: Multi-sensor comparisons (Medium Format $0.79\times$, Full Frame $1.0\times$, APS-C Canon $1.6\times$, APS-C Sony/Nikon $1.5\times$, Micro 4/3 $2.0\times$, 1-inch $2.7\times$), nested visual frame comparisons, and focal length matching.
9. **Moon Alignment & TransitChaser (`/moon-transit`)**: High-precision lunar ephemeris (altitude, azimuth, phase percentage, illumination angle, moonrise/set, distance/apogee/perigee, supermoons) PLUS satellite (ISS, Tiangong), commercial aircraft, and rocket launch transit predictor across the lunar and solar disk, with ground tracks and transit chord geometry.
10. **Sun & Twilight Calculator (`/sun`)**: Golden hour, blue hour, civil/nautical/astronomical twilights, solar noon, azimuth/elevation, and real-time shadow length calculator.
11. **Meteor Showers Calendar (`/meteor-showers`)**: Annual major showers (Perseids, Geminids, Quadrantids, Lyrids, Orionids), peak dates, Zenithal Hourly Rate (ZHR), radiant celestial position, and lunar interference.
12. **Subject Distance & Minimum Focus (`/subject-distance`)**: Triangulate distance to subject based on optical framing, object size, and focal length.
13. **AR Viewfinder HUD (`/ar-viewfinder`)**: WebRTC live environment camera overlay with optical crosshairs, horizon pitch/roll level, compass azimuth, lunar/solar position vectors, and transit lock boxes.

## 3. Technology Stack
- **Framework**: React 18+ with Vite (blazing fast HMR, production optimized).
- **Styling**: Tailwind CSS configured with dark theme tokens, glassmorphism surfaces, and strict constraints from `landing-page-design`.
- **Icons**: Lucide React (clean geometric Phosphor/Solar style vector icons).
- **Celestial & Astronomy Engine**: SunCalc + custom Keplerian/geodetic solvers for high-precision lunar/solar ephemeris and transit chord calculations.
- **Hardware Integration**: HTML5 Geolocation API, DeviceOrientation / Compass API, WebRTC `navigator.mediaDevices.getUserMedia` for environmental camera AR, and Web Audio API for timer beeps.

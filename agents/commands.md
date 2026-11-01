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

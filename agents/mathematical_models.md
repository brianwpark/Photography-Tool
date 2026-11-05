# Mathematical Models & Optical/Astronomical Specifications

## 1. Depth of Field (DoF) & Hyperfocal Distance

### Circle of Confusion ($c$)
Standardized based on the sensor diagonal ($d$) using the Zeiss formula:
$$c = \frac{d}{1730} \approx \frac{0.029\text{ mm}}{\text{crop\_factor}}$$
- Full Frame ($36 \times 24\text{ mm}$): $c = 0.029\text{ mm}$
- APS-C Nikon/Sony ($1.5\times$): $c = 0.019\text{ mm}$
- APS-C Canon ($1.6\times$): $c = 0.018\text{ mm}$
- Micro Four Thirds ($2.0\times$): $c = 0.015\text{ mm}$
- 1-inch ($2.7\times$): $c = 0.011\text{ mm}$
- Medium Format 44x33 ($0.79\times$): $c = 0.037\text{ mm}$

### Hyperfocal Distance ($H$)
$$H = \frac{f^2}{N \cdot c} + f$$
Where $f$ is focal length (mm) and $N$ is lens $f$-number.

### Near & Far Sharp Limits ($D_n, D_f$)
For subject distance $s$:
$$D_n = \frac{s \cdot (H - f)}{H + s - 2f} \approx \frac{s \cdot H}{H + s}$$
$$D_f = \begin{cases} \frac{s \cdot (H - f)}{H - s} \approx \frac{s \cdot H}{H - s} & \text{if } H > s \\ \infty & \text{if } H \le s \end{cases}$$
$$\text{Total DoF} = D_f - D_n$$

---

## 2. Exposure & Neutral Density (ND) Filter Reciprocity

$$T_{\text{ND}} = T_{\text{base}} \times 2^{\text{stops}}$$

- ND8 = 3 stops ($2^3 = 8\times$)
- ND64 = 6 stops ($2^6 = 64\times$)
- ND1000 = 10 stops ($2^{10} = 1024\times$)
- Stacked ND64 + ND1000 = 16 stops ($2^{16} = 65,536\times$)
- Stacked 10-stop + 10-stop = 20 stops ($2^{20} = 1,048,576\times$)

---

## 3. Astrophotography Shutter Speed Limits

### Classic 500 Rule
$$t_{\text{max}} = \frac{500}{f \times \text{crop\_factor}}$$

### Accurate NPF Rule
$$t_{\text{max}} = \frac{35 \times N + 30 \times p}{f \times \cos(\delta)}$$
Where:
- $N$ = Aperture $f$-number
- $p$ = Sensor pixel pitch ($\mu\text{m}$)
- $f$ = Focal length (mm)
- $\delta$ = Declination of targeted stars (default $\delta = 0^\circ$ at celestial equator for worst-case strictness)

$$\text{Pixel Pitch } p = \frac{\text{Sensor Width (mm)} \times 1000}{\text{Horizontal Resolution (px)}}$$

---

## 4. Hyperlapse & Star Trails

### Hyperlapse / Timelapse
- $\text{Total Frames} = \text{Target Video Duration (s)} \times \text{Target FPS}$
- $\text{Shooting Time} = \text{Total Frames} \times \text{Interval (s)}$
- Memory size = $\text{Total Frames} \times \text{RAW File Size (MB)}$

### Celestial Rotation & Star Trails
- Earth rotates at $\omega \approx 15.04^\circ$ per hour ($0.25^\circ / \text{min}$).
- Celestial Arc ($\theta$):
$$\theta = \text{Total Duration (hours)} \times 15^\circ$$
$$\text{Required Time for Target Arc } \theta = \frac{\theta}{15} \text{ hours}$$

---

## 5. Lunar Ephemeris & Transit Geometry (TransitChaser Specifications)

### Lunar Disc Diameter
Angular diameter of the Moon as seen from Earth varies between $29.3'$ ($0.488^\circ$) at apogee to $34.1'$ ($0.568^\circ$) at perigee.

### Transit Chord & Duration
When a satellite (ISS at $\sim 400\text{ km}$ altitude, speed $\sim 7.66\text{ km/s}$, angular speed $\sim 1.1^\circ/\text{s}$) or aircraft/rocket crosses the lunar disk:
$$\text{Max Transit Duration (Centerline)} = \frac{\text{Angular Diameter of Moon}}{\text{Apparent Angular Velocity of Transiting Object}}$$
For the ISS, centerline transit lasts approximately $0.5$ to $1.8$ seconds.

### Ground Track & Centerline
- Centerline: The geographic path on Earth where the line of sight from the observer through the satellite points directly to the center of the Moon.
- Visibility corridor width:
$$W = 2 \times D_{\text{sat}} \times \tan\left(\frac{\theta_{\text{moon}}}{2}\right)$$
Observers situated within distance $d < W/2$ from the centerline witness a solar or lunar transit.

---

## 6. PhotoPills Planner: Sun/Moon Desired Size Tool
Used to calculate the exact shooting distance required to make the Sun or Moon appear at a desired physical diameter relative to a foreground monument, building, or subject:
$$d = \frac{S}{2 \cdot \tan\left(\frac{\theta_{\text{body}}}{2}\right)} \approx \frac{S}{\theta_{\text{rad}}} \approx 107.5 \times S$$
Where:
- $S$ = Desired apparent diameter of Sun or Moon at the subject distance (meters)
- $\theta_{\text{body}}$ = Angular diameter of the Sun or Moon ($\approx 0.533^\circ \approx 0.00931\text{ radians}$)
- $d$ = Required shooting distance from camera to subject (meters)

### Sun/Moon Size on Sensor:
$$\text{Diameter on Sensor (mm)} = \frac{f\text{ (mm)}}{107.5}$$
*Example:* A $500\text{mm}$ telephoto lens yields a Moon disk of $\frac{500}{107.5} \approx 4.65\text{ mm}$ on the sensor.

---

## 7. Focal Length Match Equivalence
Calculates equivalent focal length and aperture on a secondary camera with different sensor crop factors ($C_1, C_2$) to achieve identical Field of View and Depth of Field:
$$f_2 = f_1 \times \frac{C_1}{C_2}$$
$$N_2 = N_1 \times \frac{C_1}{C_2}$$
$$\text{ISO}_2 = \text{ISO}_1 \times \left(\frac{C_1}{C_2}\right)^2$$

---

## 8. Equivalent Exposure (Test Shot Reciprocity)
Converts a high-ISO/wide-open test shot into a final clean long-exposure shot:
$$t_2 = t_1 \times \left(\frac{N_2}{N_1}\right)^2 \times \left(\frac{\text{ISO}_1}{\text{ISO}_2}\right) \times 2^{\Delta \text{ND}}$$
Where $\Delta \text{ND} = \text{ND}_{\text{final\_stops}} - \text{ND}_{\text{test\_stops}}$.

---

## 9. Photographic 1/3-Stop Aperture Scale (ISO 516 / Standard Progression)
The aperture $f$-number $N$ follows the power series $N = (\sqrt{2})^{n/3} = 2^{n/6}$:
- **$f/1.0$ base**: $1.0, 1.1, 1.2$
- **$f/1.4$ base**: $1.4, 1.6, 1.8$
- **$f/2.0$ base**: $2.0, 2.2, 2.5$
- **$f/2.8$ base**: $2.8, 3.2, 3.5$
- **$f/4.0$ base**: $4.0, 4.5, 5.0$
- **$f/5.6$ base**: $5.6, 6.3, 7.1$
- **$f/8.0$ base**: $8.0, 9.0, 10$
- **$f/11$ base**: $11, 13, 14$
- **$f/16$ base**: $16, 18, 20$
- **$f/22$ base**: $22, 25, 29$
- **$f/32$ base**: $32, 36, 40, 45$
All optical calculators and dropdown selectors step through these exact 1/3-stop values.



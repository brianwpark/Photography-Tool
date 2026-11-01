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

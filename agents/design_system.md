# Design System & Visual Guidelines

This specification unifies the design requirements from **`TEMPLATE_GUIDE.md`** and the **`landing-page-design`** skill.

## 1. Core Principles
- **Aesthetic**: Sleek, tactical, dark-mode field tool preserving night-adjusted visual acuity.
- **Form Follows Function**: High numerical readability, tactical dial and slider controls, responsive touch targets ($\ge 44\text{px}$).
- **Single Typeface**: `Plus Jakarta Sans` or `Geist` for UI prose; `JetBrains Mono` or `Geist Mono` exclusively for numeric readings, coordinates, and optical parameters.
- **No Italics & No 900+ Ultra-Bold**: Max font-weight semibold (`font-semibold` / 600) or bold (`font-bold` / 700).

## 2. Color Tokens

| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| **Obsidian 950** | `#080d16` / `#0b111e` | Deep night viewport background |
| **Surface Dark** | `#111827` / `#131b29` | Floating glass card surfaces |
| **Glass Border** | `rgba(255, 255, 255, 0.08)` | Subtly defined component boundaries |
| **Electric Cyan** | `#12d6c7` (Glow: `rgba(18, 214, 199, 0.35)`) | Primary interactive accents, active tabs, sharp focus markers |
| **Solar Amber** | `#fca311` (Glow: `rgba(252, 163, 17, 0.35)`) | Bulb timers, celestial orbital rings, warning indicators |
| **Lunar Silver** | `#e2e8f0` | High-contrast body text & titles |
| **Muted Slate** | `#64748b` / `#94a3b8` | Labels, secondary telemetry, and units |

## 3. Spacing & Type Scale Constraints
- **Allowed Spacing Steps**: `0`, `2px`, `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`.
- **Button Standards**:
  - Primary button: `text-base font-semibold px-4 py-2 rounded-lg`.
  - Header/Compact button: `text-sm font-semibold px-3 py-1.5 rounded-md`.
- **Nested Corner Radius Formula**:
  $$\text{inner\_radius} = \text{outer\_radius} - \text{padding}$$
  *(Only applied when the difference is $> 2\text{px}$).*

## 4. Tactile Controls & Graphics
1. **Rotary Aperture / Dial Knobs**: Radial gradients with bevel lighting and cyan indicator notches for sensory feedback.
2. **Circular SVG Countdown Timers**: Dynamic `stroke-dashoffset` with pulsing amber glows during active exposures.
3. **Realistic Moon Disk**: Multi-layer gradients with crater shading and accurate terminator curvature reflecting current lunar phase.
4. **AR Viewfinder HUD**: Tactical crosshairs, 4K framing guidelines, digital spirit level (pitch/roll indicators), and target tracking bounding boxes.
5. **No Background Gradients on Cards**: Clean, flat obsidian/glass surfaces with translucent borders. Gradient text allowed only for hero titles (`#FFFFFF` to `#9B9B9B`).

## 5. Mobile & Tablet Responsiveness
- **Mobile First**: Fixed bottom navigation bar with thumb-friendly touch targets.
- **Tablet Adaptation**: Persistent collapsible sidebar or split-pane view with real-time graphical inspector side-by-side with calculation parameters.
- **Desktop**: Max-width container (`max-w-6xl`) with multi-column dashboard grid.

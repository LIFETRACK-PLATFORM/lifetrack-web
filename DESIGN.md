---
name: Clinical Vitality
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#a93349'
  on-secondary: '#ffffff'
  secondary-container: '#fe7488'
  on-secondary-container: '#730425'
  tertiary: '#4648d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#6063ee'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffdadc'
  secondary-fixed-dim: '#ffb2b9'
  on-secondary-fixed: '#400010'
  on-secondary-fixed-variant: '#891933'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  metric-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 20px
---

## Brand & Style
The design system is built on the intersection of medical precision and personal habit-building. The brand personality is **authoritative yet empathetic**, providing a sense of calm control over complex health and productivity data.

The style is a hybrid of **Corporate Modern** and **Soft Minimalism**. It prioritizes high legibility and information density without appearing cluttered. Borrowing from high-end wearables, it uses spacious layouts and purposeful color hits to guide the user's eye toward progress and action. The UI should evoke a feeling of "ordered life," moving away from chaotic notification-driven interfaces toward a structured, data-driven sanctuary.

## Colors
The palette uses a **Deep Teal (#0D9488)** as the anchor, representing physiological stability and steady progress. The **Warm Coral (#FB7185)** is reserved strictly for high-priority actions, critical health alerts, and motivational "streaks" to maintain its visual impact.

- **Primary (Teal):** Used for active states, primary buttons, and positive data trends.
- **Accent (Coral):** Used for "Commit" actions and urgent notifications.
- **Tertiary (Indigo):** Introduced for secondary data categories like sleep or focus sessions to provide visual distinction in charts.
- **Neutrals:** A slate-based neutral scale ensures that text remains legible against both light and dark backgrounds, avoiding pure blacks to reduce eye strain during late-night health tracking.

## Typography
The system utilizes **Inter** for its neutral, highly legible character in UI controls and long-form content. To distinguish data and technical metrics, **Geist** is introduced for labels and large numerical displays; its monospaced-influenced proportions ensure that numbers remain aligned and easy to scan in dashboards.

- **Headlines:** Use tight letter-spacing and bold weights to establish a strong hierarchy.
- **Metrics:** Numerical data should always use the `metric-xl` or `label` roles to evoke a technical, clinical feel.
- **Body:** Standardized at 16px for optimal readability across all demographics.

## Layout & Spacing
The layout follows a **Fluid Grid** system with a strict 4px baseline rhythm.

- **Desktop:** 12-column grid with 24px gutters and 40px side margins. Sidebars are fixed at 280px to allow the main content area to breathe.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and margins.

Information density is managed through "Negative Space Pockets"—areas of 40px+ padding between major sections (e.g., separating Sleep Data from Activity Logs) to prevent cognitive overload.

## Elevation & Depth
This design system utilizes **Tonal Layers** combined with **Ambient Shadows**. Instead of traditional heavy shadows, depth is communicated through subtle shifts in background saturation.

- **Level 0 (Base):** The primary background color.
- **Level 1 (Cards):** Raised with a very soft, high-blur shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`. In dark mode, this is achieved by lightening the slate surface by 2%.
- **Level 2 (Modals/Popovers):** Higher elevation with a more pronounced shadow to indicate interactivity.
- **Glassmorphism:** Used exclusively for the mobile bottom navigation bar and the desktop sidebar header, utilizing a 12px backdrop blur to maintain context of the content underneath.

## Shapes
A **Rounded** shape language is employed to soften the clinical nature of the data.

- **Standard Elements:** 0.5rem (8px) radius for buttons and input fields.
- **Containers:** 1rem (16px) radius for dashboard cards and modular sections.
- **Pills:** 100px radius for status chips (e.g., "In Progress," "Synced") and small toggle switches.

## Components
- **Buttons:** Primary buttons use the Teal background with white text. Secondary buttons use a subtle Teal outline with a 5% Teal fill on hover.
- **Cards:** White or Deep Slate containers with a 1px border (`#E2E8F0` in light / `#1E293B` in dark) to define boundaries without heavy shadows.
- **Data Visualization:** Charts should use rounded line caps. Use Teal for positive trends, Gray for neutral, and Coral for "below goal" or "high stress" metrics.
- **Input Fields:** Minimalist design with a 1px bottom border that transforms into a full 8px rounded box outline only when focused.
- **Bottom Navigation (Mobile):** Features large, clear icons with `label-md` text. The active state uses a small teal dot underneath the icon rather than a full color change.
- **Progress Rings:** Used for health metrics (Steps, Heart Rate). Use a thick 8px stroke with a rounded cap and a muted track color.

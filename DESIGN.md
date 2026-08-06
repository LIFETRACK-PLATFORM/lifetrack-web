---
name: Nightframe
colors:
  dark:
    bg: '#0A0A0C'
    surface-1: '#111114'
    surface-2: '#1B1B1F'
    surface-3: '#242429'
    surface-4: '#2D2D34'
    surface-5: '#3A3A42'
    primary: '#7C5CFF'
    primary-hover: '#8D71FF'
    primary-active: '#6A4AE8'
    accent-tint: '#B9ACFF'
    border: '#2A2A30'
    text-1: '#F2F2F4'
    text-3: '#6E6E76'
    success: '#3FCB8C'
    warning: '#F5A623'
    error: '#F2555A'
  light:
    bg: '#F6F6F7'
    surface-1: '#FFFFFF'
    surface-2: '#F0F0F2'
    surface-3: '#E7E7EA'
    surface-4: '#DBDBDF'
    surface-5: '#C8C8CE'
    primary: '#7C5CFF'
    primary-hover: '#6A4AE8'
    primary-active: '#5B3ED6'
    accent-tint: '#7C5CFF'
    border: '#E1E1E5'
    text-1: '#14141A'
    text-3: '#8A8A92'
    success: '#2CA876'
    warning: '#B96F09'
    error: '#D8383F'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
  heading-1:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
  heading-2:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
  heading-3:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
  heading-4:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
  body:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
  caption:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
  metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
icons:
  set: lucide-react
  stroke: 1.75px
  style: esquinas redondeadas, coherente con Nightframe
rounded:
  sm: 10px
  DEFAULT: 12px
  md: 14px
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

> Referencia visual completa (todos los componentes renderizados, light + dark): [`docs/design-system/nightframe-reference.html`](./docs/design-system/nightframe-reference.html). Este `.md` documenta las reglas y tokens — el HTML muestra cómo debe verse cada uno en la práctica. Ante cualquier duda de implementación, el HTML manda.

## Brand & Style
Nightframe reemplaza al sistema anterior ("Clinical Vitality" — teal + coral, estética médica) que se sintió frío para un producto que además de rehab cubre tareas, finanzas y una bóveda de contraseñas de toda la familia. La personalidad es **oscura, minimalista y premium**: "precisión silenciosa, control total de tu vida, sin ruido visual."

El estilo es **chato por diseño**: casi cero sombra, jerarquía comunicada por contraste de superficie (bordes hairline, escalones de gris) en vez de elevación decorativa. Un solo acento de color (violeta) se usa con moderación — nunca como decoración, siempre para marcar lo interactivo o lo importante.

## Colors
El **Violeta (#7C5CFF)** es el único color de marca — se usa en botones primarios, estados activos y focos de atención. No hay un color secundario "decorativo"; en su lugar, la jerarquía se construye con 5 niveles de superficie (`surface-1` a `surface-5`) que se aclaran progresivamente sobre el fondo base.

- **Primary (Violeta):** Botones primarios, links, estados activos de navegación, foco de inputs.
- **Accent-tint:** Halos/fondos sutiles detrás de iconos o badges activos (nunca como fondo de texto largo).
- **Semánticos:** `success` (verde) para completado/positivo, `warning` (ámbar) para pendiente/atención, `error` (rojo coral) para vencido/crítico. Se usan solo en badges, bordes de input y mensajes — nunca como fondo de página.
- **Modo claro y oscuro son ciudadanos de primera clase:** no es solo invertir valores — en claro los `surface` bajan de contraste entre sí (blancos y grises muy cercanos) mientras que en oscuro se separan más para mantener legibilidad sin depender de sombra.

## Typography
**Space Grotesk** para todo lo que es jerarquía (display, headings) — geométrica, técnica, con carácter. **Manrope** para body y UI controls — neutral y muy legible en bloques largos. **JetBrains Mono** exclusivamente para métricas y números grandes (dashboards, montos, porcentajes), para que los dígitos queden alineados y se sientan "de instrumento".

- **Headings:** Space Grotesk 600–700, sin letter-spacing negativo agresivo — el peso hace el trabajo, no la compresión.
- **Métricas:** Todo número protagonista (saldo, % de sesiones completadas, KPIs) usa `metric-lg` o `metric-sm` en JetBrains Mono.
- **Body:** 14px como tamaño base de UI, 16px (`body-lg`) para contenido de lectura larga.

## Layout & Spacing
Grid fluido de 4px de base, igual que el sistema anterior — esto no cambia entre direcciones de diseño.

- **Desktop:** 12 columnas, 24px gutter, sidebar fijo (con iconos + label) para navegación entre módulos.
- **Tablet:** 8 columnas, 20px gutter.
- **Mobile:** 4 columnas, 16px gutter, navegación inferior.

## Elevation & Depth
Nightframe **no usa sombra dura**. La profundidad se comunica exclusivamente con:
- **Contraste de superficie:** cada nivel (`surface-1` → `surface-5`) es un paso de luminosidad, no un shadow. Un card "flota" porque su superficie es un paso más clara que el fondo, no porque tenga blur debajo.
- **Bordes hairline:** 1px al ~8-12% de opacidad sobre el fondo, para separar sin pesar visualmente.
- **Modales/Popovers:** el único lugar donde se permite un scrim/overlay oscuro detrás — pero el modal mismo sigue siendo plano.

## Shapes
Radios moderados, ni muy angulares ni muy suaves — refuerzan "control técnico" sin caer en frío absoluto.

- **Botones e inputs:** 10px.
- **Cards y contenedores:** 12–14px.
- **Chips/badges/avatares:** full (pill/círculo).

## Iconography
Set **lucide-react** (viene por defecto con shadcn/ui — no mezclar con react-icons u otros sets para no romper consistencia de grosor). Stroke 1.75px, esquinas redondeadas. Iconos base del proyecto: `dashboard`, `tareas`, `finanzas`, `vault`, `rehab`, `carrera`, `calendario`, `notificación`, `búsqueda`, `usuario`, `check`, `alerta`, `config`, `chevron`, `cerrar`, `agregar`.

## Components
- **Botones:** variantes `primary` / `secondary` / `ghost` / `destructive` / `icon-button`, en 3 tamaños, con estados default/hover/focus/disabled explícitos (no solo opacidad — `primary-hover` y `primary-active` son tokens propios).
- **Inputs:** borde 1px por defecto, estado `error` con borde rojo + mensaje debajo, `disabled` con superficie apagada. Incluye textarea, select/dropdown y combobox con búsqueda.
- **Selección:** checkbox, radio y switch siguen el mismo lenguaje plano — sin relieve, cambio de color como único feedback.
- **Calendario:** vista mensual completa, día seleccionado marcado con `primary`, usado para citas de rehab y vencimientos.
- **Badges de estado:** `Activo` (success), `Pendiente` (warning), `Vencido` (error), `Completado` (neutral/surface) — texto + punto de color, sin fondo saturado.
- **Cards y tablas:** card base sin sombra (borde + superficie), tabla con sorting por columna.
- **Overlays:** modal/dialog con scrim, toast de confirmación/error, tooltip.
- **Progreso:** barra lineal y progress ring de 8px stroke (métricas de rehab: sesiones completadas, %).
- **Avatares:** avatar simple y avatar group con overflow (`+N`) para vistas de equipo/familia.

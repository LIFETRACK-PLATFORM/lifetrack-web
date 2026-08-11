<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Design system

Before writing or editing any UI (components, styles, layout, colors, typography), read `DESIGN.md` first — it's the **Nightframe** design system (colors, typography scale, spacing, roundness, elevation, component rules). Match it instead of guessing values. Visual reference: `docs/design-system/nightframe-reference.html`. Use lucide-react for icons; support dark and light via next-themes (`class="dark"` on `<html>`).

**All UI primitives come from `@lifetrack/system-design`** (already a dependency — full catalog in that package's `src/index.ts` or Storybook: `Button`, `Input`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Card`, `Table`, `Dialog`, `Skeleton`, `Spinner`, `EmptyState`, `FormField`, etc.). Never hand-write a native `<select>`, `<button>`, raw `<input>`, or a styled `<div>`/`<span>` that recreates one of these — even when the Tailwind classes correctly match the Nightframe tokens, it's still a duplicate to maintain and it drifts from Storybook. Check the package's exports first. If a component genuinely doesn't exist there yet, don't improvise it natively in `frontend/web` — add it to the `frontend/system-design` repo instead (separate git repo; follow its existing `atoms`/`molecules`/`organisms` structure and add a Storybook story like the rest of the catalog), bump the version consumed here, then import it. Native markup is a last resort only, and must be temporary and clearly flagged (e.g. `// TODO: replace with @lifetrack/system-design once added`).
<!-- END:nextjs-agent-rules -->

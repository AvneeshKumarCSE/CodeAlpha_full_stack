---
name: ui-ux-design
description: UI/UX design guidelines, accessible color palettes, responsive layouts, micro-interactions, and visual hierarchy for web applications.
---

# UI / UX Design & Aesthetics Skill

## 1. Visual Hierarchy & Typography
- Use clean, modern system fonts (`Inter`, `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`).
- Maintain clear typographic scale: H1 (2rem/32px bold), H2 (1.5rem/24px bold), H3 (1.25rem/20px semibold), Body (1rem/16px regular).
- Consistent line-height (`1.5` for body, `1.2` for headings) and paragraph spacing.

## 2. Color System & Contrast
- **Primary Color**: Trustworthy indigo/blue (e.g. `#4f46e5` / `#6366f1`).
- **Surface & Backgrounds**: Crisp light slate (`#f8fafc`, card surface `#ffffff`) or dark mode (`#0f172a`, card surface `#1e293b`).
- **Semantic Feedback Colors**:
  - Success: `#10b981` (Emerald)
  - Warning: `#f59e0b` (Amber)
  - Danger/Error: `#ef4444` (Rose/Red)
  - Info: `#3b82f6` (Sky/Blue)
- Ensure all text passes WCAG AA contrast standards (minimum 4.5:1 ratio).

## 3. Layouts & Responsiveness
- Mobile-first approach using CSS Flexbox and CSS Grid.
- Touch targets must be at least 44px by 44px for buttons and interactive controls on mobile.
- Smooth transitions on interactive states (hover, active, focus-visible) with `transition: all 0.2s ease`.

## 4. Feedback & Micro-Interactions
- **Loading States**: Display skeleton loaders or clean spinners during async API calls.
- **Toasts / Alerts**: Show immediate, dismissable toast feedback for actions (e.g. "Item added to cart", "Order placed successfully").
- **Empty States**: Friendly illustrations/icons and helpful CTAs when lists (cart, products) are empty.

---
name: ui-ux-design
description: UI/UX design guidelines, accessible color palettes, responsive layouts, micro-interactions, and visual hierarchy for web applications.
---

# UI / UX Design & Aesthetics Skill

## 1. Visual Hierarchy & Typography
- Clean modern social timeline typography (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
- Post font size: 15px - 16px with `1.4` line height for readability.
- Clear distinction between author name (bold), handle/timestamp (muted gray), and post text.

## 2. Color System & Contrast
- **Brand Accent**: Electric sky blue / violet (e.g. `#1d9bf0` or `#6366f1`).
- **Heart / Like**: Soft crimson (`#e11d48` or `#f43f5e`).
- **Surfaces**: Crisp light background (`#f8fafc`) with pure white post cards (`#ffffff`), or sleek dark mode (`#0f172a` with `#1e293b`).
- Borders: Subtle `#e2e8f0` (light) or `#334155` (dark).

## 3. Responsive Layouts & Components
- 3-Column desktop layout (Nav sidebar - Feed stream - Widget sidebar) collapsing to a single-column layout on mobile with bottom navigation bar.
- Touch targets at least 44px on mobile.
- Smooth CSS transitions (`transform: scale(1.05)` on like button click, smooth dropdown fade-in).

## 4. Feedback & Micro-Interactions
- **Optimistic UI**: Instantly update heart icon state and counter before network response completes.
- **Loading & Skeleton States**: Subtle shimmer loading bars for the feed before posts arrive.
- **Empty States**: Encouraging illustration and message when feed or comment thread is empty.

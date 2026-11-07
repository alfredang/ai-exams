---
name: tia-frontend-design-site
description: This site's own design system for Tertiary Exams, certification practice exams — light blue-tinted pages, brand blue, Archivo + IBM Plex. Load with the user-level tia-frontend-design skill.
---

# Tertiary Exams — Site Design System

**Load the user-level `tia-frontend-design` skill as well.** It owns the group's rules: no dead space or gaps, no chips, no template layouts, an animated hero, generated images and a lighter theme by default. This file records how they apply on this site and wins on theme and look.

## Direction

A practice-exam storefront and exam runner for people preparing for certifications. It should feel focused, credible and exam-ready.

## Theme

Light by default, with an optional dark mode the user can choose. Dark loads only if the user picked it (see `themeInitScript` in `src/app/layout.tsx`). Check every change in both.

| Token (`src/app/globals.css`) | Light | Dark |
|---|---|---|
| `--c-page` | `#f4f8ff` | `#070f22` |
| `--c-ink` | `#0e1a33` | `#e9f0fb` |

Brand blue is `#1d5bf0`, defined in `tailwind.config`. `.light-scope` keeps a block light inside dark mode.

## Type

Archivo (display), IBM Plex Sans (body), IBM Plex Mono, loaded once in `src/app/layout.tsx`.

## Hero and images

- **Hero:** `src/components/hero-exam-visual.tsx`, an animated exam visual that freezes under `prefers-reduced-motion`. This is the site's benchmark; do not replace it with a static image.
- **Images:** `public/hero.webp` and `public/hero-dark.webp`. New images must be generated, not taken from a stock library, in both light and dark versions where they sit on the page background.

## Navbar, footer and chat widget

`src/components/nav.tsx`, `footer.tsx`, `footer-gate.tsx` and `whatsapp-widget.tsx`, whose mascot is a smiling support agent.

## Known violations

Do not copy these. Fix them when you touch the file.

- **Chat widget:** the greeting shows once per session; the standard asks for recurring pop-ups with real offers.
- **Chips:** `src/components/exam-runner.tsx`, `src/components/user-menu.tsx`.

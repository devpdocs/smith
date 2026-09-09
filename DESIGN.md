---
name: Smith Console
description: Warm-paper SaaS console — sessions left, thread center, per-session model switch.
colors:
  paper: "#f7f5f0"
  paper-deep: "#efe9dd"
  surface: "#ffffff"
  ink: "#1a1917"
  ink-2: "#5c5750"
  ink-3: "#6e6960"
  line: "#e7e1d6"
  line-soft: "#f0ebe0"
  accent: "#b15536"
  accent-strong: "#96431f"
  accent-soft: "#f9e9e0"
  success: "#3e7c4f"
  danger: "#b00020"
typography:
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  heading:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.72rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.95rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  session-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  input-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
---

## Overview

Smith Console is the shared visual world for the dashboard (Operate) and the landing auth (same task language). Restrained and light by scene: teams working in daylight. Sidebar in warm paper, thread in white, one clay accent reserved for selection, primary actions, and state. No display serif, no neon, no marketing chrome inside the app.

## Colors

Paper `#f7f5f0` owns sidebars and quiet grounds; content surfaces stay pure white. Ink `#1a1917` carries prose (≈17:1 on white). Secondary `#5c5750` and tertiary `#6e6960` both clear AA for small text. Hairlines `#e7e1d6` structure, `#f0ebe0` whispers. Accent clay `#b15536` (≈5:1 white text) is the only saturated voice: active session, primary buttons, focus rings, model dots. Danger red appears only on errors and denied states, never as decoration.

## Typography

One workhorse system sans for everything — headings, labels, body, data — at a tight 1.125 step scale, never fluid. Section labels are 0.72rem uppercase with 0.08em tracking. Body prose caps at ~52rem columns with 1.65 line height. Counts, model names, and metadata always use tabular numerals.

## Layout

App shell: 57px brand bar (mark + segmented Chat/Audit switch + user chip + Log out) over a full-height workspace. Chat: 288px session rail + centered 52rem thread (header with model pill, message column, pill composer). Audit inherits the shell as three reading columns (250px users / 300px conversations / fluid reader). Under 960px everything stacks structurally: rail becomes a horizontal strip, audit columns pile. Type never scales fluidly.

## Elevation & Depth

Shadows always carry offset plus soft blur (`0 1px 2px + 0 8px 24px -12px` at ink 6–18%). Active sessions and the composer float; hover only tints. Focus is a clay ring (`0 0 0 3px` at 22%). Motion is 150–180ms ease-out state transitions only; the single authored loading moment is a shimmer skeleton, never a bare spinner. Honors `prefers-reduced-motion`.

## Shapes

Pills (999px) for primary actions, search, model switch, view switch, composer, avatars. Cards and bubbles at 10–14px radius; user messages use 14px with a 4px corner marking the speaker side. No hard offset shadows, no gradient text, no glass.

## Components

- Session item: title (ellipsis) + model dot with per-model hue + model label; active state is white card with hairline and shadow.
- Model switch: segmented pill group in the thread header (`aria-pressed`), one button per model — replaces the old dropdown.
- Composer: pill with border, shadow, clay focus ring; hint line names the session rule.
- Provider-deferred slot: dashed paper notice, never persisted content.
- Landing auth: same tokens — paper ground, white 18px panel, clay pill submit, identical focus and error language.

## Do's and Don'ts

- Do keep one model per session, changed explicitly in the header pill.
- Do keep audit read-only and visually inside the same shell.
- Don't add marketing gestures, kickers, or display faces to the app.
- Don't simulate assistant content — the deferred notice is the only placeholder.
- Don't spend the accent on inactive states or decoration.

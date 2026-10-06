# Design Brief

## Direction

Stade Mahdia Night — a Tunisian youth football clubhouse: sport-green energy on deep charcoal (dark) and crisp pitch-white (light), with gold for prestige and blue for secondary actions.

## Tone

Bold, athletic and confident — a real Tunisian sports platform, not a university project; energetic but disciplined, never garish.

## Differentiation

A signature "pitch-line" texture and scoreboard-style mono numerals give every card a stadium feel, while gold star ratings and green/red availability badges read instantly on mobile.

## Color Palette

| Token      | OKLCH (light / dark)   | Role                              |
| ---------- | ---------------------- | --------------------------------- |
| background | 0.985 0.004 150 / 0.155 0.012 155 | Page canvas            |
| foreground | 0.17 0.02 155 / 0.95 0.008 150    | Primary text           |
| card       | 1 0 0 / 0.2 0.015 155             | Surfaces, match cards  |
| primary    | 0.52 0.16 152 / 0.72 0.17 152     | Sport green — brand/CTA|
| accent     | 0.76 0.14 82 / 0.8 0.14 84        | Gold — stars, prestige |
| info       | 0.55 0.15 245 / 0.68 0.14 245     | Blue — links, secondary|
| muted      | 0.955 0.008 150 / 0.24 0.02 155   | Subtle backgrounds     |
| status-available | 0.6 0.15 152 / 0.72 0.15 152 | Green "Disponible" badge |
| status-reserved  | 0.6 0.19 32 / 0.68 0.18 32   | Red "Réservé" badge      |

## Typography

- Display: Space Grotesk — headings, hero, section titles (geometric, sporty).
- Body: Figtree — paragraphs, labels, UI text (excellent Latin/French; Arabic falls back to Noto Kufi/Naskh then system).
- Mono: Geist Mono — scores, times, prices, stats.
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`.

## Elevation & Depth

Layered surfaces: flat `background` → raised `card` with `border-border` + `shadow-subtle` → interactive `shadow-elevated`; dark mode uses `shadow-elevated-dark` and `shadow-inset-soft` for depth without glow.

## Structural Zones

| Zone    | Background             | Border     | Notes                                            |
| ------- | ---------------------- | ---------- | ------------------------------------------------ |
| Header  | `bg-card/80` + backdrop-blur | `border-b` | Sticky; logo ⚽ AYA NKAWROU? + language switcher |
| Sidebar | `bg-sidebar`           | `border-r` | Desktop only; primary nav items, active = green tint |
| Content | `bg-background`        | —          | Alternate sections with `bg-muted/30`; pitch-lines accents |
| BottomNav | `bg-card/95` + backdrop-blur | `border-t` | Mobile only; 5 items + central raised green "+" FAB |
| Footer  | `bg-muted/40`          | `border-t` | Subscription card + "Developed by Ala Manaa — Student" |

## Spacing & Rhythm

Mobile-first: `px-4`, sections `py-8 md:py-12`, card padding `p-4 md:p-5`, tight `gap-2` inside cards, `gap-4 md:gap-6` between cards; generous whitespace around hero.

## Component Patterns

- Buttons: `rounded-full` pills; primary = sport-green gradient with white text; secondary = `bg-secondary`; ghost/outline for tertiary; `active:scale-[0.97]` hover lift.
- Cards: `rounded-2xl`, `bg-card`, `border-border`, `shadow-subtle` → `shadow-elevated` on hover; match cards use a pitch-line strip and mono kickoff time.
- Badges: pill `rounded-full`, soft tinted backgrounds — available (green), reserved (red), plus gold star ratings (`text-accent`).
- Rating: gold filled stars via `text-accent`, empty via `text-muted-foreground/40`.

## Motion

- Entrance: `animate-fade-up` staggered on cards/sections (0.5s cubic-bezier).
- Hover: `transition-smooth`, subtle lift + shadow, `active:scale-[0.97]` on buttons.
- Decorative: `pulse-soft` on live/available indicators, `slide-up` for mobile sheets/FAB menu.

## Constraints

- Only semantic tokens; never raw hex/rgb or arbitrary color classes in components.
- Support light + dark themes via `.dark` class; maintain AA+ contrast in both.
- Latin bundled fonts only — Arabic must fall back to the system Arabic stack cleanly.
- Do not build: tournaments/rankings, community feed, referee system, volunteer signup, user calendar, post-match ratings, in-app notifications, recurring billing, interactive map, result/stat entry, SMS verification, real Tunisian payment gateway, offline PWA.

## Signature Detail

The stadium scoreboard motif — Geist Mono numerals for times/scores/prices paired with a subtle pitch-line texture — makes every listing feel like a real match day at Stade Mahdia.

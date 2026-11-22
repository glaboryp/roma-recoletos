---
name: ¡Rumbo a Roma!
description: Fajines y calcetines de las universitarias de Recoletos para pagar el viaje a Roma, sobre el papel del cartel.
colors:
  paper: "#f3e5cf"
  paper-deep: "#e8d4b5"
  paper-raised: "#faf2e4"
  ink: "#22304d"
  ink-soft: "#4a5573"
  wine: "#6b1517"
  wine-deep: "#521012"
  line: "#dcc6a4"
  ok: "#2f5d34"
  ok-tint: "#dbe7cf"
  warn-tint: "#f3d9c9"
typography:
  display:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(56px, 8.4vw, 120px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(44px, 6vw, 88px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(36px, 4vw, 48px)"
    fontWeight: 400
    lineHeight: 1
  price:
    fontFamily: "Gochi Hand, cursive"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.06em"
  body:
    fontFamily: "Raleway Variable, Raleway, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.55
  body-app:
    fontFamily: "Raleway Variable, Raleway, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: "Raleway Variable, Raleway, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  wordmark:
    fontFamily: "Raleway Variable, Raleway, system-ui, sans-serif"
    fontSize: "clamp(72px, 13vw, 200px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
rounded:
  none: "0px"
spacing:
  tile-gap: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  margin: "clamp(16px, 3vw, 40px)"
  section: "clamp(96px, 12vw, 180px)"
components:
  button-primary:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.wine-deep}"
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  button-light-hover:
    backgroundColor: "{colors.paper-raised}"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-deep}"
  button-small:
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
    height: "48px"
  stepper-on:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper}"
    height: "44px"
  pill-paid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "0 10px"
    height: "26px"
  pill-pending:
    textColor: "{colors.wine}"
    padding: "0 10px"
    height: "26px"
  summary-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "32px"
  sheet:
    backgroundColor: "{colors.paper-raised}"
    rounded: "{rounded.none}"
    padding: "24px"
  notice:
    backgroundColor: "{colors.warn-tint}"
    textColor: "{colors.wine-deep}"
    padding: "14px 18px"
  notice-ok:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok}"
---

# Design System: ¡Rumbo a Roma!

## Overview

**Creative North Star: "The Poster on the Specimen Wall"**

The world is the client's own poster, "¡Rumbo a Roma!", lifted off the noticeboard: cream paper, a wine headline in condensed heavy caps, navy text, prices lettered by hand, and the "recoletos / -centro universitario-" signature. Everything else is the girls' own photographs of the socks and sashes, used as material rather than decoration: tiled into a wall, swapped into a large frame, run edge to edge in a strip.

Surfaces are flat sheets of paper in three tones laid on top of each other. Blocks of solid wine and navy act as the poster's ink: the order summary, the thanks band, the payment half of the confirmation, the footer. Corners are square everywhere. There is one floating object, the basket bar, and it is the only thing that casts a shadow.

The public shop is generous and editorial (large type, 12-column asymmetric rows, big section gaps). The panels for sellers and admins reuse the same paper, ink and type in a dense, quiet register: Anton titles, Raleway tables, a ledger line as the one big number.

**Key Characteristics:**
- Cream paper ground, navy text, wine as the poster's voice.
- Anton uppercase for every heading; Gochi Hand only for prices; Raleway for everything read.
- Square corners, no strokes for structure; tone shifts separate regions.
- Product photography is the only imagery.
- Flat; a single shadow on the floating basket bar.

## Colors

A three-ink poster palette on warm paper: cream, wine, navy.

### Primary
- **Poster Wine** (wine): headings on paper, the primary button, the active stepper, the thanks band, the payment panel, focus rings and text selection. It is the poster's headline colour and the only accent.
- **Pressed Wine** (wine-deep): hover state of wine surfaces; text colour on warning notices.

### Secondary
- **Navy Ink** (ink): all body text on paper, the order summary block, the footer, the hero's backing under the wall, the paid pill and the active nav item.

### Neutral
- **Cream Paper** (paper): the page ground; text colour on wine and navy blocks.
- **Deep Paper** (paper-deep): recessed regions (the "Tus datos" section, the app top bar), table row rules, image placeholders, ghost-button hover.
- **Raised Paper** (paper-raised): sheets that sit on the page: inputs, steppers, ledgers, tables, admin forms.
- **Soft Ink** (ink-soft): secondary text, table headers, helper text, input hover border.
- **Kraft Line** (line): resting input border and stepper pressed state.

### Status
- **Leaf** (ok) on **Leaf Tint** (ok-tint): success notice.
- **Blush** (warn-tint) with wine-deep text: error and warning notice.

### Named Rules
**The Three Inks Rule.** Paper, wine and navy carry every surface. A new region is a paper tone, a wine block or a navy block; no fourth hue enters except the two status tints.

**The Wine Is The Headline Rule.** Wine is for the poster's voice (headings, the main action, the selected state). Running text on paper stays navy; the one exception is the hero's poster sentence, which repeats the poster.

## Typography

**Display Font:** Anton (with Arial Narrow, sans-serif)
**Body Font:** Raleway Variable (with Raleway, system-ui)
**Hand Font:** Gochi Hand (with cursive)

**Character:** The poster's condensed heavy caps over a friendly geometric sans, with a hand-lettered price line that reads like a marker on the noticeboard.

### Hierarchy
- **Display** (Anton 400, clamp(56px, 8.4vw, 120px), 0.92, uppercase): the hero h1 and the confirmation h1. 15vw on phones.
- **Headline** (Anton 400, clamp(44px, 6vw, 88px), 0.95, uppercase): shop section titles; the login title.
- **Title** (Anton 400, clamp(36px, 4vw, 48px), 1, uppercase): product names, panel page titles; fixed 48px for summary and recap titles and big totals; 28px for panel section titles.
- **Price** (Gochi Hand 400, 38px, 0.06em, uppercase): product price lines and the hero price list (34px). 30px / 22px on phones.
- **Body** (Raleway 500, 18px, 1.55): shop text; descriptions capped at 46-52ch. The app panels drop to 16px.
- **Label** (Raleway 700, 15px): field labels, nav links, buttons inherit weight 700.
- **Wordmark** (Raleway 800, clamp(72px, 13vw, 200px), -0.04em, lowercase): the "recoletos" signature in the footer; 18px/800 in the hero dock.

### Named Rules
**The Caps Are Anton Rule.** Only Anton is set in capitals, plus the hand-lettered price. Raleway is never uppercased or tracked out.

**The Hand Is For Money Rule.** Gochi Hand appears only on prices. It never sets a heading, a label or a sentence.

**The Tabular Money Rule.** Amounts in tables, steppers, totals and the ledger use tabular figures.

## Layout

A 12-column grid with 24px gutters drives the shop: intro rows split 7/5, product rows split 5/6 and alternate sides on even rows, the details section splits form 1-6 and a sticky summary 8-12, the thanks band splits 7/5. Below 900px every split collapses to one column and the summary stops being sticky.

The page margin is fluid (clamp(16px, 3vw, 40px)); shop sections are separated by clamp(96px, 12vw, 180px). Product photos and the strip run without gaps; the specimen wall tiles at 8px. The hero is a full-viewport wall of 112x140 tiles (22vw on phones) with a paper dock anchored 24px from the bottom, centred, up to 1100px wide; on phones it goes full width flush to the bottom.

The panels use a 1240px centred canvas, 40px top padding, 48px between blocks, 16px inside blocks. Tables stack into two-column cards below 760px.

## Elevation & Depth

Flat. Depth is tonal: deep paper recesses, raised paper sits forward, wine and navy blocks are solid ink. Inset 2px rings act as strokes on the ghost button and the pending pill; they are borders, not elevation.

### Shadow Vocabulary
- **Floating bar** (`box-shadow: 0 10px 30px rgb(34 48 77 / 0.3)`): the fixed basket bar only, because it floats over moving content.

### Named Rules
**The One Float Rule.** Only an element that is fixed over scrolling content gets a shadow. Everything at rest is a flat sheet.

## Shapes

Square corners throughout (0px), matching a cut-paper poster. Structure comes from fills, not outlines; the only borders are the 2px input stroke and 1px deep-paper rules between table rows. Photos are cropped with object-fit cover to fixed aspect frames (4:5 tiles, 1:1 preview, 4:3 on mobile).

## Components

### Buttons
Solid, square, confident.
- **Shape:** square (0px), 48px tall, 24px side padding, Raleway 700.
- **Primary:** wine fill, paper text. Hover to wine-deep; active nudges down 1px and scales 0.99.
- **Light:** paper fill, ink text, for use on wine or navy blocks (on the summary it takes wine text).
- **Ghost:** transparent with a 2px inset ring in currentColor; hover fills deep paper.
- **Small:** 36px tall, 14px padding, 15px text, used in panels and the basket bar.
- **Link button:** wine, bold, underlined, for row actions in tables.
- **Focus:** global 3px wine outline at 3px offset.

### Inputs / Fields
- **Style:** raised-paper fill, 2px kraft-line border, square, 48px tall; textareas from 88px.
- **Hover / Focus:** border moves to soft ink on hover and navy ink on focus.
- **Labels:** stacked above, 15px bold, with optional helper text in soft ink.

### Quantity Stepper
A raised-paper bar with minus, number and plus (40x44 buttons, stroked SVG glyphs). Once a row has a quantity the whole stepper turns wine with paper text, the swatch scales to 1.06 and the label turns wine. Without JavaScript only the numeric input shows.

### Index With Preview (signature)
Each product row pairs a big square frame with a list of colour rows (64x80 swatch, label, stepper). Pointing at or focusing a row cross-fades its close-up into the frame (240ms); leaving restores the cover. Thumbnails below switch the cover, the pressed one gets a 3px navy outline.

### Order Summary
A navy sheet, 32px padding, sticky at 24px: Anton title, line items with savings in small text, a 48px Anton total, and a paper button with wine text.

### Basket Bar
Fixed, centred, up to 560px, wine fill, paper text, the one shadow in the system. Rises in over 320ms when the first item is added.

### Navigation
App top bar on deep paper: Anton wordmark in wine, bold 15px links with paper hover and a navy fill for the current page. The hero dock carries an inline product nav with the "recoletos" mark.

### Pills
26px, 14px bold, square. Paid: navy fill. Pending: 2px wine inset ring with wine text.

### Ledger
A raised-paper line that reads as a sum ("Vendido - material = X para tu viaje"), with the result in 64px Anton wine (48px on phones).

## Do's and Don'ts

### Do:
- **Do** build new regions from the three paper tones and solid wine or navy blocks.
- **Do** set every heading in Anton uppercase and every price in Gochi Hand.
- **Do** use the girls' product photos as the only imagery, cropped to fixed frames.
- **Do** keep corners square (0px) on every surface, button, input and image.
- **Do** keep motion on the shared ease (cubic-bezier(0.16, 1, 0.3, 1)): 160ms for state, 240ms for image swaps, 700ms staggered rises, all reduced under prefers-reduced-motion.

### Don't:
- **Don't** add rounded corners, card shadows or outlined cards; depth is tone.
- **Don't** introduce a fourth hue or a gradient beyond the status tints.
- **Don't** use Gochi Hand for anything but money, or uppercase Raleway.
- **Don't** add stock imagery, illustrations or decorative icons; the only glyphs are functional (stepper plus/minus, the Google logo).

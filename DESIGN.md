# Portfolio design

Read the five decisions below before changing the homepage. Allow one minute.

## Decisions to keep

- Keep the homepage quiet and readable. Put technical depth in project pages and notes.
- Use IBM Plex Sans for prose. Use monospace for metadata and ASCII.
- Keep animated ASCII in the background. Donut and cube experiments are welcome there.
- Include dark mode at launch. Warm dark and OLED still need comparison.
- Keep readouts on home and inner pages. Include `/lab` and sound that starts off.

V3 is the homepage and shared design for all current pages. Preserve its 820 px composition, left section labels, warm paper texture, subtle hand-drawn details, and ASCII artwork. Warm dark is the default, with a warm light/dark toggle. Artwork defaults to the robot arm in dither. There is no Settings panel or proposal alias. Explicit URL parameters remain supported; normal visits keep a clean URL. The former homepage is archived at `/old`. Earlier proposals have been removed.

The remaining notes record the original design discussion. The adopted v3 implementation takes precedence over earlier starting points.

Values marked as starting points need visual testing. This document does not report implementation status.

## Purpose and references

The owner is a university student studying computer engineering, with a current interest in software systems. Leave room for that interest to change.

"Minimal but very detailed" means easy reading and careful interactions. Keep the homepage short. Use real project work and notes to explain decisions, mistakes, and learning. Never invent content to fill the layout.

Use precise alignment, fine rules, factual labels, and responsive controls to express the industrial direction. The conversation called this a small instrument.

| Reference | Use it for |
| --- | --- |
| [rauno.me](https://rauno.me) | Quiet composition and precise interaction details. |
| [Teenage Engineering](https://teenage.engineering) | Product typography, functional grids, warm materials, and orange accents. |
| [Chakib's 35mm experiment](https://lab.chakibmzn.com/35mm/) | Motion and physical prototype behavior. No specific interaction was selected for copying. |

These are the roles assigned in the conversation. Josh W. Comeau's direction was rejected. Avoid mixing unrelated visual styles.

## Homepage order

Aim for one to one and a half desktop screens with real content. Let mobile pages grow naturally.

1. **Introduction.** Name and two or three short, first-person sentences. A factual version or update readout may sit at the right. Place the ASCII field behind this region, with less density behind prose.
2. **Projects.** Aim for three to five rows when that content exists. Each has a title, one-line description, and right-aligned year. Separate rows with hairlines. On hover, shift the background slightly and move the arrow about 2 px.
3. **Notes.** Show up to three recent notes with reading time and date. Reuse the row layout and link to the full index.
4. **Now.** Show up to four label/value rows for reading, building, local time, and optional listening. Use small monospace labels, sans-serif values, and thin progress lines. Link to `/now`.
5. **Footer.** Keep GitHub, email, RSS, and the sound control compact. Use ordinary sans-serif links.

Keep the command palette available through `⌘K` and a visible "menu" control. Visitors must be able to navigate without knowing shortcuts.

Rows must work with a keyboard. Let metadata wrap or stack on narrow screens.

## Typography

Use IBM Plex Sans for prose and headings. JetBrains Mono is the working choice for dates, tags, versions, readouts, and ASCII. Compare IBM Plex Mono if the pairing feels wrong in real content. Geist was an earlier alternative.

| Element | Starting point |
| --- | --- |
| Body | 17 to 18 px with comfortable line spacing. |
| Name | Slightly larger than body text, medium weight. |
| Section headings | Small, sentence-case sans-serif. No numbering. |
| Inline monospace | Around 0.88 to 0.9 em beside sans-serif. |
| Small metadata and ASCII | Around 11 to 12 px where legible. Use tabular numerals for aligned data. |

The suggested balance was roughly 85% sans-serif. Judge it using paragraphs and rows, without counting characters. Limit font files and weights. Preserve the current homepage's proportions while tuning the final type and spacing scales.

## Color and themes

Use an orange leaning toward red, starting near International Orange `#FF4F00`.

| Theme | Background starting point | Text starting point |
| --- | --- | --- |
| Warm light | `#F4F1EC`, warm paper | `#1A1816` |
| Warm dark | `#141210`, warm anodized material | `#E8E4DD` |
| OLED dark | `#000000` | Light text, still to tune |

Dark mode is required at launch. The conversation left three choices open: which dark treatment to use, whether both ship, and the initial theme or system-preference behavior.

Reserve orange for active indicators, link hover states, focus treatment, and a few controls. The suggested 2% screen coverage means use it sparingly. Check readable contrast and visible focus in each theme.

Use hairlines and subtle background changes for boundaries. Dotted grids and corner marks were exploratory suggestions, not requirements.

## ASCII background

Keep the field behind the homepage introduction. Fade it before the project list. Avoid a surrounding monitor frame.

### Compare these five scenes

| Scene | What to assess |
| --- | --- |
| Rotating donut | Whether the familiar terminal meme works as a quiet background. |
| Rotating cube | The same test with a second geometric figure. |
| Slow noise | Sparse texture and gentle drift. |
| Contour field | Topographic structure and slow movement. |
| More figurative field | A recognizable form or stronger silhouette. A waveform band is one candidate. |

Use the same homepage layout for every scene. Compare each in warm light, warm dark, and OLED. No final scene or automatic scene rotation was agreed.

### Rendering starting points

- Use canvas and small vanilla JavaScript code. Avoid a heavy rendering dependency.
- Cap the field at 12 fps. Derive cells from monospace font metrics around 12 px.
- Start noise with `.:-=+*` and drift equivalent to about 1 px per second.
- Start field strength around 6% to 10%, tuned per theme. These are visual targets, not contrast ratios.
- Mask density or opacity behind prose. Reading takes priority over the field.

The original estimate was about 150 lines plus a noise function. Treat that as a size estimate, not a code limit.

### Interaction and accessibility

- Near a pointer, brighten cells within a soft radius around 120 px. Start with a peak strength of 25% to 30% and check readability.
- On touch devices, keep drift without pointer interaction.
- Pause when the tab is hidden.
- Under `prefers-reduced-motion`, show one static frame.
- Keep the canvas decorative, outside the accessibility reading order, and unable to block links, scrolling, or text selection.

Keep note and project pages comfortable for reading. A short field strip at the top remains optional.

## Motion and controls

| Interaction | Starting behavior |
| --- | --- |
| Hover and control feedback | Ease-out over 150 to 250 ms. Move about 2 to 4 px when useful. |
| Content entrance | Short fade and small upward movement. Stagger items by about 40 ms. |
| Field entrance | Fade in over about 400 ms. |
| Page navigation | Browser View Transitions, with ordinary navigation as a fallback. |
| Reading progress | Quiet indicator on notes. Avoid scroll-driven effects elsewhere. |

Show content immediately. Do not replay entrances when sections scroll into view. Replay behavior across navigation remains undecided.

Under reduced motion, freeze the field and use minimal fades or immediate changes. Keep links identifiable, with thin offset underlines where appropriate. Focus and state changes must remain visible without animation.

## Readouts and content pages

Use the same label/value pattern on home and inner pages. Project data plates can show stack, status, year, and repository.

| Data | Initial source |
| --- | --- |
| Reading and building | Editable structured data. |
| GitHub activity | Build-time fetch, with scheduled rebuilds if needed. |
| Local time | Client-side clock. |
| Listening | Optional integration, deferred until wanted. |

Label build-time snapshots accurately. Use real dates, versions, locations, and progress. The conversation's books, cities, and project names were examples.

Project pages should explain the problem, implementation, key decisions, failures, and lessons. Include real diagrams, photos, measurements, code, or demos when useful.

Notes need comfortable long-form reading and reading time or progress. Hover-revealed footnotes were requested. Any enhancement must work through keyboard focus and touch, while preserving normal footnote links.

Keep the small multi-page structure: home, projects, notes, `/now`, `/uses`, and `/lab`. Every route does not need a homepage section.

## Lab

Use a plain list of experiments with a name, one-line description, date, and factual monospace status. Suggested statuses are `working`, `wip`, `parked`, and `broken`.

Reuse project rows. An experiment can become a project when there is enough work to explain in depth.

The field was proposed as the first lab entry, with density and frame-rate controls on its own page. Keep those controls off the homepage.

`/lab/texture` and `/it/lab/texture` adjust the same paper shader and defaults used by the site. Controls affect only the lab, with URL replay, a visibility toggle, and a reset to site defaults. The shared paper background is fixed to the viewport so its texture does not stretch with page length.

## Sound

Sound starts off. Use a small footer control with an accessible name and visible on/off state. Remember the preference locally.

Start with one soft mechanical click lasting 40 to 60 ms, decoded once with Web Audio. Play it only for these interactions while sound is enabled:

- Theme toggle.
- Palette opening or closing.
- Sound toggle when enabling sound.

Never play on hover or page load. Every interaction must work without audio.

## Engineering checks

1. Inspect semantic HTML and clean page source. Keep client code and font files small.
2. Check layout shifts, mobile wrapping, and reading comfort in each theme.
3. Check keyboard navigation, visible focus, reduced motion, and content without animation.
4. Check RSS and generated per-page OG images.
5. Measure Lighthouse on finished pages. A perfect score is the target, not an existing result.

Use the existing Astro foundation. A Lighthouse score does not replace browser checks.

## Ideas to leave out

The later conversation dropped these ideas:

- Monospace everywhere, all-caps headings, and section numerals.
- ASCII monitor frames and fake status jokes such as `SYS NOMINAL`.
- An ASCII boot sequence that delays reading.
- Footer keyboard-hint lines and decorative external-link glyphs.

Avoid thick borders, hard offset shadows, candy colors, literal knobs, and heavy 3D experiences. Donut and cube backgrounds remain allowed.

Copy-email feedback, extra shortcuts, build hashes, note maturity tags, and a footer changelog were suggestions without individual confirmation. They do not require new work or justify removing existing behavior.

## Choices still open

1. Compare the five ASCII scenes on the same homepage.
2. Compare warm dark and OLED before choosing shipped themes and default behavior.
3. Compare JetBrains Mono with Plex Mono beside real Plex Sans content.
4. Tune field strength, spacing, typography, and entrance replay behavior after those comparisons.

For a one-minute review, start with the five-scene table under "ASCII background".

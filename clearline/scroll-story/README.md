# Clearline — Scroll Story

"Spotless, step by step." A scroll-driven story site for Clearline Commercial
Cleaning (fictional portfolio brand), built in the Lynam pattern: a pinned
section where scrolling cleans a room in five stages, a clean meter that runs
0 to 100 percent, and a "Which space needs us?" selector (office, clinic,
retail) plus a walkthrough request form.

## Files

- `index.html` — page structure
- `styles.css` — Clearline brand tokens (navy `#0A2540`, teal `#00B8A9`,
  Sora headings, Inter body)
- `script.js` — GSAP ScrollTrigger pin + scrub, Lenis smooth scroll,
  selector and form logic. Falls back to a static gallery with no JS or
  with reduced motion.
- `images/` — the original photos (AI-generated stand-ins). Not referenced
  by the page; see below.

## Why the photos are embedded in the HTML

The GitHub connector used to publish this repo cannot push binary files, so
the seven photos are inlined as base64 data URIs inside `index.html` and
`script.js`. The page is fully self-contained: three files, no image
requests. The originals are kept in `images/` so a photo can be swapped by
re-encoding it and replacing the matching data URI.

## Stack

GSAP 3.12 + ScrollTrigger and Lenis 1.1, all via CDN. No build step.

## Live

https://aa8corp.github.io/Website_Portfolio/clearline/scroll-story/
Linked from the portfolio home page as the seventh showcase.

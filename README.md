# EU CV CLI

Terminal CLI that turns a `resume.json` into **A4 PDF** and **Microsoft Word (`.docx`)** CVs tailored for European tech hiring — including EU Blue Card / relocation metadata and a professional photo.

> **Status:** Design docs only (`PLAN.md` + this README). Implementation starts after explicit approval.

## Who it’s for

International tech candidates (e.g. India → Europe) who need:

- ATS-friendly A4 layouts
- Native `.docx` without title/date collisions
- Clear EU mobility signals (Blue Card eligibility, notice period, relocation)
- A professional headshot (common expectation in DE / NL / AT / Nordics)

## Planned features

| Feature | Detail |
|---------|--------|
| Formats | PDF (Playwright) + DOCX (`docx`) |
| Validation | Zod schema against `resume.json` |
| Photo | Optional `basics.image`; sample includes `assets/sample-photo.jpg` |
| Templates | 3 pluggable layouts (see below) |
| Stack | TypeScript, Node.js ESM, Commander, Handlebars |

## Templates (v1)

| ID | Description |
|----|-------------|
| `tech-modern` | Single-column navy/charcoal; circular photo top-right (**default**) |
| `classic-eu` | Formal EU header; rectangular photo top-left |
| `compact-sidebar` | Two-column; photo + skills/languages/EU meta in left sidebar |

## Planned usage (after implementation)

```bash
npm install
npx playwright install chromium

# Default: tech-modern → PDF + DOCX into ./output
npm run generate -- --input ./resume.json

# Explicit flags
npx tsx src/cli.ts \
  --input ./resume.json \
  --template classic-eu \
  --format pdf,docx \
  --outdir ./output

# Smoke tests
npm run test-run       # tech-modern only
npm run test-run:all   # all three templates × both formats
```

### CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `-i, --input` | `./resume.json` | Path to resume JSON |
| `-t, --template` | `tech-modern` | Template id |
| `-f, --format` | `pdf,docx` | Comma-separated: `pdf`, `docx` |
| `-o, --outdir` | `./output` | Output directory |

### Output files

```
./output/{Full_Name}_CV_{templateId}.pdf
./output/{Full_Name}_CV_{templateId}.docx
```

## Resume data (planned shape)

High-level sections in `resume.json`:

- **`basics`** — name, title, contact, links, summary, optional **`image`** (path relative to the JSON file)
- **`euMetadata`** — work authorization, notice period, relocation, degree recognition
- **`skills`** — grouped keyword lists
- **`work`** — reverse-chronological roles with XYZ-style bullets
- **`education`**, **`languages`** (CEFR), **`projects`**

Full field contract and architecture live in [`PLAN.md`](./PLAN.md).

## Photo notes

- Set `basics.image` to a local path (e.g. `./assets/your-photo.jpg`).
- Paths resolve relative to the **input JSON directory**, so the resume + photo can travel together.
- PDF embeds via data URL; Word via native image run.
- If the path is missing, templates still generate without a photo (no crash).

## Project docs

- **[`PLAN.md`](./PLAN.md)** — architecture, file tree, implementation watchlist, verification checklist, approval gate.
- **This README** — product overview and intended usage.

## Approval

Implementation is **blocked** until you approve [`PLAN.md`](./PLAN.md). Reply with approval (and any plan tweaks) to start coding.

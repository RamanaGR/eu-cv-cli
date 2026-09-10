# EU CV CLI

TypeScript / Node.js CLI that converts resume JSON into **A4 PDF** and **Microsoft Word (`.docx`)** CVs for European tech hiring — EU Blue Card / relocation metadata, professional photo, and ATS-friendly layouts.

## Privacy (public repo)

This repository is public. **Do not commit real personal data.**

| Path | Committed? | Purpose |
|------|------------|---------|
| [`resume.json`](./resume.json) | Yes | Dummy sample only (`Alex Example`) |
| [`assets/sample-photo.jpg`](./assets/sample-photo.jpg) | Yes | Dummy placeholder headshot |
| `input/` | **No** (gitignored) | Your real resume + photo |
| `output/` | **No** (gitignored) | Generated PDFs / DOCXs |

Put your real files under `input/` (see [`input/README.md`](./input/README.md)):

```bash
npm run generate -- -i ./input/RamanaGangarao_resume.json -t tech-modern
```

## Features

- Strict **Zod** validation of resume data
- **3 pluggable templates** — generate **one at a time** (interactive menu or `-t`)
- **PDF** via Playwright + Handlebars HTML
- **DOCX** via the `docx` library (native Word, no title/date collisions)
- Optional headshot (`basics.image`, path relative to the JSON file)
- EU mobility banner (Blue Card, notice period, relocation, target cities)

## Requirements

- Node.js **≥ 18**
- Chromium for Playwright (one-time install)

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

Default input: [`resume.json`](./resume.json) (dummy data — safe for demos).

### Interactive (pick one template)

```bash
npm run generate
```

```
Select a template:

  1) tech-modern       Tech Modern
  2) classic-eu        Classic EU
  3) compact-sidebar   Compact Sidebar

Enter number (1-3) or template id:
```

### Pass a template directly

```bash
npm run generate -- -t tech-modern
npm run generate -- -t classic-eu
npm run generate -- -t compact-sidebar
```

### npm shortcuts

```bash
npm run generate:tech-modern
npm run generate:classic-eu
npm run generate:compact-sidebar
```

### Your private resume

```bash
npm run generate -- -i ./input/RamanaGangarao_resume.json -t tech-modern
npm run generate -- -i ./input/RamanaGangarao_resume.json -t classic-eu -f pdf
```

### Formats & output directory

```bash
# PDF only (dummy sample)
npm run generate -- -t classic-eu -f pdf

# Custom output folder
npm run generate -- -i ./input/RamanaGangarao_resume.json -t tech-modern -o ./output
```

### CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `-i, --input` | `./resume.json` | Path to resume JSON |
| `-t, --template` | *(interactive prompt)* | `tech-modern`, `classic-eu`, or `compact-sidebar` |
| `-f, --format` | `pdf,docx` | Comma-separated: `pdf`, `docx` |
| `-o, --outdir` | `./output` | Output directory (gitignored) |

```bash
npm run generate -- --help
```

### Output naming

```
./output/{Full_Name}_CV_{templateId}.pdf
./output/{Full_Name}_CV_{templateId}.docx
```

Example (dummy): `./output/Alex_Example_CV_tech-modern.pdf`

Only the selected template is generated (not all three).

## Templates

| ID | Layout | Photo | Best for |
|----|--------|-------|----------|
| `tech-modern` | Single-column, navy/charcoal | Circular, top-right | Modern SaaS / product roles |
| `classic-eu` | Formal single-column | Rectangular, top-left | DE/NL traditional ATS + human review |
| `compact-sidebar` | Two-column | Top of left sidebar | Dense senior / skills-heavy profiles |

## Resume JSON schema

| Section | Notes |
|---------|--------|
| `basics` | Name, label, contact, profiles, summary, optional `image` |
| `euMetadata` | `workAuthorization`, `noticePeriod`, `relocationReady`, `relocation`, `preferredLocations`, `degreeRecognition` |
| `skills` | Grouped keyword lists |
| `work` | Roles with dates, optional `summary`, XYZ-style `highlights` |
| `education` | Degrees, dates, score |
| `certifications` | Name, issuer, date |
| `languages` | CEFR / proficiency labels |
| `projects` | Description + keywords |

Empty or `"Present"` end dates render as **Present**. Photo paths resolve relative to the **JSON file directory**, not `cwd`. Missing photos skip embedding (no crash).

## Project layout

```
eu-cv-cli/
├── resume.json                 # dummy sample (safe to commit)
├── assets/sample-photo.jpg     # dummy placeholder photo
├── input/                      # YOUR real resume + photo (gitignored)
│   ├── README.md
│   ├── .gitkeep
│   ├── RamanaGangarao_resume.json   # local only
│   └── photo.jpg                    # local only
├── output/                     # generated files (gitignored)
├── package.json
├── PLAN.md
├── README.md
└── src/
    ├── cli.ts
    ├── schema/
    ├── core/
    ├── utils/
    └── templates/
```

## Stack

| Piece | Library |
|-------|---------|
| CLI | Commander |
| Validation | Zod |
| HTML | Handlebars |
| PDF | Playwright (Chromium) |
| Word | `docx` |

## Docs

- [`PLAN.md`](./PLAN.md) — architecture, watchlist, verification notes
- [`input/README.md`](./input/README.md) — where to keep private resume data

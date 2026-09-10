# Private input (gitignored)

Put your **real** resume and photo here. Nothing in this folder is committed.

```bash
# Example layout
input/
  resume.json      # your real CV data
  photo.jpg        # your headshot
```

Then generate:

```bash
npm run generate -- -i ./input/resume.json -t tech-modern
```

In your private JSON, set:

```json
"image": "./photo.jpg"
```

(Path is relative to the JSON file, so `./photo.jpg` resolves to `input/photo.jpg`.)

The public sample used by default is [`../resume.json`](../resume.json) with dummy data only.

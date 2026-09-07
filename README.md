# Evergreen Countdown

A lightweight, dynamic countdown system for GitHub profiles, portfolio pages, and standalone web experiences.

<div align="center">
  <img src="https://evergreen-countdown.vercel.app/api/countdown" alt="Live countdown to the next New Year" />
  <p><i>Live SVG countdown powered by a Vercel serverless function.</i></p>
</div>

## What it does

- **Dynamic SVG** — generates a live countdown suitable for GitHub profile READMEs and other embeds.
- **Standalone web experience** — a responsive countdown page with dark/light theme support.
- **Automatic rollover** — without a custom target, the API targets the next January 1.
- **Arbitrary targets** — provide a date/time or legacy target year through API query parameters.
- **Explicit timezones** — interpret timezone-less target dates in an IANA timezone.
- **No commit clutter** — countdown state is calculated at request/runtime instead of being committed back to the repository.

## Use the API

### Default GitHub README embed

```markdown
![Countdown](https://evergreen-countdown.vercel.app/api/countdown)
```

### Arbitrary date and time

```markdown
![Launch Countdown](https://evergreen-countdown.vercel.app/api/countdown?date=2030-06-15T18:30:00Z&label=LAUNCH&title=Product%20Launch&completion=Launch%20time%20has%20arrived.)
```

### Timezone-aware target

```markdown
![India Countdown](https://evergreen-countdown.vercel.app/api/countdown?date=2030-01-01T00:00:00&timezone=Asia%2FKolkata&label=NEW_YEAR)
```

### Legacy year syntax

```markdown
![Vision 2030](https://evergreen-countdown.vercel.app/api/countdown?year=2030&label=VISION_2030)
```

## API contract

Endpoint: `/api/countdown`

| Parameter | Required | Description | Example |
| --- | --- | --- | --- |
| `date` | No | Target date/time in `YYYY-MM-DDTHH:mm[:ss[.SSS]]`, optionally followed by `Z` or a numeric offset. | `2030-06-15T18:30:00Z` |
| `year` | No | Legacy target year. Used only when `date` is absent. | `2030` |
| `timezone` | No | IANA timezone used for timezone-less `date` values. Defaults to `UTC`. | `Asia/Kolkata` |
| `label` | No | Header label. Trimmed and limited to 60 characters. | `LAUNCH` |
| `title` | No | Completion-state title. Trimmed and limited to 80 characters. | `Product Launch` |
| `completion` | No | Completion-state message. Trimmed and limited to 120 characters. | `Launch time has arrived.` |

### Defaults and validation

- No `date` or `year` targets the next January 1.
- `date` takes precedence over `year` when both are supplied.
- Invalid `date` or `year` input returns HTTP `400` with a safe `Countdown unavailable` SVG instead of throwing a server error.
- Invalid `timezone` falls back to `UTC`.
- Text parameters are trimmed and length-bounded before SVG generation.
- SVG text is XML-escaped so query values cannot break the generated document.
- Expired targets render the configured completion state rather than negative time values.
- The response is explicitly served as SVG and marked `nosniff` for predictable Markdown embedding.
- Responses use short shared caching with stale-while-revalidate to balance live countdown freshness and CDN efficiency.

## Run the web experience

The repository contains a standalone HTML/CSS/JavaScript countdown page that can be hosted as a static site.

For GitHub Pages:

1. Enable GitHub Pages for the repository.
2. Select the branch and folder containing the site.
3. Open the generated Pages URL.

## Deploy the API

The API is implemented as a Vercel serverless function under `api/`.

To deploy your own instance:

1. Fork the repository.
2. Import the repository into Vercel.
3. Deploy using the existing `vercel.json` configuration.
4. Use your deployment URL for API embeds.

Deployment is intentionally manual; the repository does not require GitHub Actions for deployment or countdown generation.

## Tech stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **API:** Node.js serverless function
- **Hosting:** GitHub Pages and Vercel
- **SVG:** Server-generated dynamic SVG

## Project structure

```text
.
├── api/
│   └── countdown.js
├── index.html
├── script.js
├── style.css
└── vercel.json
```

## Roadmap

The project is being developed toward a reusable countdown platform with:

- Arbitrary target dates and times
- Explicit timezone handling
- Configurable completion states
- A hardened embeddable SVG API
- A more polished configuration experience
- Stronger accessibility and boundary-case coverage

See the [project epic](https://github.com/aaqib-hafeez-khan-in/Evergreen-Countdown/issues/1) for the broader roadmap and planned phases.

## Contributing

Found a bug or have an improvement in mind? Open an issue or submit a focused pull request.

Please keep changes small and focused, avoid unnecessary dependencies, and follow the repository's existing conventions.

## License

No license has currently been declared for this repository.

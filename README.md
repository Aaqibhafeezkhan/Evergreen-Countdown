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

## Architecture

Evergreen Countdown has two runtime surfaces that share the same countdown engine:

- **Static web app** — `index.html`, `style.css`, `config.js`, and `script.js` provide the GitHub Pages experience.
- **Shared engine** — `countdown-engine.js` centralizes target parsing, timezone handling, defaults, and remaining-time calculations.
- **Serverless API** — `api/countdown.js` generates the embeddable SVG response.
- **Vercel routing** — `vercel.json` exposes `/api/countdown` and `/api/countdown.svg` through the serverless function.

The repository intentionally has no build step and no GitHub Actions deployment workflow. The static site and API are deployed manually through their respective platforms.

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

## Run locally

The standalone web experience is plain HTML, CSS, and JavaScript and does not require a package manager or build tool.

From the repository root, start any static HTTP server. For example, with Python:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

Do not rely on opening `index.html` directly with a `file://` URL when verifying the application. A local HTTP server more closely matches the hosted static-site environment.

### Local API development

The API is a Vercel serverless function and is not executed by the static Python server. For API changes, deploy the repository to a Vercel project and verify the generated endpoint there, or use the Vercel CLI locally if it is already installed in your environment.

## Manual verification checklist

Before deployment, verify the following against the current branch:

1. Open the web experience and confirm the default countdown renders and updates every second.
2. Switch between dark and light themes, reload the page, and confirm the selected theme persists.
3. Configure an arbitrary future date/time and confirm the preview updates.
4. Use an IANA timezone such as `Asia/Kolkata` with a timezone-less target and confirm the displayed timezone is retained.
5. Configure a past target and confirm the stable completion state is shown instead of negative values.
6. Copy a share link, open it in a new browser session, and confirm the same configuration is restored.
7. Verify a generated API SVG with a normal target, an explicit timezone, and the legacy `year` parameter.
8. Verify an invalid API date returns the documented `400` response and safe fallback SVG.
9. Verify long or special-character text parameters remain readable and do not break the SVG.
10. Check the experience at desktop and mobile viewport sizes.
11. If `prefers-reduced-motion` is enabled, confirm non-essential animation is reduced or disabled.

## Deploy to GitHub Pages

The root of the repository is the static site. No build step is required.

1. Push the desired changes to `main`.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and the `/ (root)` folder.
5. Save the configuration and wait for GitHub Pages to publish the site.
6. Open the Pages URL shown by GitHub and verify the manual checklist above.

GitHub Pages hosts the static countdown experience. It does not execute `api/countdown.js` as a serverless function, so the dynamic SVG API should remain deployed through Vercel.

## Deploy the API to Vercel

The API is implemented as a Vercel serverless function under `api/` and the existing `vercel.json` provides the API rewrites.

1. Sign in to Vercel and create a new project.
2. Import the Evergreen Countdown Git repository.
3. Keep the repository root as the project root.
4. Deploy using the existing `vercel.json` configuration.
5. After deployment, verify `/api/countdown` and `/api/countdown.svg` on the generated Vercel domain.
6. Test at least one default request, one arbitrary-date request, one timezone-aware request, and one invalid-date request.
7. Use the deployed API URL in GitHub README embeds instead of relying on a repository-generated SVG artifact.

The repository does not require a framework, build command, or GitHub Actions workflow for this deployment path.

## Production URLs

Deployment URLs are environment-specific. Do not hard-code a Vercel or GitHub Pages domain into application logic.

After manual deployment, use:

```text
GitHub Pages: https://<owner>.github.io/<repository>/
Vercel API:   https://<deployment-domain>/api/countdown
SVG alias:    https://<deployment-domain>/api/countdown.svg
```

The repository README's live embed currently points at the project's Vercel deployment. If that deployment changes, update the example URL to the active deployment.

## Tech stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Shared engine:** Vanilla JavaScript
- **API:** Node.js serverless function
- **Hosting:** GitHub Pages and Vercel
- **SVG:** Server-generated dynamic SVG

## Project structure

```text
.
├── api/
│   └── countdown.js
├── config.js
├── countdown-engine.js
├── favicon.png
├── index.html
├── script.js
├── style.css
├── vercel.json
└── README.md
```

## Roadmap

The project is being developed toward a reusable countdown platform with:

- Arbitrary target dates and times
- Explicit timezone handling
- Configurable completion states
- A hardened embeddable SVG API
- A polished configuration experience
- Straightforward manual deployment and developer verification
- Stronger automated quality coverage

See the [project epic](https://github.com/aaqib-hafeez-khan-in/Evergreen-Countdown/issues/1) for the broader roadmap and planned phases.

## Contributing

Found a bug or have an improvement in mind? Open an issue or submit a focused pull request.

Please keep changes small and focused, avoid unnecessary dependencies, and follow the repository's existing conventions.

For local verification, follow the [Run locally](#run-locally) and [Manual verification checklist](#manual-verification-checklist) sections before opening a pull request.

## License

No license has currently been declared for this repository.

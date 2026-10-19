# HELIX GEO Access Check (GitHub Action)

A composite GitHub Action that checks whether AI crawlers can reach your site:
GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and others. If these crawlers
are blocked, your pages cannot be read or cited by AI answer engines.

The action calls the free HELIX access-check endpoint, writes a readable report
to the GitHub step summary, and can fail the job when the site blocks crawlers.
No API key is required.

## What it does

1. Sends a GET request to `https://helix.co.il/api/geo-access-check?url=<site>`.
2. Prints a report (result, blockers, per-signal table) to the job log and to
   the GitHub step summary.
3. Exits non-zero when the check does not pass and `fail-on-block` is `true`.

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `url` | yes | - | The site URL to check (for example `https://example.com` or `example.com`). |
| `fail-on-block` | no | `true` | When `true`, the job fails if the check does not pass. Set to `false` to report without failing. |

## Outputs

This action has no step outputs. The result is written to the job log and to the
GitHub step summary, and reflected in the job exit code.

## Example usage

```yaml
jobs:
  geo-access-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Run HELIX GEO Access Check
        uses: ./.github/actions/geo-access-check
        with:
          url: https://example.com
          fail-on-block: "true"
```

A full consumer workflow (push plus weekly schedule) is at
`.github/workflows/geo-access-check.example.yml`.

## Requirements

- Node 20 on the runner (`actions/setup-node@v4` with `node-version: "20"`).
- Network access to `https://helix.co.il`.

## Advanced

Set the `HELIX_GEO_BASE` environment variable on the step to point at a
different base URL (useful for testing). It defaults to `https://helix.co.il`.

---

Powered by HELIX - https://helix.co.il

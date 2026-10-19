# helix-geo

Command line tool for the HELIX GEO product. Two commands:

- `check` - a free check of whether AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, and others) can reach a site. No account
  needed.
- `audit` - a full GEO audit that returns a report link and headline numbers.
  Requires a HELIX API key.

Powered by HELIX - https://helix.co.il

## Install

No install needed, run it with `npx`:

```bash
npx helix-geo check example.com
```

Or install it globally:

```bash
npm install -g helix-geo
helix-geo check example.com
```

Requires Node 20 or newer.

## Commands

### check

```bash
helix-geo check <url>
```

Checks whether AI crawlers can reach the site and prints a readable summary
(result, blockers, per-signal status). Exits with code `1` if the site blocks
crawlers, which makes it easy to use in CI.

```bash
helix-geo check https://example.com
```

### audit

```bash
helix-geo audit <url> [--category <c>] [--max-usd <n>] [--json]
```

Runs a full GEO audit and prints the report link plus headline numbers such as
overall Share of Model and the presence band. Use `--json` to print the raw
response.

Options:

- `--category <c>` - business category hint for the audit.
- `--max-usd <n>` - cost cap in USD. The audit refuses to run past this amount
  and the CLI reports a clear message if the cap is hit.
- `--json` - print the raw JSON response instead of the formatted summary.

```bash
helix-geo audit example.com --category "fintech"
helix-geo audit example.com --max-usd 2 --json
```

## API key

The `audit` command needs an API key in the `HELIX_GEO_API_KEY` environment
variable. Get a key from https://helix.co.il.

macOS and Linux:

```bash
export HELIX_GEO_API_KEY="sk_your_key_here"
```

Windows (PowerShell, current session):

```powershell
$env:HELIX_GEO_API_KEY = "sk_your_key_here"
```

Windows (persisted for new shells):

```powershell
setx HELIX_GEO_API_KEY "sk_your_key_here"
```

The CLI handles the common failures clearly:

- Missing or invalid key returns `401` and the CLI explains the key is missing
  or invalid.
- A cost cap hit returns `402` and the CLI tells you to raise `--max-usd` or top
  up your account (exit code `2`).

## Environment variables

- `HELIX_GEO_API_KEY` - API key for the `audit` command.
- `HELIX_GEO_BASE` - override the base URL (default `https://helix.co.il`).
- `NO_COLOR` - set to disable colored output.

## Other

```bash
helix-geo --help
helix-geo --version
```

## License

Apache-2.0

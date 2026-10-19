#!/usr/bin/env node
// helix-geo CLI
// Thin client for the HELIX GEO product. Two commands:
//   check <url>          free AI-crawler access check, no auth
//   audit <url> [opts]   full GEO audit, requires HELIX_GEO_API_KEY
// Node 20 ESM, built-in fetch only, no runtime dependencies.
// Powered by HELIX (https://helix.co.il).

import process from "node:process";
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.HELIX_GEO_BASE || "https://helix.co.il";
const TIMEOUT_MS = 45000;

// ---------- small plain-text styling helpers (no deps) ----------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `[${code}m${text}[0m` : text);
const bold = (t) => paint("1", t);
const green = (t) => paint("32", t);
const red = (t) => paint("31", t);
const yellow = (t) => paint("33", t);
const dim = (t) => paint("2", t);

function mark(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pass" || s === "ok" || s === "true") return green("PASS");
  if (s === "warn" || s === "warning") return yellow("WARN");
  return red("FAIL");
}

// ---------- shared helpers ----------

function readVersion() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function normalizeUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function die(message, code = 1) {
  console.error(red(`Error: ${message}`));
  process.exit(code);
}

async function request(url, options) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    if (err && err.name === "TimeoutError") {
      die(`request timed out after ${TIMEOUT_MS / 1000}s. Check your network and try again.`);
    }
    die(`request failed: ${err && err.message ? err.message : String(err)}`);
  }
}

function printUsage() {
  console.log(`${bold("helix-geo")} - HELIX GEO command line tool

Usage:
  helix-geo check <url>                 Free AI-crawler access check (no auth)
  helix-geo audit <url> [options]       Full GEO audit (requires API key)
  helix-geo --help                      Show this help
  helix-geo --version                   Show version

check:
  Checks whether AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, and others) can reach the site. Exits 1 if blocked.

  Example:
    npx helix-geo check example.com

audit options:
  --category <c>        Business category hint for the audit
  --max-usd <n>         Cost cap in USD; the audit refuses to exceed it
  --json                Print the raw JSON response

  Requires the HELIX_GEO_API_KEY environment variable.

  Examples:
    export HELIX_GEO_API_KEY=sk_...        # macOS / Linux
    setx HELIX_GEO_API_KEY "sk_..."        # Windows (new shells)
    helix-geo audit example.com --category "fintech"
    helix-geo audit example.com --json

Environment:
  HELIX_GEO_API_KEY     API key for the audit command.
  HELIX_GEO_BASE        Override the base URL (default https://helix.co.il).

Powered by HELIX - https://helix.co.il`);
}

// ---------- commands ----------

async function cmdCheck(args) {
  const url = normalizeUrl(args[0]);
  if (!url) die("usage: helix-geo check <url>");

  const endpoint = `${BASE}/api/geo-access-check?url=${encodeURIComponent(url)}`;
  const res = await request(endpoint, { method: "GET", headers: { accept: "application/json" } });

  if (!res.ok) die(`endpoint returned HTTP ${res.status}.`);

  let data;
  try {
    data = await res.json();
  } catch {
    die("could not parse JSON from the endpoint.");
  }

  console.log("");
  console.log(bold("HELIX GEO Access Check"));
  console.log(`${dim("Site:")}   ${data.url || url}`);
  if (data.ladder) console.log(`${dim("Ladder:")} ${data.ladder}`);
  console.log(`${dim("Result:")} ${data.pass ? green("PASS - AI crawlers can reach the site") : red("FAIL - AI crawlers are blocked")}`);

  if (Array.isArray(data.blockers) && data.blockers.length > 0) {
    console.log("");
    console.log(bold("Blockers"));
    for (const b of data.blockers) console.log(`  ${red("-")} ${b}`);
  }

  if (Array.isArray(data.signals) && data.signals.length > 0) {
    console.log("");
    console.log(bold("Signals"));
    for (const sig of data.signals) {
      const label = sig.label || sig.key || "signal";
      const detail = sig.detail ? dim(` - ${sig.detail}`) : "";
      console.log(`  ${mark(sig.status)}  ${label}${detail}`);
    }
  }

  console.log("");
  console.log(dim("Powered by HELIX - https://helix.co.il"));
  console.log("");

  process.exit(data.pass ? 0 : 1);
}

async function cmdAudit(rest) {
  let parsed;
  try {
    parsed = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        category: { type: "string" },
        "max-usd": { type: "string" },
        json: { type: "boolean", default: false },
      },
    });
  } catch (err) {
    die(err && err.message ? err.message : "could not parse options.");
  }

  const url = normalizeUrl(parsed.positionals[0]);
  if (!url) die("usage: helix-geo audit <url> [--category <c>] [--max-usd <n>] [--json]");

  const apiKey = process.env.HELIX_GEO_API_KEY;
  if (!apiKey) {
    die("HELIX_GEO_API_KEY is not set. Get a key from https://helix.co.il and set it as an environment variable.");
  }

  const body = { url };
  if (parsed.values.category) body.category = parsed.values.category;
  if (parsed.values["max-usd"] !== undefined) {
    const n = Number(parsed.values["max-usd"]);
    if (!Number.isFinite(n) || n < 0) die("--max-usd must be a non-negative number.");
    body.maxUsd = n;
  }

  const endpoint = `${BASE}/api/v1/audit`;
  const res = await request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    die("unauthorized (401). Your HELIX_GEO_API_KEY is missing or invalid.");
  }
  if (res.status === 402) {
    let hint = "";
    try {
      const j = await res.json();
      if (j && j.estimate) hint = ` Estimated cost: ${j.estimate}.`;
    } catch {
      // ignore parse errors on the 402 body
    }
    die(`payment required / cost cap exceeded (402).${hint} Raise --max-usd or top up your account.`, 2);
  }
  if (!res.ok) {
    die(`audit failed with HTTP ${res.status}.`);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    die("could not parse JSON from the audit endpoint.");
  }

  if (parsed.values.json) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(data.ok === false ? 1 : 0);
  }

  const report = data.report || {};
  console.log("");
  console.log(bold("HELIX GEO Audit"));
  console.log(`${dim("Site:")}      ${data.url || url}`);
  if (data.token) console.log(`${dim("Token:")}     ${data.token}`);
  if (data.estimate) console.log(`${dim("Estimate:")}  ${data.estimate}`);

  const share = report.overallShareOfModel ?? report.shareOfModel;
  if (share !== undefined && share !== null) {
    console.log(`${dim("Share of Model:")} ${share}`);
  }
  if (report.presence || report.presenceBand) {
    console.log(`${dim("Presence:")}  ${report.presence || report.presenceBand}`);
  }

  // The report link is returned as `url` per the API contract; fall back to common names.
  const reportLink = data.reportUrl || data.report_link || (typeof data.report === "string" ? data.report : "") || data.url;
  if (reportLink) {
    console.log("");
    console.log(`${bold("Full report:")} ${reportLink}`);
  }

  console.log("");
  console.log(dim("Powered by HELIX - https://helix.co.il"));
  console.log("");

  process.exit(data.ok === false ? 1 : 0);
}

// ---------- entry ----------

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    printUsage();
    process.exit(0);
  }

  if (argv[0] === "--version" || argv[0] === "-v") {
    console.log(readVersion());
    process.exit(0);
  }

  const command = argv[0];
  const rest = argv.slice(1);

  switch (command) {
    case "check":
      await cmdCheck(rest);
      break;
    case "audit":
      await cmdAudit(rest);
      break;
    default:
      console.error(red(`Unknown command: ${command}`));
      console.error("Run 'helix-geo --help' for usage.");
      process.exit(1);
  }
}

main();

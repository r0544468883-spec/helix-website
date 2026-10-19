// HELIX GEO Access Check
// Calls the free HELIX access-check endpoint and writes a readable report to
// the GitHub step summary. Exits non-zero when the check does not pass and
// fail-on-block is 'true'. Node 20, built-in fetch only, no npm dependencies.
// Powered by HELIX (https://helix.co.il).

import { appendFileSync } from "node:fs";
import process from "node:process";

const BASE = process.env.HELIX_GEO_BASE || "https://helix.co.il";

function fail(message) {
  console.error(`HELIX GEO Access Check: ${message}`);
  process.exit(1);
}

function normalizeUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function statusMark(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pass" || s === "ok" || s === "true") return "PASS";
  if (s === "warn" || s === "warning") return "WARN";
  return "FAIL";
}

function summaryLines(data) {
  const lines = [];
  lines.push("## HELIX GEO Access Check");
  lines.push("");
  lines.push(`Site: \`${data.url || "unknown"}\``);
  if (data.ladder) lines.push(`Ladder: ${data.ladder}`);
  lines.push(`Result: ${data.pass ? "PASS - AI crawlers can reach the site" : "FAIL - AI crawlers are blocked"}`);
  lines.push("");

  if (Array.isArray(data.blockers) && data.blockers.length > 0) {
    lines.push("### Blockers");
    for (const b of data.blockers) lines.push(`- ${b}`);
    lines.push("");
  }

  if (Array.isArray(data.signals) && data.signals.length > 0) {
    lines.push("### Signals");
    lines.push("");
    lines.push("| Signal | Status | Detail |");
    lines.push("| --- | --- | --- |");
    for (const sig of data.signals) {
      const label = sig.label || sig.key || "signal";
      const detail = (sig.detail || "").replace(/\|/g, "\\|");
      lines.push(`| ${label} | ${statusMark(sig.status)} | ${detail} |`);
    }
    lines.push("");
  }

  lines.push("");
  lines.push("Powered by HELIX - https://helix.co.il");
  return lines.join("\n");
}

async function main() {
  const url = normalizeUrl(process.env.INPUT_URL);
  const failOnBlock = String(process.env.INPUT_FAIL_ON_BLOCK || "true").toLowerCase() !== "false";

  if (!url) fail("input 'url' is required.");

  const endpoint = `${BASE}/api/geo-access-check?url=${encodeURIComponent(url)}`;

  let res;
  try {
    res = await fetch(endpoint, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    fail(`request failed: ${err && err.message ? err.message : String(err)}`);
    return;
  }

  if (!res.ok) {
    fail(`endpoint returned HTTP ${res.status}.`);
    return;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    fail("could not parse JSON from the endpoint.");
    return;
  }

  const report = summaryLines(data);

  // Console output for the live log.
  console.log(report);

  // GitHub step summary.
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    try {
      appendFileSync(summaryPath, `${report}\n`);
    } catch (err) {
      console.error(`Could not write step summary: ${err && err.message ? err.message : String(err)}`);
    }
  }

  if (!data.pass && failOnBlock) {
    console.error("GEO access check did not pass and fail-on-block is true. Failing the job.");
    process.exit(1);
  }

  process.exit(0);
}

main();

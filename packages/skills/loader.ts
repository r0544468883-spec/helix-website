// ============================================================
// HELIX Skill Loader — progressive disclosure (Deno-runnable)
// ------------------------------------------------------------
// Ties the three layers of the HELIX skill system together:
//   LAYER 1 (operative)  : the short always-on text injected into every
//                          agent prompt. Source of truth for runtime =
//                          `_shared/ai-kit/skills/registry.ts` (vendored
//                          per repo). Cheap, always loaded.
//   LAYER 2 (reference)  : the full deep `<name>/SKILL.md` in THIS folder.
//                          Loaded ON DEMAND only, when an agent needs more
//                          than the operative rules (progressive disclosure).
//   LAYER 3 (executable) : deterministic checkers in `_scripts/` an agent
//                          runs instead of guessing (lint, validate, calc).
//
// This loader needs filesystem access, so it runs where an agent has it
// (Skills-API sandbox, dev, or a server-side agent with Read). Deployed
// edge/product runtimes keep using Layer 1 only.
// ============================================================

const HERE = new URL(".", import.meta.url).pathname;
// On Windows the pathname starts with a leading slash; strip it.
const ROOT = HERE.replace(/^\/([A-Za-z]:)/, "$1");

/** Skills that ship a deterministic script in _scripts/. */
export const SKILL_SCRIPTS: Record<string, string[]> = {
  "helix-brand-voice": ["_scripts/brand-voice-lint.ts"],
  "cold-outreach-copy": ["_scripts/spam-check.ts"],
  "social-engagement": ["_scripts/spam-check.ts"],
  "finance-metrics": ["_scripts/finance-calc.ts"],
  "paid-ads": ["_scripts/paid-ads-significance.ts"],
  "seo-geo-pack": ["_scripts/seo-schema-validate.ts"],
  "accessibility-a11y": ["_scripts/a11y-static-check.ts"],
  "comms-storytelling": ["_scripts/text-readability.ts"],
};

/** List every capability skill (a folder holding a SKILL.md), excluding
 *  the tooling folders (_scripts, _evals) and non-runtime packs. */
export async function listSkills(): Promise<string[]> {
  const out: string[] = [];
  for await (const entry of Deno.readDir(ROOT)) {
    if (!entry.isDirectory) continue;
    if (entry.name.startsWith("_")) continue;
    try {
      await Deno.stat(`${ROOT}${entry.name}/SKILL.md`);
      out.push(entry.name);
    } catch {
      // no SKILL.md at top level (e.g. a pack folder) - skip
    }
  }
  return out.sort();
}

/** Load the full deep reference (Layer 2) for a skill. Returns null if absent. */
export async function getReference(name: string): Promise<string | null> {
  try {
    return await Deno.readTextFile(`${ROOT}${name}/SKILL.md`);
  } catch {
    return null;
  }
}

/** Pull a single "## Heading" section out of a skill's SKILL.md, so an agent
 *  can disclose just the part it needs (e.g. the decision table) instead of
 *  the whole file. Case-insensitive heading match. */
export async function getReferenceSection(
  name: string,
  heading: string,
): Promise<string | null> {
  const md = await getReference(name);
  if (!md) return null;
  const lines = md.split("\n");
  const start = lines.findIndex(
    (l) => /^#{1,4}\s/.test(l) && l.toLowerCase().includes(heading.toLowerCase()),
  );
  if (start < 0) return null;
  const level = (lines[start].match(/^#+/) || ["#"])[0].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^#+/);
    if (m && m[0].length <= level) { end = i; break; }
  }
  return lines.slice(start, end).join("\n").trim();
}

/** The scripts (Layer 3) registered for a skill, as absolute paths. */
export function scriptsFor(name: string): string[] {
  return (SKILL_SCRIPTS[name] || []).map((p) => `${ROOT}${p}`);
}

// CLI: `deno run --allow-read loader.ts [skill] [heading]`
if (import.meta.main) {
  const [name, heading] = Deno.args;
  if (!name) {
    const skills = await listSkills();
    console.log(`HELIX skills (${skills.length}):`);
    for (const s of skills) {
      const scripts = SKILL_SCRIPTS[s]?.length ? `  [scripts: ${SKILL_SCRIPTS[s].length}]` : "";
      console.log(`  - ${s}${scripts}`);
    }
  } else if (heading) {
    console.log((await getReferenceSection(name, heading)) ?? `(no section "${heading}" in ${name})`);
  } else {
    console.log((await getReference(name)) ?? `(no SKILL.md for ${name})`);
  }
}

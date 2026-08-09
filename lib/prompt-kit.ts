// HELIX shared structured-prompt scaffold — the `@helix/prompts` convention.
// Ported from the PromptForge structure (promptforge.click): every system prompt
// is built from role → inputs → workflow → hard constraints → output contract.
// This makes model output more consistent and easier to review across products.
// See PRODUCTS/PROMPTFORGE-ANALYSIS.md. Use buildSystemPrompt() instead of
// hand-concatenating strings so every HELIX prompt shares the same skeleton.

export type PromptSpec = {
  /** The expert role, one sentence. e.g. "אתה קופירייטר סושיאל ישראלי מהשורה הראשונה". */
  role: string;
  /** Named inputs the user message will provide (rendered as a checklist for the model). */
  inputs?: string[];
  /** Ordered steps the model should follow. */
  workflow?: string[];
  /** Hard rules — things the model must never do / must always do. */
  constraints?: string[];
  /** The exact required output. Usually a literal JSON shape; kept verbatim so parsers stay valid. */
  outputContract: string;
  /** Section labels language. Defaults to Hebrew (HELIX is Hebrew-first). */
  lang?: 'he' | 'en';
};

const L = {
  he: { inputs: 'קלט', workflow: 'שלבים', constraints: 'כללים קשיחים', output: 'פורמט הפלט (חובה)' },
  en: { inputs: 'Inputs', workflow: 'Workflow', constraints: 'Hard rules', output: 'Output contract (required)' },
} as const;

const numbered = (items: string[]) => items.map((s, i) => `${i + 1}. ${s}`).join('\n');
const bulleted = (items: string[]) => items.map((s) => `- ${s}`).join('\n');

// Assemble a structured system prompt. Only non-empty sections are emitted, so a
// minimal spec (role + outputContract) still produces a clean prompt.
export function buildSystemPrompt(spec: PromptSpec): string {
  const t = L[spec.lang ?? 'he'];
  const parts: string[] = [spec.role.trim()];
  if (spec.inputs?.length) parts.push(`${t.inputs}:\n${bulleted(spec.inputs)}`);
  if (spec.workflow?.length) parts.push(`${t.workflow}:\n${numbered(spec.workflow)}`);
  if (spec.constraints?.length) parts.push(`${t.constraints}:\n${bulleted(spec.constraints)}`);
  parts.push(`${t.output}:\n${spec.outputContract.trim()}`);
  return parts.join('\n\n');
}

// HELIX CHIEF — the orchestrator. A manual Claude tool-use loop that plans over
// the entitled agents, dispatches their tools, and gates every write/outbound
// action through the autonomy switch. This is the "Maestro" of the ecosystem.

import Anthropic from '@anthropic-ai/sdk';
import { clean } from '@/lib/clean-text';
import type { AutonomyMode } from '@/lib/autonomy/types';
import type { ChiefContext, ChiefRun, ChiefAction, HelixAgent, AgentTool } from './types';
import { entitledAgents } from './agents';

const MODEL = 'claude-opus-4-8';
const MAX_ITERS = 6;

const SYSTEM = `אתה HELIX CHIEF — המתזמר של מערכת HELIX. אתה מדבר עברית, ישיר ותכליתי.
יש לך צוות סוכנים (CRM, Outreach ועוד) שכל אחד חושף כלים. כשמבקשים ממך משהו:
- פרק לכמה צעדים והפעל את הכלים הנכונים בעצמך; אל תשאל אישור על פעולות קריאה.
- פעולות כתיבה/שליחה כפופות ל"מתג האוטונומיה": ייתכן שכלי יחזיר שהפעולה "ממתינה לאישור" או "הוצעה בלבד" — במקרה כזה אל תנסה שוב, פשוט דווח למשתמש בבירור מה בוצע, מה ממתין לאישור, ומה הצעת.
- בסיום, סכם בקצרה בעברית: מה מצאת, מה עשית, ומה הצעד הבא.`;

function toolKey(agentId: string, toolName: string) {
  return `${agentId}__${toolName}`;
}

/** מגדיר את כלי-Claude מתוך הסוכנים המורשים. */
function buildTools(agents: HelixAgent[]): Anthropic.Tool[] {
  const tools: Anthropic.Tool[] = [];
  for (const a of agents) {
    for (const t of a.tools) {
      tools.push({
        name: toolKey(a.id, t.name),
        description: `[${a.label}] ${t.description}`,
        input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
      });
    }
  }
  return tools;
}

/** מריץ כלי אחד עם שער entitlement + autonomy. מחזיר (result-למודל, רשומת-פעולה). */
async function dispatch(
  agent: HelixAgent,
  tool: AgentTool,
  input: Record<string, unknown>,
  ctx: ChiefContext,
): Promise<{ toModel: unknown; action: ChiefAction }> {
  const base: ChiefAction = { agent: agent.id, tool: tool.name, input, status: 'done' };

  // read — רץ תמיד
  if (tool.autonomyClass === 'read') {
    try {
      const result = await tool.run(input, ctx);
      return { toModel: result, action: { ...base, status: 'done', result } };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'error';
      return { toModel: { error }, action: { ...base, status: 'error', error } };
    }
  }

  // כתיבה/חוץ — דרך מתג האוטונומיה
  const mode: AutonomyMode = tool.featureKey ? await ctx.resolveAutonomy(tool.featureKey) : 'approve';

  if (mode === 'advisor') {
    return {
      toModel: { queued: false, mode, note: 'advisor mode — הפעולה הוצעה בלבד ולא בוצעה. הצג אותה למשתמש כהמלצה.' },
      action: { ...base, status: 'suggested', autonomy: mode },
    };
  }
  if (mode === 'approve') {
    return {
      toModel: { queued: true, mode, note: 'approve mode — הפעולה נוספה לתור האישורים ותבוצע אחרי אישור המשתמש. אל תנסה שוב.' },
      action: { ...base, status: 'pending_approval', autonomy: mode },
    };
  }
  // autopilot — מבצע
  try {
    const result = await tool.run(input, ctx);
    return { toModel: result, action: { ...base, status: 'done', autonomy: mode, result } };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'error';
    return { toModel: { error }, action: { ...base, status: 'error', autonomy: mode, error } };
  }
}

export async function runChief(userInput: string, ctx: ChiefContext): Promise<ChiefRun> {
  const client = new Anthropic(); // ANTHROPIC_API_KEY מהסביבה
  const agents = await entitledAgents(ctx);
  const tools = buildTools(agents);

  // מפה: tool-key → (agent, tool)
  const lookup = new Map<string, { agent: HelixAgent; tool: AgentTool }>();
  for (const a of agents) for (const t of a.tools) lookup.set(toolKey(a.id, t.name), { agent: a, tool: t });

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userInput }];
  const actions: ChiefAction[] = [];
  let inTok = 0;
  let outTok = 0;

  for (let i = 0; i < MAX_ITERS; i++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: SYSTEM,
      tools,
      messages,
    });
    inTok += res.usage.input_tokens;
    outTok += res.usage.output_tokens;
    messages.push({ role: 'assistant', content: res.content });

    if (res.stop_reason !== 'tool_use') {
      const reply = clean(
        res.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('\n')
          .trim(),
      );
      return { reply, actions, usage: { input_tokens: inTok, output_tokens: outTok } };
    }

    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const found = lookup.get(tu.name);
      if (!found) {
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: 'unknown tool', is_error: true });
        actions.push({ agent: '?', tool: tu.name, input: {}, status: 'error', error: 'unknown tool' });
        continue;
      }
      const { toModel, action } = await dispatch(found.agent, found.tool, (tu.input as Record<string, unknown>) ?? {}, ctx);
      actions.push(action);
      results.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(toModel),
        is_error: action.status === 'error',
      });
    }
    messages.push({ role: 'user', content: results });
  }

  return {
    reply: 'עצרתי אחרי מספר צעדים כדי לא להיתקע. הנה מה שהספקתי — תגיד לי איך להמשיך.',
    actions,
    usage: { input_tokens: inTok, output_tokens: outTok },
  };
}

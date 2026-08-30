'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
  Handle, Position, type Node, type Edge, type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  NODE_SPECS, TRIGGER_LABELS, type Graph, type NodeKind, type TriggerKind,
} from '@/lib/automations/types';
import { autoSave, autoToggle, autoTestRun, autoFromPrompt } from '@/app/automations-actions';

type NodeData = { kind: NodeKind; config: Record<string, unknown> };
type RFNode = Node<NodeData>;

// ── custom nodes ──────────────────────────────────────────────────────────
function TriggerNode({ data }: { data: NodeData }) {
  const trg = String(data.config?.trigger ?? 'contact.created') as TriggerKind;
  return (
    <div className="rounded-xl bg-brand text-bg px-4 py-2 shadow font-bold text-[13px] min-w-[120px] text-center">
      ⚡ {TRIGGER_LABELS[trg] ?? trg}
      <Handle type="source" position={Position.Right} className="!bg-bg" />
    </div>
  );
}
function StepNode({ data, selected }: { data: NodeData; selected: boolean }) {
  const spec = NODE_SPECS[data.kind as Exclude<NodeKind, 'trigger'>];
  const summary = spec?.fields?.map((f) => data.config?.[f.key]).filter(Boolean).join(' · ');
  return (
    <div className={`rounded-xl bg-surface border px-4 py-2 shadow text-[13px] min-w-[130px] ${selected ? 'border-brand' : 'border-border'}`}>
      <Handle type="target" position={Position.Left} className="!bg-ink-muted" />
      <div className="font-bold text-ink">{spec?.label ?? data.kind}</div>
      {summary ? <div className="text-ink-muted text-[11px] truncate max-w-[150px]">{summary}</div> : spec?.needsConnection ? <div className="text-yellow-500 text-[10px]">דורש חיבור ערוץ</div> : null}
      {spec?.branching ? (
        <>
          <Handle id="true" type="source" position={Position.Right} style={{ top: '35%' }} className="!bg-brand" />
          <Handle id="false" type="source" position={Position.Right} style={{ top: '70%' }} className="!bg-red-500" />
        </>
      ) : (
        <Handle type="source" position={Position.Right} className="!bg-ink-muted" />
      )}
    </div>
  );
}
const nodeTypes = { trigger: TriggerNode, step: StepNode };

// ── graph <-> react-flow conversion ─────────────────────────────────────────
function toRF(graph: Graph): { nodes: RFNode[]; edges: Edge[] } {
  const nodes = graph.nodes.map((n) => ({
    id: n.id, position: n.position,
    type: n.kind === 'trigger' ? 'trigger' : 'step',
    data: { kind: n.kind, config: n.kind === 'trigger' ? n.data : (n.data ?? {}) } as NodeData,
  }));
  const edges = graph.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? null }));
  return { nodes, edges };
}
function fromRF(nodes: RFNode[], edges: Edge[]): Graph {
  return {
    nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, position: n.position, data: n.data.config })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? null })),
  };
}

const PALETTE: Exclude<NodeKind, 'trigger'>[] = ['enrich', 'score', 'condition', 'create_task', 'log_activity', 'send_whatsapp', 'send_email', 'wait', 'n8n'];

export default function AutomationBuilder({
  locale, id, initialName, initialTrigger, initialGraph,
}: { locale: string; id: string; initialName: string; initialTrigger: TriggerKind; initialGraph: Graph }) {
  const router = useRouter();
  const init = useMemo(() => toRF(initialGraph), [initialGraph]);
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>(init.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(init.edges);
  const [name, setName] = useState(initialName);
  const [trigger, setTrigger] = useState<TriggerKind>(initialTrigger);
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState<string>('');
  const [log, setLog] = useState<string[] | null>(null);
  const [prompt, setPrompt] = useState('');

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, id: `e${Date.now()}` }, eds)), [setEdges]);

  function addNode(kind: Exclude<NodeKind, 'trigger'>) {
    const nid = `${kind}_${Date.now().toString(36)}`;
    const x = 260 + (nodes.length % 4) * 210;
    const y = 80 + Math.floor(nodes.length / 4) * 130;
    setNodes((ns) => [...ns, { id: nid, type: 'step', position: { x, y }, data: { kind, config: {} } }]);
  }

  const selected = nodes.find((n) => n.id === sel);
  const selSpec = selected && selected.data.kind !== 'trigger' ? NODE_SPECS[selected.data.kind as Exclude<NodeKind, 'trigger'>] : null;

  function updateConfig(key: string, value: unknown) {
    setNodes((ns) => ns.map((n) => n.id === sel ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } } : n));
  }
  function deleteSelected() {
    if (!sel || sel === 'trigger') return;
    setNodes((ns) => ns.filter((n) => n.id !== sel));
    setEdges((es) => es.filter((e) => e.source !== sel && e.target !== sel));
    setSel(null);
  }

  async function save() {
    setBusy('save');
    await autoSave({ locale, id, name, trigger, graph: fromRF(nodes, edges) });
    setBusy('');
  }
  async function toggle(on: boolean) {
    setBusy('toggle');
    await save();
    await autoToggle({ locale, id, enabled: on });
    setBusy(''); router.refresh();
  }
  async function test() {
    setBusy('test'); setLog(null);
    const res = await autoTestRun({ id, graph: fromRF(nodes, edges), trigger });
    setBusy('');
    if (!res.ok) { setLog([res.error === 'no-contact' ? 'אין אנשי קשר לבדיקה — הוסף ליד קודם' : `שגיאה: ${res.error}`]); return; }
    setLog([`נבדק על: ${res.contactName}`, ...res.result.log.map((s) => `• ${s.result}`)]);
  }
  async function build() {
    if (!prompt.trim()) return;
    setBusy('ai');
    const res = await autoFromPrompt({ prompt, trigger });
    setBusy('');
    if (!res.ok) { setLog([res.error === 'no-key' ? 'בונה ה-AI דורש ANTHROPIC_API_KEY' : `בנייה נכשלה: ${res.error}`]); return; }
    const rf = toRF(res.graph); setNodes(rf.nodes); setEdges(rf.edges); setPrompt('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* toolbar */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-border bg-bg/60">
        <input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-1.5 text-[14px] font-semibold" dir="auto" />
        <select value={trigger} onChange={(e) => setTrigger(e.target.value as TriggerKind)} className="bg-surface border border-border rounded-lg px-3 py-1.5 text-[13px]">
          {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>טריגר: {v}</option>)}
        </select>
        <button onClick={save} disabled={!!busy} className="bg-brand text-bg font-bold px-4 py-1.5 rounded-lg text-[13px] disabled:opacity-50">{busy === 'save' ? '...' : 'שמור'}</button>
        <button onClick={() => toggle(true)} disabled={!!busy} className="border border-brand text-brand font-semibold px-3 py-1.5 rounded-lg text-[13px]">הפעל</button>
        <button onClick={() => toggle(false)} disabled={!!busy} className="border border-border text-ink-secondary px-3 py-1.5 rounded-lg text-[13px]">כבה</button>
        <button onClick={test} disabled={!!busy} className="border border-border text-ink-secondary px-3 py-1.5 rounded-lg text-[13px]">{busy === 'test' ? 'בודק...' : 'בדיקה'}</button>
      </div>

      {/* verbal builder */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface/40">
        <span className="text-[12px] text-ink-muted shrink-0">בנה מטקסט:</span>
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="למשל: כשנכנס ליד, העשר אותו, נקד, ואם הניקוד מעל 70 צור משימה"
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-[13px]" dir="auto" onKeyDown={(e) => e.key === 'Enter' && build()} />
        <button onClick={build} disabled={!!busy} className="bg-brand/15 text-brand font-semibold px-3 py-1.5 rounded-lg text-[13px] disabled:opacity-50">{busy === 'ai' ? '...' : '✨ בנה'}</button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* palette */}
        <div className="w-40 border-e border-border p-2 flex flex-col gap-1.5 overflow-auto shrink-0">
          <div className="text-[11px] text-ink-muted px-1 mb-1">גרור פעולה</div>
          {PALETTE.map((k) => (
            <button key={k} onClick={() => addNode(k)} className="text-start text-[13px] bg-surface border border-border rounded-lg px-2.5 py-1.5 hover:border-brand transition-colors">
              {NODE_SPECS[k].label}
            </button>
          ))}
        </div>

        {/* canvas */}
        <div className="flex-1 min-w-0">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSel(n.id)} onPaneClick={() => setSel(null)}
            fitView proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable className="!bg-surface" />
          </ReactFlow>
        </div>

        {/* config / log panel */}
        <div className="w-64 border-s border-border p-3 overflow-auto shrink-0">
          {selSpec ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[14px]">{selSpec.label}</h3>
                <button onClick={deleteSelected} className="text-red-500 text-[12px]">מחק</button>
              </div>
              <p className="text-ink-muted text-[11px] mb-3">{selSpec.hint}</p>
              {selSpec.fields?.map((f) => (
                <label key={f.key} className="block mb-2.5">
                  <span className="text-[12px] text-ink-secondary">{f.label}</span>
                  {f.type === 'select' ? (
                    <select value={String(selected?.data.config?.[f.key] ?? '')} onChange={(e) => updateConfig(f.key, e.target.value)} className="w-full mt-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-[13px]">
                      <option value="">—</option>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type === 'number' ? 'number' : 'text'} value={String(selected?.data.config?.[f.key] ?? '')} onChange={(e) => updateConfig(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full mt-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-[13px]" dir="auto" />
                  )}
                </label>
              ))}
              {selSpec.needsConnection && <p className="text-yellow-500 text-[11px] mt-2">פועל רק לאחר חיבור ערוץ מתאים.</p>}
            </div>
          ) : log ? (
            <div>
              <h3 className="font-bold text-[14px] mb-2">תוצאת בדיקה</h3>
              <div className="flex flex-col gap-1 text-[12px] text-ink-secondary">{log.map((l, i) => <div key={i} dir="auto">{l}</div>)}</div>
            </div>
          ) : (
            <p className="text-ink-muted text-[12px]">בחר צומת לעריכה, או הרץ בדיקה.</p>
          )}
        </div>
      </div>
    </div>
  );
}

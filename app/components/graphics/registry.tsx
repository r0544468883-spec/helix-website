import type { FC } from 'react';
import AdStamp1885 from '../AdStamp1885';
import { ChiefWink, AutonomyToggle } from './characters';
import { PriceReveal, IcpBullseye, AttributionThreads, SignalVsBuzz } from './bars-group';
import { LeakyBucket, ViralSpread, MarketGate } from './area-group';
import { OcrScan, PlgKey, BeachheadFlag, BudgetPipes } from './misc-a';
import { GearsTalk, RobotToHuman, SieveCoins, BlueprintSeal, LoopVsFunnel, LeadAutofill } from './misc-b';
import { AgentSymphony } from './agent-symphony';
import { FirstMonthFreeCard } from './first-month-free';

/** slug → bespoke card graphic. Articles not listed fall back to ArticleChart. */
export const ARTICLE_GRAPHICS: Record<string, FC> = {
  'first-month-free-does-it-work': FirstMonthFreeCard,
  'agent-symphony-hallucinations': AgentSymphony,
  'rule-of-seven-growth-hacking': AdStamp1885,
  'helix-chief-agent': ChiefWink,
  'agentic-ai-layer': AutonomyToggle,
  'transparent-pricing': PriceReveal,
  'icp-target-audience': IcpBullseye,
  'attribution-explained': AttributionThreads,
  'ai-marketing-tools': SignalVsBuzz,
  'cohort-retention': LeakyBucket,
  'viral-loop': ViralSpread,
  'gtm-israel': MarketGate,
  'hebrew-ocr': OcrScan,
  'plg-small-business': PlgKey,
  'beachhead-market': BeachheadFlag,
  'budget-loop': BudgetPipes,
  'dev-and-marketer-not-talking': GearsTalk,
  'ai-content-human': RobotToHuman,
  'reading-a-campaign': SieveCoins,
  'project-spec-guide': BlueprintSeal,
  'marketing-loop-vs-funnel': LoopVsFunnel,
  'ai-agents-bd': LeadAutofill,
};

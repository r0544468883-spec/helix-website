// Shared layout for every free-guide landing page. Loads the guide styles once
// so each guide page (/guides/*) is just content, no per-page CSS.
import './guides.css';

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

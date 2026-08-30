# HELIX Agency Skill Pack 🔐

5 סקילי-סוכן מותאמות ל-HELIX, מבוססות על ה-Outloop Agency Skill Pack ([outloop.co](https://outloop.co))
אבל מותאמות ל**ארכיטקטורת הסוכנים** של HELIX ול**מתג-האוטונומיה** (advisor→approve→autopilot).

## ההבדל מ-Outloop
Outloop עוצרים ב-**Propose** (read-only, detection/draft בלבד) ומוכרים פלטפורמה שסוגרת את השאר.
אצל HELIX כל סקיל בנויה על אותה משמעת read-only/detection, אבל:
- **סוכנים בשם** (עמנואל/ליה/דן/אלון/מאיה/נעמי) במקום "agent" גנרי.
- **מתג-אוטונומיה 3-מצבי** במקום "human approves everything" בינארי — כולל autopilot מגודר.
- **מבקר ייעודי** (אלון) חותם לפני כל מעבר-שלב.
- **write-back לזיכרון משותף** — הסקילים לומדים בין סבבים.
- **פלט RTL עברית** + מוסכמת EmojiIcon (בלי אמוג'ים גולמיים).
- **workspace-scoping ברמת context** + קרדנציאלס מחוץ ל-context של המודל.

## הסקילים ← מיפוי מוצר
| Skill | מוצר HELIX | מקור Outloop |
|---|---|---|
| `ops-creative-fatigue-scanner` | OPS | creative-fatigue-signal-scanner |
| `ops-ads-waste-auditor` | OPS | google-ads-waste-search-terms-auditor |
| `dashboards-client-report-drafter` | Dashboards | weekly-client-report-drafter |
| `chief-drive-hygiene-auditor` | CHIEF | drive-asset-hygiene-auditor |
| `chief-task-hygiene-scanner` | CHIEF | pm-task-hygiene-scanner |

## קשור
- [[AGENT-PERMISSIONS]] — מודל ההרשאות שכל סקיל מכבד.
- [[OUTLOOP-VS-HELIX-PERMISSIONS]] — השוואת מודל-הבטיחות המלאה + הפערים שנסגרו כאן.
- [[autonomy-switch-program]] · [[intra-department-agents-architecture]]

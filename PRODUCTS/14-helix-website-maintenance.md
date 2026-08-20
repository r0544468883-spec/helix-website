# 14 · HELIX WEBSITE MAINTENANCE — מרכז בקרת-תחזוקה לאתרים ולחנויות

> **שם המוצר:** HELIX WEBSITE MAINTENANCE (System Chief פנימי מכונה "השומר / Warden").
> **סטטוס:** אפיון v1 (2026-08-17). מקור: אודיט אמיתי — עינת נתיב / achambha.co.il.
> **product_stage:** discovery (רץ דרך AI-SHIPR).

---

## 1. המשפט האחד
סוכן-תחזוקה אוטונומי שמנטר, מזהה **ומתקן** בעיות באתר/חנות WooCommerce — לרוחב 21 מנועי בדיקה — כולל מנוע ייחודי ל**דריפט-תוכן חוצה-דפים** ו**שומר-רווחיות**, מדורג באוטונומיה (advisor → approve → autopilot), בעברית ו-RTL, כחלק מסוויט HELIX.

## 2. הבידול (מול מפת השוק, אוגוסט 2026)
השוק מקוטע: WP Umbrella/ManageWP (תשתית רב-אתרית), Visualping/Hexowatch (change-detection), WooSentinel/Sitewatch (ניטור צ'ק-אאוט), Mistakes Finder ($29/שנה, נתוני-מוצר). **אף אחד** לא עושה: (א) דריפט-תוכן חוצה-דפים, (ב) all-in-one לבעל-חנות **בודד** (לא סוכנות), (ג) עברית/RTL + נגישות ת"י 5568. בישראל = שירות ידני בלבד (WeManage/Digitizer, ₪200-450/חודש) — עוגן תמחור.
> נקודת-אימות: ל-WooSentinel כבר יש "Revenue Watch" + "AI Action Queue" (alert+approve, **לא** auto-fix עיוור). זה **מאמת** את דגם ה-Autonomy Switch שלנו. Mistakes Finder עושה auto-fix עיוור = מסוכן. הסוויט-ספוט (אישור פר-פעולה + Critic לפני apply) פנוי.

## 3. עשרים-ואחד המנועים
כל מנוע = **Team** במחלקה (ראו §4). חפיפה עם מוצרי HELIX אחרים **מותרת** (החלטת משתמש 2026-08-17) — בונים מנוע משלנו, לא רק משבצים מבחוץ.

| # | מנוע | מזהה | מתקן (Maker) | גל |
|---|---|---|---|---|
| 1 | **דריפט-תוכן** (חוצה-דפים) | מחיר/משלוח/מדיניות זהים בכל דף · NAP (שם/כתובת/טלפון/שעות) · תקנון בגרסה אחת · קופון-מול-חוק · טל'/מייל/וואטסאפ אחידים | מסמן את מקור-האמת ומיישר את כל המופעים | **MVP** |
| 2 | **לינקים ומבנה** | 404 פנימי/חיצוני · שרשראות רידיירקט · דפים כפולים/יתומים · תפריט ריק · mixed-content · sitemap/robots · CTA שבור | תיקון/הסרת לינק, מיזוג דף כפול | **MVP** |
| 3 | **מוניטור שגיאות** | PHP warnings/fatals/deprecations · JS console · 500/404 · קונפליקט תוסף · `WP_DEBUG` דלוק בפרוד · כשל webhook/API · SSL/DNS · wp-cron | patch/דיווח מדורג, כיבוי debug | **MVP** |
| 4 | **שלמות מסחר** | תמונה/מחיר/SKU/תיאור/קטגוריה חסר · מלאי-סותר · כיסוי related/upsell · **רכישת-בדק סינתטית** · חישוב עגלה/מע"מ · אזור-משלוח בלי שיטה · מיילי-הזמנה | auto-fill defaults · יצירת related לפי לוגיקה | **MVP** |
| 5 | **תאימות + מובייל** | נגישות ת"י 5568/WCAG · הצהרה תקפה+מתוארכת · גלישה אופקית · tap-target 44px · RTL · חוקיות עוגיות (הסכמה לפני טעינה) | תיקוני CSS/ARIA, יצירת הצהרה | **MVP** |
| 6 | **Revenue Guard** 💰 | דליפות-מרווח (משלוח מתחת לעלות) · מנופי-הכנסה כבויים (upsell/כללי-תמחור/נטישת-עגלה/סקר) · חוסמי-המרה · drop-off במשפך · סף משלוח-חינם · סיגנלי-אמון | הפעלת מנוף, כוונון סף, התראת אפס-מכירות | **MVP** (כותרת מסחרית) |
| 7 | **גיבוי ושחזור** | גיבוי קיים? רץ? off-site? **ניתן-לשחזור בפועל** (test-restore) | הרצת גיבוי, התראה | **MVP** (רשת-ביטחון) |
| 8 | ניהול עדכונים | מצב עדכוני plugin/theme/core · **safe-update + rollback** · תאימות לפני דחיפה | עדכון-בטוח + גיבוי-לפני | P2 |
| 9 | ביצועים/CWV | LCP/CLS/INP · משקל תמונות · cache · זמן-תגובה | דחיסת תמונה, המלצת cache | P2 (חופף Growth-Doctor) |
| 10 | Uptime/זמינות | up? ממספר אזורים · קודי-סטטוס · תפוגת SSL | התראה/escalation | P2 |
| 11 | טפסים + Deliverability | טפסי-לידים נשלחים · SPF/DKIM/DMARC · מיילים לא-בספאם | תיקון DNS records, בדיקת-שליחה | P2 |
| 12 | אבטחה | malware · תוספים פגיעים · הקשחת-login · spam | הסרה/עדכון/חסימה | P2 (חופף HELIX Guard) |
| 13 | SEO טכני | sitemap · schema-drift · indexability · meta | תיקון schema/meta | P2 (חופף helix-rank) |
| 14 | **רגרסיה ויזואלית** | screenshot-diff בין ריצות / אחרי עדכון — "האם משהו נשבר?" | rollback/התראה + baseline חדש | P2 (משלים #8 — הג'וב מס' 1 של תחזוקה) |
| 15 | **רעננות תוכן** (staleness) | שנה ישנה בפוטר · מבצע שפג · באנר-חג תקוע · "בקרוב" שלא הגיע | עדכון/הסרה | P2 (ראינו סוג-כזה) |
| 16 | **תקינות אנליטיקס ומעקב** | GA4/GTM/Meta-Pixel/תגי-המרה יורים · consent-gated · אירועי e-commerce (purchase/add_to_cart) | התראה/תיקון תג | P2 |
| 17 | **בריאות סקריפטים צד-ג'** | ווידג'טים/APIs חיצוניים ש-404 או מאטים | הסרה/דיווח | P2 (**מצאנו אצל אצ'מבה** — 404 ads-agent) |
| 18 | **תוקף דומיין/DNS** | תפוגת דומיין · שינויי DNS · MX | התראה/escalation | P2 |
| 19 | מוניטין/ביקורות/trust | Trustindex · Google Business · ניהול ביקורות | הצגת badge/תזכורת-מענה | P2 (חופף reputation-agent 05) |
| 20 | לוקליזציה/i18n | שלמות תרגום · hreflang · פורמטי מטבע/תאריך | השלמת תרגום | P2 |
| 21 | עלות/בזבוז אחסון | resource usage · תוספים מיותרים · CDN/bandwidth | המלצת-אופטימיזציה | P2 (חופף #9/Growth-Doctor) |

**הרחבות שקופלו לתוך מנועים קיימים (sub-checks, לא מנוע נפרד):**
- **#4 מסחר** += מלאי ומילוי (מכירת-יתר, drift מלאי, דיוק תעריפי-מוביל).
- **#5 תאימות** += חשבונית-מס ותאימות צרכנית (IL) — **מואט מקומי**.
- **#9 ביצועים** += בריאות DB (bloat/transients/revisions/autoload) + היגיינת מדיה (תמונות יתומות/ענקיות/WebP).
- **#11 טפסים** += תקינות תבניות מייל (אישור-הזמנה/משלוח — לא רק deliverability).

**MVP = מנועים 1-7.** P2 = 8-21.

> **המלצת-חיבור (cross-sell) — בוט ה-SEO/GEO שלנו (HELIX Rank):** מנוע #13 מכסה **SEO טכני בלבד** (sitemap, schema-drift, meta, canonical) — "האם משהו שהיה תקין נשבר". הוא **לא** עושה קידום-תוכן, GEO/AEO, מעקב-ציטוטים במנועי-AI, או Share-of-Voice — כל אלה שייכים ל-**HELIX Rank**. לכן: כל לקוח Website Maintenance מקבל **המלצה מובנית** (בדוח, באיזור-האישי וב-UI של הדשבורד) לחבר גם את **HELIX Rank** כדי לסגור את הפער בין "אתר בריא" ל"אתר שגם מקודם ומצוטט". החיבור דו-כיווני: כשמנוע #13 מזהה schema/meta שבור הוא מפנה ל-Rank, וכש-Rank מזהה דף שלא נאסף/לא מצוטט הוא יכול לפתוח משימת-תיקון-תוכן. ההמלצה מופיעה כ-banner קבוע בדשבורד הסריקה.

## 4. ארכיטקטורת האייג'נטים (על גבי §4b — החוקה)
המוצר הוא **System** אחד עם **System Chief** ("**השומר / The Warden**"), שמתחתיו **21 Teams** (מנוע = Team, Team Chief לכל אחד), ובכל Team ארבעת ה-archetypes. פרקטלי בדיוק כמו שאר מוצרי HELIX — לא black box (3 הכללים: Visibility / Capability / Command-modes מ-§4b חלים).

```
HELIX CHIEF
   └─► System Chief: "השומר" (Website-Maintenance Warden)
         ├─► Team Chief: דריפט-תוכן   ─► [Scanner · Fixer · Critic]
         ├─► Team Chief: שלמות-מסחר   ─► [Scanner · Fixer · Critic]
         ├─► Team Chief: Revenue Guard ─► [Scanner · Fixer · Critic]
         └─► ... (21 מנועים)
         ── סוכנים חוצי-מחלקה (משרתים את כל ה-Teams) ──
            Prioritizer · Verifier · Compliance · Learner · Scheduler · Escalation
```

**ארבעת ה-archetypes בכל Team (מיפוי §4b למונחי-תחזוקה):**
1. **Scanner** (=Researcher/Scout) — סורק/מגשש את האתר בתחום המנוע, מחזיר **עובדות-שטח** בלבד (למשל: "מחיר משלוח בדף X=₪43.66, בעגלה=₪29"). בלי דעה.
2. **Fixer** (=Maker/Doer) — מייצר את **התיקון** (diff/patch/תוכן חדש). כאן ה"סיכון הגנרטיבי" — כי הוא נוגע באתר חי.
3. **Critic** (=Adversary) — **תוקף** את הממצא ואת התיקון: (א) האם הבאג אמיתי או false-positive? (ב) האם התיקון בטוח — לא ישבור את הפרוד? **זה השער לפני כל apply באוטופיילוט.** ← זה בדיוק ה"fit אמיתי ל-Critic" מהחוקה: Maker גנרטיבי + מוטציה על אתר חי = סיכון → אימות אדוורסרי חובה (לא theater).
4. **Team Chief** — מתזמר, מחליט fast/team, ה-single-interface היחיד כלפי השומר.

**סוכנים חוצי-מחלקה (role vocabulary מהחוקה):**
- **Prioritizer** — מדרג את כל הממצאים מכל 13 המנועים לפי **impact רווחי/חומרה** (דליפת-מרווח > באג אסתטי). מפיק את ה"תור-הפעולות".
- **Verifier** — **אחרי apply**: סורק-מחדש לוודא שהתיקון עבד ולא יצר רגרסיה (re-crawl).
- **Compliance** — שער משפטי (נגישות ת"י / פרטיות) לפני שמסמנים "תקין".
- **Learner** — זוכר אילו תיקונים עבדו / דפוסי false-positive → מפחית רעש לאורך זמן (writeback ל-CRM/state).
- **Scheduler** — קצב הסריקות. **Escalation** — מתי להעביר לאדם.

**hybrid fast/team:** בדיקה פשוטה (uptime, לינק בודד) → fast-path Scanner יחיד. תיקון מורכב (דריפט, related-products, patch) → team מלא Scanner→Fixer→Critic.

**פריסת קוד (אחיד, §4b):**
```
lib/agents/website-maintenance/
  contract.ts            // Agent Contract (מיובא מ-@helix/agents)
  department-chief.ts    // "השומר" — System Chief
  teams/
    drift/{team-chief,scanner,fixer,critic}.ts
    commerce/{...}
    revenue/{...}
    ... (13)
  roles/{prioritizer,verifier,compliance,learner,scheduler,escalation}.ts
  memory.ts              // SharedMemory → writeback ל-CRM
```
> משתמשים ב-`@helix/agents` (`DepartmentChief`+`contract`) הקיים כ-primitive מיובא, לא מועתק.

## 5. Autonomy Switch (מתלבש על התוכנית הקיימת)
כל **פעולה** (לא רק מוצר) עוברת דרך choke-point אחד `runAction()` עם `resolveMode()` fail-safe (downgrade-only):
- **advisor** (ברירת-מחדל בטוחה) — רק מזהה ומדווח. אפס שינוי באתר.
- **approve / HITL** — Fixer מכין diff, נכנס ל**תור-אישור**, אדם מאשר ✓ לפני apply.
- **autopilot** — מיישם אוטומטית, **אבל רק אם ה-Critic עבר**. מאחורי `risk_ack` לכל פעולה שנוגעת ב**כסף / מוטציה על פרוד / מחיקה** (דוגמה: כיבוי מנוף-תמחור, שינוי מחיר-משלוח, מחיקת דף כפול).
- שקיפות: כל apply נכתב ל-audit-log + Verifier מריץ re-crawl. rollback זמין (במיוחד מנוע #8).
- UI: `AutonomySwitch.tsx` הנייד (3-mode segmented + risk_ack) — פר-מנוע scope (`scope_id = engine`), כמו הגרסה ה-site-scoped של Rank.

**מתג גלובלי אחד על כל הכלים (בנוי — commit 3f223a3):** משתמש קובע **מתג אחד** (`global`) שמושל בכל 21 המנועים, עם override אופציונלי פר-מנוע. הרזולוציה **שכבתית ו-downgrade-only**:
`effective = min(override ?? global, class-ceiling)` ואז **שער risk_ack**.
מחלקת-הסיכון של כל מנוע (§12) היא **תקרה שהמתג הגלובלי לא יכול לפרוץ** — כך `global=autopilot` עדיין:
- 🟥 alert-only (שגיאות/אבטחה/uptime/אנליטיקס) → נחסם ל-**advisor** (לעולם לא כותב אוטומטית קוד).
- 🟦 external (דומיין/מוניטין) → נחסם ל-**approve**.
- 🟧 gated → autopilot **רק** עם risk_ack, אחרת approve.
- 🟩 safe-auto → autopilot.
קוד: `lib/autonomy/{engines.ts (רجיסטרי+RiskClass), resolve.ts (resolveForEngine/resolveAll)}`, endpoint `POST /api/autonomy` שמראה את הפריסה על כל המנועים, ו-apply route מגודר פר-מנוע. אומת ב-smoke.

## 6. אינטגרציית CHIEF (המוצר לא black-box)
- **Visibility:** CHIEF רואה את כל 21 ה-Teams, הממצאים, ונימוקי ה-Critic (ל-Dashboards/פיקוח).
- **Capability:** CHIEF יכול לדבר לכל רמה — השומר, Team-Chief, או סוכן-עלה ("תשאל את ה-Critic של דריפט למה פסל את התיקון").
- **Command modes:** אורקסטרציה → דרך השומר; שאלת-סוכן-בודד → ישירות (מצב לגיטימי). **חובה:** כל פנייה-ישירה כותבת חזרה ל-CRM/state כדי שהצ'יפים לא יעבדו על תמונה מיושנת.
- **Cross-product:** חושף `POST /api/act/trigger` (x-cross-act-secret) כמו שאר המוצרים — Dashboards יכול לנתב "אתר-לקוח מדמם" לשומר; השומר מפעיל את ה-switch שלו-עצמו.

## 7. אינטגרציה עם WooCommerce — Companion-Plugin + Crawl (החלטת משתמש)
דגם **היברידי**: תוסף-WP קטן (companion) לגישה עמוקה **בשילוב** סריקה חיצונית.
- **Companion plugin** (מותקן אצל הלקוח) — REST + webhooks; נותן למה שסריקה חיצונית לא רואה: **שגיאות PHP**, מצב **מלאי/הזמנות**, **סטטוס גיבוי**, גרסאות plugin/theme/core, שערי-תשלום, wp-cron. מזין את מנועים 3/4/7/8/12.
- **External crawler** (headless, RTL/מובייל-aware) — מה שגולש רואה: דריפט-תוכן, לינקים, נגישות, CWV, גלישה אופקית, פופאפים, רכישת-בדק סינתטית. מזין 1/2/5/6/9/10.
- שכבת-fusion מאחדת את שני המקורות ל-`findings` אחיד. Plugin אופציונלי — בלעדיו המוצר עדיין רץ ב-crawl-only (מנועי-פנים מושבתים בחן).

## 8. 15 הבאגים של אצ'מבה = test-cases (traceability)
| באג | מנוע | Scanner מוצא | Critic מאמת | Fixer |
|---|---|---|---|---|
| משלוח ₪43.66≠₪29 | 1+6 | פער-מחיר בין דף לעגלה | דליפת-מרווח אמיתית | יישור + התראת-מרווח |
| נקודות-איסוף 4≠3 | 1 | פער-רשימה | לא false-positive | יישור |
| 2 דפי "אודות" | 2 | דף כפול בתפריט | לא כוונה | מיזוג/הסרה |
| לינק כפול בפוטר · פוטר ריק | 2 | dup/empty nav | — | תיקון |
| שדות עמוד-חשבון שבורים | 3 | PHP warning בשדה | reproduce | patch תבנית |
| סליקת סאמיט | 3+6 | fatal ב-checkout | חוסם-המרה | patch + התראה |
| 0 מוצרים קשורים | 4+6 | אין related | מנוף-AOV כבוי | יצירה לפי לוגיקה |
| מצב-קטלוג | 4 | add-to-cart מוסתר | מודע-הקשר | דיווח |
| הצהרת-נגישות | 5 | לא-ת"י | חשיפה משפטית | יצירת הצהרה |
| גלישה אופקית מובייל | 5 | widget>viewport | reproduce מובייל | תיקון CSS |
| פופאפ תפוצה בסתר | 6 | fires מיד | פוגע-במשפך | frequency-cap |
| גיבויים באופק | 7 | אין גיבוי חודשים | קריטי | הרצה + התראה |

## 9. תמחור (מול עוגן ₪200-450 ידני; לפי מחירי-תוכנות)
- **Free scan (wedge / lead-magnet — parked):** דף-נחיתה יחיד שסורק אתר (crawl-only) ומחזיר דוח בעיות + gate-מייל. **החלטת משתמש 2026-08-17: נשמר בצד כמגנט-הלידים של המוצר — נבנה אחרי ה-MVP, לא עכשיו.** (כמו OPS free-scan / BarBot score-as-lead-magnet.) מזהה, לא מתקן.
- **Advisor** — ניטור+דיווח שוטף. ~₪149/חודש.
- **Approve** — + תור-תיקונים לאישור. ~₪349/חודש (מול השירות הידני).
- **Autopilot** — + תיקון-אוטומטי עם Critic. ~₪690/חודש (מחליף שעות-אדם).
> מספרים TBD מול doc התמחור (3 מחלקות-ערך). ה-Revenue Guard מצדיק ROI ("מצא ₪X דליפת-מרווח").

## 10. MVP ובניית-הדרגה (דגם Rank-first)
בונים **גנרי קודם** (החלטת משתמש — לא אצ'מבה כשותפה בלעדית; אצ'מבה = test-suite). בונים **מנוע-מנוע** (department מלא לכל אחד לפני הבא), כמו שנבנו 5 המוצרים:
1. **דריפט-תוכן (#1)** — הוֶודג' הייחודי + הבקשה המפורשת של עינת. בונים Scanner→Fixer→Critic מלא.
2. **מוניטור-שגיאות (#3) + שלמות-מסחר (#4)** — מכסים את הבאגים הקריטיים.
3. **Revenue Guard (#6)** — הכותרת המסחרית.
4. **תאימות+מובייל (#5) · לינקים (#2) · גיבוי (#7)** — משלימים את ה-MVP.
5. Free-scan wedge + דף-מוצר + Autonomy UI.
אחרי MVP → P2 (8-13).

## 11. החלטות (סגורות 2026-08-17)
- ✅ **שם:** HELIX WEBSITE MAINTENANCE.
- ✅ **אינטגרציה:** Companion-plugin + crawl היברידי (§7).
- ✅ **Design-partner:** בונים **גנרי קודם**; אצ'מבה = test-suite, לא שותפה בלעדית.
- ✅ **AI-SHIPR:** כן — האפיון רץ ב-product_stage: discovery, לחלץ hypotheses/initiatives.
- ✅ **פלטפורמה:** standalone Next.js (כמו שאר מוצרי HELIX), repo משלו, origin=r0544468883-spec. **החלטת משתמש 2026-08-17: פותחים את המוצר עכשיו (ביקוש ידוע), מתחילים ממנוע הדריפט #1.**
- [ ] slug סופי בדף-המוצר.

## 12. פירוט כל 21 המנועים (Scanner · זיהוי · Fixer · מחלקת-אוטונומיה)
מחלקות-אוטונומיה (קובעות מה מותר לתקן אוטומטית):
- 🟩 **safe-auto** — autopilot מותר (תוכן/מטא הפיך, סיכון נמוך).
- 🟧 **gated** — autopilot דורש `risk_ack` (כסף / מחיקה / מוטציה על פרוד).
- 🟥 **alert-only** — **לא** מתקנים אוטומטית (קוד/אבטחה/תשתית) → זיהוי + התראה / פתיחת-משימה.
- 🟦 **external/approve** — פעולה חיצונית (DNS, מענה-לביקורת) → approve ומעלה, לא autopilot.

**#1 דריפט-תוכן** 🟧 — *Scanner:* מחלץ עובדות קנוניות מכל עמוד. *זיהוי:* קיבוץ עובדות → יותר מערך אחד לאותה עובדה. *Fixer:* מקור-אמת + עריכות יישור (בנוי). *סיכון:* מחיר שגוי כמקור-אמת.

**#2 לינקים ומבנה** 🟧 — *Scanner:* מפה כל הלינקים/דפים/פריטי-תפריט + סטטוס-HTTP. *זיהוי:* 404, שרשרת/לולאת-redirect, דף כפול, פריט-תפריט ריק, mixed-content, sitemap/robots שבורים. *Fixer:* תיקון/הסרת לינק, 301, unpublish/מיזוג דף כפול. *סיכון:* מחיקת דף לא-נכון → gated.

**#3 מוניטור שגיאות** 🟥 — *Scanner:* לוקח שגיאות PHP/JS/console (דרך ה-plugin) + סטטוס-HTTP + SSL. *זיהוי:* fatal/warning/deprecation, 500, `WP_DEBUG` דלוק בפרוד, כשל webhook, wp-cron תקוע. *Fixer:* **בעיקר alert-only** — כיבוי `WP_DEBUG` הוא היחיד שבטוח-אוטומטי; באג-קוד = משימה למפתח.

**#4 שלמות מסחר** 🟧 — *Scanner:* מוצרים, וריאציות, מלאי, אזורי-משלוח, רכישת-בדק סינתטית. *זיהוי:* תמונה/מחיר/SKU/תיאור חסר, מלאי-סותר, אזור בלי שיטת-משלוח, כשל-checkout, **מכירת-יתר / drift-מלאי**. *Fixer:* auto-fill defaults, תיקון וריאציה. *סיכון:* שינוי מחיר/מלאי → gated.

**#5 תאימות + מובייל** 🟧 — *Scanner:* סריקת-נגישות (contrast/alt/aria/focus), viewport/tap-target/overflow, RTL, באנר-עוגיות, **חשבונית-מס + גילויי-חובה צרכניים (IL)**. *זיהוי:* פרות WCAG/ת"י, גלישה אופקית, הסכמה-אחרי-טעינה, הצהרת-נגישות חסרה/לא-מתוארכת. *Fixer:* תיקוני ARIA/CSS, יצירת הצהרה. *חוקי → Compliance role מאשר.*

**#6 Revenue Guard** 🟧 — *Scanner:* מחירים מול עלויות, מנופי-הכנסה (upsell/כללי-תמחור/נטישה/סקר), משפך. *זיהוי:* משלוח מתחת-לעלות, מנוף כבוי, drop-off חריג, סף משלוח-חינם לא-אופטימלי. *Fixer:* הפעלת מנוף, כוונון סף, התראת-אפס-מכירות. *כל שינוי-כסף → gated.*

**#7 גיבוי ושחזור** 🟩 — *Scanner:* מתי גובה לאחרונה, off-site?, **test-restore**. *זיהוי:* אין גיבוי X ימים, גיבוי לא-שחזיר. *Fixer:* הרצת גיבוי (בטוח-אוטומטי) + התראה. *הרשת-ביטחון של כל השאר.*

**#8 ניהול עדכונים** 🟧 — *Scanner:* גרסאות plugin/theme/core + changelog + תאימות. *זיהוי:* עדכון ממתין, פער-אבטחה, אי-תאימות. *Fixer:* **גיבוי-לפני → עדכון → מנוע #14 מצלם → אם נשבר rollback**. *gated (מוטציית-פרוד).*

**#9 ביצועים/CWV** 🟩 — *Scanner:* LCP/CLS/INP, משקל-דף, **DB (bloat/transients/revisions/autoload)**, **מדיה (יתומה/ענקית/פורמט-ישן)**. *זיהוי:* CWV חורג, DB נפוח, תמונה כבדה. *Fixer:* דחיסה/WebP, ניקוי-transients, lazy-load. *ניקוי-DB מחיקתי → gated.*

**#10 Uptime/זמינות** 🟥 — *Scanner:* ping ממספר אזורים, קוד-סטטוס, תפוגת-SSL. *זיהוי:* down, 5xx, SSL פג בקרוב. *Fixer:* alert-only + escalation (אין תיקון-עצמי לתשתית).

**#11 טפסים + Deliverability** 🟧 — *Scanner:* submit-בדק לטפסים, SPF/DKIM/DMARC, **תבניות מייל טרנזקציוני (אישור/משלוח)**. *זיהוי:* טופס שבור, DNS-מייל חסר, תבנית שבורה/לא-ממותגת. *Fixer:* תיקון תבנית (safe), רשומות-DNS → 🟦 approve.

**#12 אבטחה** 🟥 — *Scanner:* גרסאות פגיעות, malware-scan, חשבונות-admin, הקשחת-login, spam. *זיהוי:* CVE, קובץ-חשוד, admin-רדום, סיסמה-חלשה. *Fixer:* **alert-only ברירת-מחדל** (עדכון-אבטחה → דרך #8); חסימת-IP/הסרת-spam אפשריים gated.

**#13 SEO טכני** 🟩 — *Scanner:* sitemap, schema/JSON-LD, canonical, indexability, meta. *זיהוי:* schema-drift, noindex בטעות, meta כפול/חסר, canonical שבור. *Fixer:* תיקון schema/meta/canonical. *(תוכן-SEO נשאר ב-helix-rank.)*

**#14 רגרסיה ויזואלית** 🟧 — *Scanner:* צילום עמודי-מפתח (headless) → diff מול baseline. *זיהוי:* שינוי-פיקסלים חריג (אלמנט נעלם/זז/חופף) — במיוחד **אחרי עדכון (#8)**. *Fixer:* התראה + הצעת-rollback ל-#8; אימות baseline חדש = 🟩. *הג'וב מס' 1 של תחזוקה.*

**#15 רעננות תוכן** 🟩 — *Scanner:* תאריכים/שנים, מבצעים עם דד-ליין, באנרים עונתיים, "בקרוב". *זיהוי:* שנה שעברה, מבצע שפג, באנר-חג אחרי המועד, "בקרוב" ישן. *Fixer:* עדכון-שנה, הסרת-מבצע-פג, ארכוב-באנר. *safe-auto (תוכן).*

**#16 תקינות אנליטיקס** 🟥 — *Scanner:* טעינת GA4/GTM/Pixel, ירי-אירועים (purchase/add_to_cart), גדר-הסכמה, כפילויות. *זיהוי:* תג לא-נטען, אירוע-המרה לא-יורה, ירי-לפני-הסכמה, ספירה-כפולה. *Fixer:* **alert-only** (תיקון-תג נוגע בקוד/GTM — משימה); דיווח מדויק מה נשבר.

**#17 סקריפטים צד-ג'** 🟧 — *Scanner:* כל בקשה חיצונית (script/API/font/widget) + סטטוס + זמן. *זיהוי:* 404/שגיאה חיצונית (**כמו ה-ads-agent של אצ'מבה**), סקריפט-איטי חוסם-רינדור. *Fixer:* הסרת/דחיית-סקריפט מת. *הסרה → gated.*

**#18 תוקף דומיין/DNS** 🟦 — *Scanner:* WHOIS-תפוגה, רשומות-DNS, MX, nameservers. *זיהוי:* דומיין פג בקרוב, DNS-drift, MX חסר. *Fixer:* **alert-only/approve** (חידוש-דומיין ושינוי-DNS = פעולה חיצונית קריטית, לעולם לא autopilot).

**#19 מוניטין/ביקורות** 🟦 — *Scanner:* ביקורות חדשות (Google/Trustindex), נוכחות-badge, Google Business. *זיהוי:* ביקורת שלילית ללא-מענה, badge חסר, פרטים לא-מסונכרנים. *Fixer:* טיוטת-מענה (approve), הצגת-badge. *(חופף reputation-agent 05 — לצרוך ממנו אם קיים.)*

**#20 לוקליזציה/i18n** 🟩 — *Scanner:* שלמות-תרגום, hreflang, פורמטי מטבע/תאריך/מספר per-locale. *זיהוי:* מחרוזת לא-מתורגמת, hreflang שבור, פורמט-שגוי. *Fixer:* השלמת-תרגום (safe, אך תרגום → Critic-שפה מאשר).

**#21 עלות/בזבוז** 🟩 — *Scanner:* resource-usage, תוספים פעילים-מיותרים, bandwidth/CDN. *זיהוי:* תוסף כבד-לא-בשימוש, מדיה-bandwidth מבוזבז, over-provisioning. *Fixer:* המלצת-אופטימיזציה (advisor ברוב המקרים). *(חופף #9/Growth-Doctor.)*

**סיכום מחלקות:** 🟩 safe-auto: 7,9,13,15,20,21 (+baseline של 14) · 🟧 gated: 1,2,4,5,6,8,14,17 · 🟥 alert-only: 3,10,12,16 · 🟦 external/approve: 11(DNS),18,19. **תובנה:** רק ~8 מנועים מתקנים באמת אוטומטית; השאר מזהים+מתריעים — וזה בסדר, כי חלק גדול מהערך הוא *הראייה*, לא רק היד.

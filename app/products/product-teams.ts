// The HELIX Agent Cast per product (source: PRODUCTS/HELIX-AGENT-CAST.md).
// One recurring cast — עמנואל(Researcher) · דן(Maker) · אלון(Critic) · מאיה(Editor) ·
// ליה(Analyst) · נעמי(Scheduler/Ops) · CHIEF — each "wearing that product's hat".
// Framing: a team that works FOR you (never "replace humans"); אלון the Critic is
// the trust anchor no competitor sells.

export interface TeamMember {
  name: string; // Hebrew given name (the recurring character)
  role: string; // what they are on THIS product
  line: string; // one-line "what I do here"
  emoji: string; // avatar icon
}

const CHIEF: TeamMember = { name: 'CHIEF', role: 'המנהל', line: 'אני מתאם בין הצוות ומחליט מי עושה מה.', emoji: '🧠' };

export const TEAMS: Record<string, TeamMember[]> = {
  'website-maintenance': [
    { name: 'עמנואל', role: 'הסורק', line: 'אני עובר על האתר ומחזיר עובדות-שטח: מה נשבר, איפה, ובאיזה עמוד.', emoji: '🔎' },
    { name: 'ליה', role: 'המדרגת', line: 'אני מדרגת כל ממצא לפי הפגיעה בכסף — מה שמדמם, ראשון.', emoji: '📊' },
    { name: 'דן', role: 'המתקן', line: 'אני מכין את התיקון הקונקרטי, מוכן להחלה עם גיבוי.', emoji: '🛠️' },
    { name: 'אלון', role: 'המבקר שפוסל', line: 'אני פוסל ממצא-שווא ותיקון מסוכן לפני שנוגעים באתר החי.', emoji: '🔴' },
    { name: 'מאיה', role: 'המאמתת', line: 'אני סורקת מחדש אחרי כל תיקון — ואם משהו נשבר, משחזרת.', emoji: '↩️' },
    CHIEF,
  ],
  geo: [
    { name: 'עמנואל', role: 'חוקר מילים', line: 'אני מוצא את המילים והישויות, ובודק חפיפה לדפים שכבר יש לכם.', emoji: '🔎' },
    { name: 'דן', role: 'הכתב', line: 'אני כותב את המאמר עצמו.', emoji: '✍️' },
    { name: 'אלון', role: 'העורך שפוסל', line: 'אני פוסל טענה לא-מדויקת, קניבליזציה, ותוכן ש-AI לא יצטט.', emoji: '🔴' },
    { name: 'מאיה', role: 'העורכת', line: 'אני משכתבת לפי אלון עד שהמאמר מושלם.', emoji: '🛠️' },
    CHIEF,
  ],
  'growth-doctor': [
    { name: 'ליה', role: 'האנליסטית', line: 'אני בודקת אם הנשירה מובהקת או סתם רעש.', emoji: '📊' },
    { name: 'דן', role: 'כותב התיקון', line: 'אני מנסח את ההמלצה הקונקרטית לתיקון.', emoji: '✍️' },
    { name: 'אלון', role: 'מבקר הביצוע', line: 'אני עוצר תיקון שמבוסס על אבחון חלש לפני שהוא רץ.', emoji: '🔴' },
    { name: 'מאיה', role: 'העורכת', line: 'אני מחדדת את ההמלצה שתתאים לשורש.', emoji: '🛠️' },
    CHIEF,
  ],
  'marketing-ops': [
    { name: 'עמנואל', role: 'חוקר ההקשר', line: 'אני קורא את הפוסט לפני שמגיבים, ומסמן אם הוא רגיש.', emoji: '🔎' },
    { name: 'דן', role: 'כותב התגובה', line: 'אני מנסח את התגובה בקול המותג.', emoji: '✍️' },
    { name: 'אלון', role: 'מבקר brand-safety', line: 'אני פוסל תגובה ספאמית, מענה-DM לא-הולם, והזזת-תקציב מסוכנת.', emoji: '🔴' },
    { name: 'מאיה', role: 'העורכת', line: 'אני משכתבת את התגובה לפי אלון.', emoji: '🛠️' },
    CHIEF,
  ],
  sdr: [
    { name: 'עמנואל', role: 'ההעשרה', line: 'אני אוסף את המידע על הליד ממקורות פומביים.', emoji: '🔎' },
    { name: 'ליה', role: 'מאמתת המקור', line: 'אני מצליבה כל נתון מול המקור, כדי שלא תפנו עם עובדה שגויה.', emoji: '📊' },
    { name: 'דן', role: 'הכתב', line: 'אני מנסח את הפנייה האישית.', emoji: '✍️' },
    { name: 'מאיה', role: 'העורכת', line: 'אני משכתבת עד שזה נשמע אנושי ולא רובוטי.', emoji: '🛠️' },
    { name: 'אלון', role: 'מבקר השליחה', line: 'אני בודק כל פנייה לפני שהיא יוצאת בשמכם, כולל שלא תיפול לספאם.', emoji: '🔴' },
    { name: 'נעמי', role: 'הרכזת', line: 'אני קובעת מי שווה לפנות אליו, ואיזה פולואפ לשלוח.', emoji: '📅' },
    CHIEF,
  ],
  shop: [
    { name: 'עמנואל', role: 'מומחה המוצר', line: 'אני שולף מהקטלוג עובדות בלבד — מוצר, מחיר, מלאי.', emoji: '🔎' },
    { name: 'דן', role: 'המוכר', line: 'אני עונה ללקוח, ממליץ ומוסיף לעגלה.', emoji: '✍️' },
    { name: 'אלון', role: 'בודק העובדות', line: 'אני מוודא שכל מחיר ומלאי בתשובה באמת קיימים לפני שליחה.', emoji: '🔴' },
    CHIEF,
  ],
  meeting: [
    { name: 'עמנואל', role: 'מחלץ ההתחייבויות', line: 'אני מוציא מהתמליל את ההבטחות, כל אחת עם ציטוט.', emoji: '🔎' },
    { name: 'דן', role: 'כותב המייל', line: 'אני מנסח את מייל-הסיכום, רק מההתחייבויות האמיתיות.', emoji: '✍️' },
    { name: 'אלון', role: 'המאמת', line: 'אני מוודא שכל דבר במייל באמת נאמר בפגישה.', emoji: '🔴' },
    { name: 'נעמי', role: 'הרכזת', line: 'אני מייחסת משימות לאחראים וקובעת את הפגישה הבאה.', emoji: '📅' },
    CHIEF,
  ],
  dashboards: [
    { name: 'ליה', role: 'האנליסטית', line: 'אני אוספת את ה-KPIs ואת המדדים שמידרדרים.', emoji: '📊' },
    { name: 'דן', role: 'המספר', line: 'אני כותב את הסיכום היומי בעברית אנושית.', emoji: '✍️' },
    { name: 'אלון', role: 'המבקר', line: 'אני פוסל כל מספר בסיכום שלא קיים בדאטה.', emoji: '🔴' },
    { name: 'מאיה', role: 'העורכת', line: 'אני משכתבת את הסיכום מהעובדות בלבד.', emoji: '🛠️' },
    CHIEF,
  ],
  reputation: [
    { name: 'עמנואל', role: 'המנטר', line: 'אני סורק ביקורות, סושיאל ומנועי-AI על השם שלכם.', emoji: '🔎' },
    { name: 'דן', role: 'המגיב', line: 'אני מנסח תגובות ותוכן חיובי שדוחק את השלילי.', emoji: '✍️' },
    { name: 'אלון', role: 'השער האתי', line: 'אני מסרב לפעול נגד עיתונות לגיטימית או לזייף ביקורות — תיקון עובדתי בלבד.', emoji: '🔴' },
    CHIEF,
  ],
  assistant: [
    { name: 'עמנואל', role: 'שולף הידע', line: 'אני מביא את התשובה מבסיס-הידע שלכם.', emoji: '🔎' },
    { name: 'דן', role: 'המשיב', line: 'אני עונה ללקוח בקול המותג.', emoji: '✍️' },
    { name: 'אלון', role: 'בודק העובדות', line: 'אני חוסם תשובה שלא מגובה בבסיס-הידע — עדיף "אני בודק" על ניחוש.', emoji: '🔴' },
    CHIEF,
  ],
  chief: [
    CHIEF,
    { name: 'עמנואל', role: 'החוקר', line: 'אני אוסף את ההקשר על הלקוח מכל כלי HELIX.', emoji: '🔎' },
    { name: 'דן', role: 'המבצע', line: 'אני כותב פולואפ, קובע פגישה ומעדכן את הכרטיס.', emoji: '✍️' },
    { name: 'אלון', role: 'המבקר', line: 'אני בודק כל פעולה חוצת-מוצרים לפני שהיא רצה.', emoji: '🔴' },
  ],
};

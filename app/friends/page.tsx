// SECRET "friends of HELIX" offer — hidden landing page ("דלת סודית").
// Reachable only via direct link: NOT in nav, NOT in sitemap (hand-curated list),
// noindex/nofollow below. Program spec: PRODUCTS/HELIX-PARTNER-PROGRAM.md
// Route: /friends  (slug can be swapped for a secret token later)
import type { Metadata } from "next";
import FriendsOffer from "./FriendsOffer";

export const metadata: Metadata = {
  title: "חברים של הליקס — הצעה סגורה",
  description:
    "הצעה סגורה לחברים של הליקס: אוטומציות וואטסאפ מחוברות למערכות שכבר יש לך, במחיר חבר.",
  alternates: { canonical: "/friends" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function FriendsPage() {
  return <FriendsOffer />;
}

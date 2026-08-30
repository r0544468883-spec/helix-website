// SECRET "BNI members" offer — hidden landing page ("דלת סודית").
// Same offer as /friends, framed for BNI members. Reachable only via direct link:
// NOT in nav, NOT in sitemap, noindex/nofollow below.
// Route: /bni  (slug can be swapped for a secret token later)
import type { Metadata } from "next";
import BniOffer from "./BniOffer";

export const metadata: Metadata = {
  title: "לחברי BNI — הצעה סגורה, מבית הליקס",
  description:
    "הצעה סגורה לחברי BNI: אוטומציות וואטסאפ, פולואפ מיידי להפניות וחיבור למערכות שכבר יש לכם, במחיר חבר.",
  alternates: { canonical: "/bni" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function BniPage() {
  return <BniOffer />;
}

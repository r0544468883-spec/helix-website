// SECRET OFFER — hidden landing page ("דלת סודית") for the broad audience.
// "החברים של הליקס" branding + SECRET OFFER concept. Same offer as /friends & /bni,
// framed for any business. Reachable only via direct link: NOT in nav, NOT in sitemap,
// noindex/nofollow below. Route: /secret-offer
import type { Metadata } from "next";
import SecretOffer from "./SecretOffer";

export const metadata: Metadata = {
  title: "SECRET OFFER — החברים של הליקס",
  description:
    "הצעה סגורה לחברים של הליקס: אוטומציות וואטסאפ, פולואפ מיידי לכל פנייה ושני CRM במתנה, במחיר של חבר.",
  alternates: { canonical: "/secret-offer" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function SecretOfferPage() {
  return <SecretOffer />;
}

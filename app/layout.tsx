import type { Metadata } from "next";
import "./globals.css";
import { BirdFlight } from "./components/BirdFlight";
import { CursorCat } from "./components/CursorCat";
import { ResumeChat } from "./components/ResumeChat";
import { SiteNav } from "./components/SiteNav";
import { ThemeProvider } from "./components/ThemeProvider";
import {
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  LINKEDIN_URL,
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  PROFILE_PHOTO,
  absoluteUrl,
  jsonLd,
} from "@/lib/site";

export const metadata: Metadata = {
  // metadataBase is what turns the relative OG image path into the absolute
  // URL crawlers require. Without it, link previews render without an image.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  keywords: [
    "Raghunandan Kumar",
    "Full-stack Developer",
    "AI Engineer",
    "Agentic AI",
    "Next.js Developer",
    "LangGraph",
    "RAG",
    "India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  // Search Console / Bing verification. Set the env vars after claiming the
  // property; the HTML-tag method is the one that survives redeploys.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: SITE_NAME,
  alternateName: "Raghunandan",
  givenName: "Raghunandan",
  familyName: "Kumar",
  jobTitle: "Full Stack and Agentic AI Engineer",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  mainEntityOfPage: SITE_URL,
  email: `mailto:${CONTACT_EMAIL}`,
  image: absoluteUrl(PROFILE_PHOTO),
  nationality: { "@type": "Country", name: "India" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kushinagar",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Guru Ghasidas Vishwavidyalaya",
    address: { "@type": "PostalAddress", addressLocality: "Bilaspur", addressCountry: "IN" },
  },
  worksFor: { "@type": "Organization", name: "Snorkel AI" },
  // sameAs is the strongest entity signal available: it tells Google these
  // profiles and this site are the same person.
  sameAs: [GITHUB_PROFILE_URL, LINKEDIN_URL],
  knowsAbout: [
    "Next.js",
    "React",
    "TypeScript",
    "Python",
    "FastAPI",
    "Retrieval-Augmented Generation",
    "LangGraph",
    "LangChain",
    "Agentic AI",
    "PostgreSQL",
    "Model Context Protocol",
  ],
};

/** Declares the site itself and binds it to the person entity. */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: `${SITE_NAME} - Portfolio`,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#person` },
};

/**
 * ProfilePage tells Google the homepage IS the person's profile, which is what
 * makes it eligible to surface for a name query rather than a generic result.
 */
const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: SITE_TITLE,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  inLanguage: "en",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required by next-themes: its pre-paint script
    // sets data-theme on <html>, so the server and client markup differ here by
    // design.
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* Sunlight carried from the banner down to the footer in light mode. */}
          <div className="sun-shine" aria-hidden="true" />
          <SiteNav />
          {children}
          <ResumeChat />
          <BirdFlight />
          <CursorCat />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd([personSchema, websiteSchema, profilePageSchema]),
          }}
        />
      </body>
    </html>
  );
}

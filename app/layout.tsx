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
  absoluteUrl,
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
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  jobTitle: "Full Stack and Agentic AI Engineer",
  url: SITE_URL,
  email: `mailto:${CONTACT_EMAIL}`,
  image: absoluteUrl(OG_IMAGE.url),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kushinagar",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Guru Ghasidas Vishwavidyalaya",
  },
  sameAs: [GITHUB_PROFILE_URL, LINKEDIN_URL],
  knowsAbout: [
    "Next.js",
    "TypeScript",
    "Python",
    "FastAPI",
    "RAG",
    "LangGraph",
    "MCP",
  ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </body>
    </html>
  );
}

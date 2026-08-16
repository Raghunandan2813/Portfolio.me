import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  // Belt and braces alongside robots.txt: nothing under /admin should ever
  // reach an index, and a private tool has no business in search results.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

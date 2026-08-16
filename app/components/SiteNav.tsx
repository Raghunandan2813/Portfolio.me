import Link from "next/link";
import {
  BriefcaseIcon,
  FolderIcon,
  LayersIcon,
  MailIcon,
  PersonIcon,
} from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#top", label: "Profile", Icon: PersonIcon },
  { href: "/projects", label: "Projects", Icon: FolderIcon },
  { href: "/#experience", label: "Experience", Icon: BriefcaseIcon },
  { href: "/#stack", label: "Stack", Icon: LayersIcon },
  { href: "/#contact", label: "Contact", Icon: MailIcon },
];

export function SiteNav() {
  return (
    <header className="social-nav">
      <div className="nav-inner">
        {/* Links are absolutely centred so the theme toggle's width cannot
            pull them off-centre. */}
        <nav className="nav-links" aria-label="Primary navigation">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href}>
              <b><Icon /></b>
              {/* The label stays visible on phones, stacked under the icon.
                  Hiding it was what made the bar unreadable: an icon alone
                  has to be guessed at, and guessing is the one thing a nav
                  should never ask for. */}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteNav() {
  return (
    <header className="social-nav">
      <div className="nav-inner">
        {/* Links are absolutely centred so the theme toggle's width cannot
            pull them off-centre. */}
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/#top"><b>⌂</b><span>Profile</span></Link>
          <Link href="/projects"><b>▦</b><span>Projects</span></Link>
          <Link href="/#experience"><b>◫</b><span>Experience</span></Link>
          <Link href="/#stack"><b>✦</b><span>Stack</span></Link>
          <Link href="/#contact"><b>✉</b><span>Contact</span></Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

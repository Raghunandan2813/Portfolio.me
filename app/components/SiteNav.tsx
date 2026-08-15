import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteNav() {
  return (
    <header className="social-nav">
      <div className="nav-inner">
        <Link className="nav-brand" href="/#top" aria-label="Raghunandan Kumar home">
          <span>RK</span>
        </Link>
        <Link className="nav-search" href="/#work" aria-label="Jump to my work">
          <i aria-hidden="true">⌕</i>
          <span>Browse my work</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/#top"><b>⌂</b><span>Profile</span></Link>
          <Link href="/projects"><b>▦</b><span>Projects</span></Link>
          <Link href="/#experience"><b>◫</b><span>Experience</span></Link>
          <Link href="/#stack"><b>✦</b><span>Stack</span></Link>
          <Link href="/#contact"><b>✉</b><span>Contact</span></Link>
        </nav>
        {/* The resume download lives on the profile banner only, so there is a
            single, unambiguous entry point for it. */}
        <ThemeToggle />
      </div>
    </header>
  );
}

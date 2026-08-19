import type { Metadata } from "next";
import { ProjectBento } from "../components/ProjectBento";
import { ProjectsHero } from "../components/ProjectsHero";
import { Reveal } from "../components/Reveal";
import { listProjects } from "@/lib/projects";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, absoluteUrl, jsonLd, socialMeta } from "@/lib/site";

const description =
  "Case studies for Raghunandan Kumar's agentic AI and full-stack products.";

// The root layout's title template appends "| Raghunandan Kumar".
export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  ...socialMeta({
    title: "Projects | Raghunandan Kumar",
    description,
    path: "/projects",
  }),
};

const RESUME_PATH = "/resume/raghunandan-kumar-resume.pdf";

export default async function ProjectsPage() {
  const projects = await listProjects();

  // Counted from the live list rather than written down, so adding or hiding a
  // project cannot leave the hero contradicting the page under it.
  const stats = [
    { value: String(projects.length), label: "shipped products" },
    { value: `${new Set(projects.flatMap((project) => project.stack)).size}+`, label: "technologies" },
    {
      value: String(projects.filter((project) => project.demoVideo).length),
      label: "demo walkthroughs",
    },
  ];

  // Names this page as the index of the case studies and lists what is on it.
  // An ItemList of named URLs is what makes a listing page eligible for
  // sitelinks under the main result rather than appearing as one bare row.
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/projects")}#collection`,
    url: absoluteUrl("/projects"),
    name: `Projects | ${SITE_NAME}`,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: absoluteUrl(`/projects/${project.slug}`),
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl("/projects") },
    ],
  };

  return (
    <main className="projects-page page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([collectionSchema, breadcrumbSchema]) }}
      />
      <ProjectsHero projects={projects} stats={stats} resumePath={RESUME_PATH} />

      <ProjectBento projects={projects} />

      <Reveal as="section" className="projects-cta" from="up">
        <span>Have a relevant engineering problem?</span>
        <h2>Let&apos;s compare notes.</h2>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
      </Reveal>
    </main>
  );
}

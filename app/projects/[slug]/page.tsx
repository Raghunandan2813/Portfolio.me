import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectMedia } from "../../components/ProjectMedia";
import { Reveal } from "../../components/Reveal";
import { projects } from "../../data/portfolio";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};

  const url = `/projects/${project.slug}`;
  return {
    // The root layout's title template appends "| Raghunandan Kumar".
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.title} | Raghunandan Kumar`,
      description: project.summary,
      url,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.summary,
    applicationCategory: project.category,
    url: absoluteUrl(`/projects/${project.slug}`),
    sameAs: [project.liveUrl, project.githubUrl],
    author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
    keywords: project.stack.join(", "),
  };

  // Breadcrumbs render as a path under the result in Google, replacing the
  // raw URL, and reinforce site structure.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl("/projects") },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: absoluteUrl(`/projects/${project.slug}`),
      },
    ],
  };

  return (
    <main className={`case-page ${project.accent}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([projectSchema, breadcrumbSchema]),
        }}
      />
      <div className="page-shell">
        <Link className="case-back" href="/projects">← All projects</Link>
        <Reveal as="section" className="case-hero" from="scale" amount={0.05}>
          <div className="case-heading">
            <span className="eyebrow">{project.category} · Case study 0{currentIndex + 1}</span>
            <h1>{project.title}</h1>
            <p>{project.tagline}</p>
            <div className="case-actions"><a className="primary-action" href={project.liveUrl} target="_blank" rel="noreferrer">Open live product ↗</a><a className="outline-action" href={project.githubUrl} target="_blank" rel="noreferrer">View source code</a></div>
          </div>
          <div className="case-facts"><div><span>Role</span><strong>Product &amp; engineering</strong></div><div><span>Focus</span><strong>{project.category}</strong></div><div><span>Delivery</span><strong>End-to-end build</strong></div></div>
        </Reveal>

        <Reveal as="section" className="case-demo">
          <div className="case-section-heading"><span>01</span><div><small>Product walkthrough</small><h2>Watch the product inside the portfolio.</h2></div></div>
          <ProjectMedia project={project} />
          {!project.demoVideo && <p className="demo-note"><b>Local video slot prepared.</b> Once the MP4 is supplied, it will play here with native controls—no YouTube redirect or external demo page.</p>}
        </Reveal>

        <div className="case-story">
          <Reveal as="article" from="left"><span>02 · Challenge</span><h2>The problem</h2><p>{project.problem}</p></Reveal>
          <Reveal as="article" from="right"><span>03 · Approach</span><h2>The solution</h2><p>{project.solution}</p></Reveal>
        </div>

        <Reveal as="section" className="case-build">
          <div className="case-section-heading"><span>04</span><div><small>Engineering details</small><h2>What I built</h2></div></div>
          <div className="highlight-grid">{project.highlights.map((highlight, index) => <article key={highlight}><span>0{index + 1}</span><p>{highlight}</p></article>)}</div>
        </Reveal>

        <Reveal as="section" className="case-stack" from="scale">
          <div><span className="eyebrow">System stack</span><h2>The tools behind the outcome.</h2></div>
          <div>{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
        </Reveal>

        <Link className="next-project" href={`/projects/${nextProject.slug}`}><span>Next case study</span><strong>{nextProject.title}</strong><b>↗</b></Link>
      </div>
    </main>
  );
}

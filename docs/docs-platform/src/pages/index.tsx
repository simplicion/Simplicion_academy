import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons} style={{marginTop: '2rem'}}>
          <Link
            className="button button--secondary button--lg"
            to="/safs/00">
            Read Academy Constitution (SAFS-00) ➡️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — ${siteConfig.tagline}`}
      description="The official operating system and foundation standards for Simplicion Academy.">
      <HomepageHeader />
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--4 margin-bottom--lg">
            <div className="card padding--lg" style={{height: '100%', border: '1px solid rgba(255,255,255,0.1)'}}>
              <Heading as="h3">📘 Foundation Standards (SAFS)</Heading>
              <p>
                The canonical single source of truth for terminology, taxonomy, data structures, UI components, design, and content governance.
              </p>
              <Link className="button button--outline button--primary button--block" to="/safs/00">
                Explore SAFS-00
              </Link>
            </div>
          </div>
          <div className="col col--4 margin-bottom--lg">
            <div className="card padding--lg" style={{height: '100%', border: '1px solid rgba(255,255,255,0.1)'}}>
              <Heading as="h3">⚙️ Content Operating System (SACOS)</Heading>
              <p>
                Internal operating standards governing curriculum design, video production, quality gates, AI workflows, and certifications.
              </p>
              <Link className="button button--outline button--primary button--block" to="/safs/00">
                Explore SACOS
              </Link>
            </div>
          </div>
          <div className="col col--4 margin-bottom--lg">
            <div className="card padding--lg" style={{height: '100%', border: '1px solid rgba(255,255,255,0.1)'}}>
              <Heading as="h3">🚀 Reusable Skill Modules</Heading>
              <p>
                Modular, outcome-oriented educational units powering career tracks for founders, developers, designers, and growth specialists.
              </p>
              <Link className="button button--outline button--primary button--block" to="/safs/00">
                Explore Modules
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

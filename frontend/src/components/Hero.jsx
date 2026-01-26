import React from 'react'

export default function Hero() {
  return (
    <section className="hero" aria-label="Hero section: Research collaboration platform">
      <div className="container-center hero-card">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div className="section-label pill pill-mint">Research collaboration, simplified</div>
            <h1 className="hero-title mt-3">Match nonprofits with expert researchers in days, not months.</h1>
            <p className="hero-subtitle mt-2">Design, run, and evaluate social impact projects with vetted partners across education, health, housing, and climate.</p>
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 hero-badges" role="list">
              <span className="pill pill-gray" role="listitem">IRB guidance ready</span>
              <span className="pill pill-gray" role="listitem">FERPA-safe workflows</span>
              <span className="pill pill-gray" role="listitem">Global talent pool</span>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-3 mt-4 cta-group">
              <a href="/browse" className="btn btn-gradient" aria-label="Browse active research briefs">Browse active briefs</a>
              <a href="/dashboard/nonprofit" className="btn btn-soft" aria-label="Post a nonprofit research brief">Post a nonprofit brief</a>
              <div className="text-muted small" aria-live="polite">No payment required to start.</div>
            </div>
            <div className="d-flex flex-wrap gap-3 mt-4" role="region" aria-label="Key statistics">
              <article className="stat-card">
                <div className="stat-value" aria-label="48 hours average match time">48 hrs</div>
                <div className="stat-label">Average time to first match</div>
              </article>
              <article className="stat-card">
                <div className="stat-value" aria-label="900 plus researchers available">900+</div>
                <div className="stat-label">Field-ready researchers</div>
              </article>
              <article className="stat-card">
                <div className="stat-value" aria-label="92 percent success rate">92%</div>
                <div className="stat-label">Projects moving to delivery</div>
              </article>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="hero-video">
              <div className="video-placeholder" role="img" aria-label="Intro walkthrough video, 1 minute 10 seconds">Intro walkthrough (1:10)</div>
              <div className="mt-3 grid grid-2">
                <article className="pill pill-mint w-100 justify-content-between" role="article">
                  <span>Matched: Harbor Relief + Insight Lab</span>
                  <span className="badge bg-light text-dark">RCT design</span>
                </article>
                <article className="pill pill-gray w-100 justify-content-between" role="article">
                  <span>Matched: BrightSteps + Civic Data Hub</span>
                  <span className="badge bg-light text-dark">Mixed methods</span>
                </article>
              </div>
              <div className="mt-3 small text-muted" role="note">Curated matches with timelines, data governance, and milestone tracking built in.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )}
  

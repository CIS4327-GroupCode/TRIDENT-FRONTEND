import React from 'react'

export default function Hero() {
  return (
    <section className="py-4">
  <div className="container card p-4 mb-3">
        <div className="row align-items-center">
          <div className="col-md-7">
            <h1 className="h3">Evidence, on demand. Match nonprofits with qualified researchers.</h1>
            <p className="text-muted">Find research partners who can help design, run, and analyze social projects.</p>
            <div className="mt-3">
              <a href="#" className="btn btn-primary me-2">I'm a Nonprofit</a>
              <a href="#" className="btn btn-outline-primary">I'm a Researcher</a>
            </div>
          </div>
          <div className="col-md-5 text-center">
            <div className="video-placeholder mx-auto">Optional explainer video</div>
          </div>
        </div>
      </div>
    </section>
  )
}

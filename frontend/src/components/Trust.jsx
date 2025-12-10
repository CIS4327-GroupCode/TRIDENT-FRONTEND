import React from 'react'

export default function Trust() {
  return (
    <section className="py-3">
  <div className="container card p-3">
        <h4 className="mb-3">Trusted by</h4>
        <div className="d-flex gap-3 mb-3 flex-wrap">
          <div className="border rounded px-3 py-2">University A</div>
          <div className="border rounded px-3 py-2">Foundation B</div>
          <div className="border rounded px-3 py-2">University C</div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="card p-3 mb-2">
              <p className="mb-0">"We found an amazing research partner in 2 weeks." — Nonprofit Director</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3 mb-2">
              <p className="mb-0">"A streamlined way to find field-ready projects." — Researcher</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

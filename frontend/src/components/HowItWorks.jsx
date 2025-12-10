import React from 'react'

const steps = [
  { title: 'Create profile', desc: 'Tell us who you are, your skills or needs.' },
  { title: 'Post or accept a brief', desc: 'Nonprofits post short briefs; researchers can apply.' },
  { title: 'Match & message', desc: 'Connect with your match, discuss scope and deliverables.' },
  { title: 'Deliverables & feedback', desc: 'Submit outcomes and collect feedback for future matches.' }
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-3">
  <div className="container">
        <h2 className="h4">How it works</h2>
        <div className="row g-3 mt-3">
          {steps.map((s, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="card h-100 text-center p-3">
                <div className="badge bg-primary rounded-circle mx-auto mb-2" style={{width:36,height:36,lineHeight:'36px'}}>{i+1}</div>
                <h5 className="h6">{s.title}</h5>
                <p className="small text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

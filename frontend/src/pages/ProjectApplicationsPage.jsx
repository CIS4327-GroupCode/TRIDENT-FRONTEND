import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import ApplicationsTab from '../components/nonprofitDash/ApplicationsTab';

export default function ProjectApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id || !/^\d+$/.test(id)) {
    return (
      <div className="page-root">
        <TopBar />
        <main id="main-content" className="page-content container-center py-5">
          <div className="alert alert-warning">Invalid project ID provided.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm mb-3">
          &larr; Back
        </button>

        <div className="card p-4 mb-3">
          <h1 className="page-heading mb-1">Project Applications</h1>
          <p className="page-subheading mb-0">Review submissions for this project and take action.</p>
        </div>

        <div className="card p-4">
          <ApplicationsTab initialProjectId={Number(id)} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

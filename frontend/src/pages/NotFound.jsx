import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const REDIRECT_SECONDS = 5;

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate('/', { replace: true });
    }, REDIRECT_SECONDS * 1000);

    const intervalId = setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [navigate]);

  return (
    <div className="page-root">
      <main id="main-content" className="page-content container-center py-5">
        <section className="card p-4 text-center" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 className="page-heading mb-2">404 - Page Not Found</h1>
          <p className="page-subheading mb-3">
            You might not be in the right place.. we'll take you back to Home.
          </p>
          <p className="text-muted mb-4">
            Redirecting to Home in {countdown} second{countdown === 1 ? '' : 's'}.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link className="btn btn-primary" to="/">Go Home</Link>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function buildEvents({ agreement, reviews, history }) {
  const events = [];

  if (Array.isArray(history)) {
    history.forEach((item) => {
      events.push({
        key: `history-${item.id}`,
        date: item.created_at,
        title: item.id === agreement?.id ? 'Current version in view' : `Version ${item.version_number || 1} created`,
        detail: `${item.title} (${item.status})`,
        agreementId: item.id
      });
    });
  }

  if (Array.isArray(reviews)) {
    reviews.forEach((review, index) => {
      events.push({
        key: `review-${review.id || index}`,
        date: review.reviewed_at || review.created_at,
        title: `${String(review.action || 'review').replace(/_/g, ' ')}`,
        detail: [review.feedback, review.changes_requested].filter(Boolean).join(' | ') || review.new_status,
        reviewer: review.reviewer?.name || review.reviewer?.email || 'Reviewer'
      });
    });
  }

  if (agreement?.nonprofit_signed_at) {
    events.push({
      key: 'nonprofit-sign',
      date: agreement.nonprofit_signed_at,
      title: 'Nonprofit signed',
      detail: agreement.nonprofitUser?.name || 'Nonprofit'
    });
  }

  if (agreement?.researcher_signed_at) {
    events.push({
      key: 'researcher-sign',
      date: agreement.researcher_signed_at,
      title: 'Researcher signed',
      detail: agreement.researcherUser?.name || 'Researcher'
    });
  }

  if (agreement?.effective_at) {
    events.push({ key: 'effective', date: agreement.effective_at, title: 'Agreement effective', detail: null });
  }

  if (agreement?.completed_at) {
    events.push({ key: 'completed', date: agreement.completed_at, title: 'Agreement completed', detail: null });
  }

  if (agreement?.terminated_at) {
    events.push({ key: 'terminated', date: agreement.terminated_at, title: 'Agreement terminated', detail: agreement.termination_reason || null });
  }

  if (agreement?.archived_at) {
    events.push({ key: 'archived', date: agreement.archived_at, title: 'Agreement archived', detail: null });
  }

  return events
    .filter((event) => event.date)
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}

export default function AgreementLifecycleTimeline({ agreement, reviews, history }) {
  const events = useMemo(() => buildEvents({ agreement, reviews, history }), [agreement, reviews, history]);

  return (
    <section style={{ display: 'grid', gap: '12px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Lifecycle Timeline</h3>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
          Review actions, signatures, effectiveness, and version history for this agreement chain.
        </p>
      </div>

      {events.length ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {events.map((event) => (
            <article key={event.key} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                <strong style={{ textTransform: 'capitalize' }}>{event.title}</strong>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>{formatDate(event.date)}</span>
              </div>
              {event.detail ? <p style={{ margin: '6px 0 0 0', color: '#374151' }}>{event.detail}</p> : null}
              {event.reviewer ? <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>By {event.reviewer}</p> : null}
              {event.agreementId && event.agreementId !== agreement?.id ? (
                <Link to={`/agreements/${event.agreementId}`} style={{ fontSize: '14px', fontWeight: 600 }}>
                  Open version #{event.agreementId}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p style={{ color: '#6b7280', margin: 0 }}>No lifecycle events recorded yet.</p>
      )}
    </section>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { fetchApiWithAuth } from '../../config/api';

/**
 * Researcher dashboard tab showing project invitations from nonprofits
 */
export default function InvitationsTab() {
  const { token } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApiWithAuth('/applications/invitations', { method: 'GET' }, token);
      setInvitations(data.invitations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvitations();
  }, [token]);

  const handleRespond = async (invitationId, response) => {
    try {
      setRespondingId(invitationId);
      await fetchApiWithAuth(`/applications/${invitationId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response })
      }, token);
      // Update local state
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === invitationId
            ? { ...inv, status: response === 'accept' ? 'accepted' : 'rejected' }
            : inv
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to respond to invitation');
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading invitations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
        <p style={{ margin: 0 }}>{error}</p>
        <button onClick={fetchInvitations} className="btn btn-sm btn-outline-danger mt-2">Retry</button>
      </div>
    );
  }

  const pending = invitations.filter(inv => inv.status === 'pending');
  const responded = invitations.filter(inv => inv.status !== 'pending');

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Project Invitations</h2>

      {invitations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#9993;</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
            No Invitations Yet
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            When nonprofits invite you to projects, they will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Pending invitations */}
          {pending.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Pending ({pending.length})
              </h3>
              {pending.map(inv => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onRespond={handleRespond}
                  respondingId={respondingId}
                />
              ))}
            </div>
          )}

          {/* Responded invitations */}
          {responded.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', marginBottom: '12px' }}>
                Previous ({responded.length})
              </h3>
              {responded.map(inv => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onRespond={handleRespond}
                  respondingId={respondingId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InvitationCard({ invitation, onRespond, respondingId }) {
  const isPending = invitation.status === 'pending';
  const isResponding = respondingId === invitation.id;
  const meta = invitation.metadata || {};

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px',
      marginBottom: '12px', backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      opacity: isPending ? 1 : 0.7
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            {meta.project_title || 'Project Invitation'}
          </h4>
          {invitation.organization && (
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
              from <strong>{invitation.organization.name}</strong>
              {meta.invited_by_name ? ` (${meta.invited_by_name})` : ''}
            </p>
          )}
          {meta.message && (
            <div style={{
              padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px',
              marginBottom: '8px', fontSize: '14px', color: '#374151',
              borderLeft: '3px solid #d1d5db'
            }}>
              {meta.message}
            </div>
          )}
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
            {meta.invited_at ? new Date(meta.invited_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            }) : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isPending ? (
            <>
              <button
                onClick={() => onRespond(invitation.id, 'accept')}
                disabled={isResponding}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isResponding ? '#86efac' : '#059669',
                  color: '#ffffff', border: 'none', borderRadius: '6px',
                  fontSize: '14px', fontWeight: '600',
                  cursor: isResponding ? 'not-allowed' : 'pointer'
                }}
              >
                {isResponding ? '...' : 'Accept'}
              </button>
              <button
                onClick={() => onRespond(invitation.id, 'decline')}
                disabled={isResponding}
                style={{
                  padding: '8px 16px', backgroundColor: '#ffffff',
                  color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px',
                  fontSize: '14px', fontWeight: '600',
                  cursor: isResponding ? 'not-allowed' : 'pointer'
                }}
              >
                Decline
              </button>
            </>
          ) : (
            <span style={{
              padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '600',
              backgroundColor: invitation.status === 'accepted' ? '#dcfce7' : '#fef2f2',
              color: invitation.status === 'accepted' ? '#166534' : '#991b1b'
            }}>
              {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

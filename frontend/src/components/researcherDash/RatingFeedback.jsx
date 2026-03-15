import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getUserReviews, getUserReviewSummary } from '../../config/api';
import ReviewSummary from '../reviews/ReviewSummary';
import ReviewList from '../reviews/ReviewList';

export default function RatingFeedback() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadRatings = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const [summaryResponse, reviewsResponse] = await Promise.all([
                    getUserReviewSummary(user.id),
                    getUserReviews(user.id, { page: 1, limit: 20 })
                ]);

                if (!cancelled) {
                    setSummary(summaryResponse?.summary || null);
                    setReviews(Array.isArray(reviewsResponse?.reviews) ? reviewsResponse.reviews : []);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError.message || 'Failed to load ratings and feedback');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRatings();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    return (
        <div className="tab-pane-content">
            <h3 className="mb-3">Rating and Feedback</h3>
            {loading && <p className="text-muted">Loading ratings...</p>}
            {!loading && error && <p className="text-danger mb-2">{error}</p>}
            {!loading && !error && (
                <div className="mb-3">
                    <ReviewSummary summary={summary} loading={loading} />
                </div>
            )}
            <h4>Feedback Received</h4>
            {!loading && !error && (
                <ReviewList
                    reviews={reviews}
                    emptyMessage="No reviews received yet."
                />
            )}
        </div>
    );
}
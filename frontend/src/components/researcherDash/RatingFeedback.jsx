import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getUserGivenRatings, getUserRatings, getUserRatingSummary } from '../../config/api';
import ReviewSummary from '../reviews/ReviewSummary';
import ReviewList from '../reviews/ReviewList';

export default function RatingFeedback() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [givenReviews, setGivenReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadRatings = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const [summaryResponse, reviewsResponse, givenResponse] = await Promise.all([
                getUserRatingSummary(user.id),
                getUserRatings(user.id, { page: 1, limit: 20 }),
                getUserGivenRatings(user.id, { page: 1, limit: 20 })
            ]);

            setSummary(summaryResponse?.summary || null);
            setReviews(Array.isArray(reviewsResponse?.ratings) ? reviewsResponse.ratings : []);

            const normalizedGivenRatings = Array.isArray(givenResponse?.ratings)
                ? givenResponse.ratings.map((rating) => ({
                    ...rating,
                    reviewer: rating.reviewedUser || rating.reviewer || null,
                }))
                : [];
            setGivenReviews(normalizedGivenRatings);
        } catch (loadError) {
            setError(loadError.message || 'Failed to load ratings and feedback');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadRatings();
    }, [loadRatings]);

    useEffect(() => {
        const refreshOnRatingUpdate = () => {
            loadRatings();
        };

        window.addEventListener('ratings:updated', refreshOnRatingUpdate);
        return () => window.removeEventListener('ratings:updated', refreshOnRatingUpdate);
    }, [loadRatings]);

    return (
        <div className="tab-pane-content">
            <h3 className="mb-3">My Ratings</h3>
            {loading && <p className="text-muted">Loading ratings...</p>}
            {!loading && error && <p className="text-danger mb-2">{error}</p>}
            {!loading && !error && (
                <div className="mb-3">
                    <ReviewSummary summary={summary} loading={loading} />
                </div>
            )}
            <h4>Ratings Received</h4>
            {!loading && !error && (
                <ReviewList
                    reviews={reviews}
                    emptyMessage="No ratings received yet."
                />
            )}

            <h4 className="mt-4">Ratings Submitted</h4>
            {!loading && !error && (
                <ReviewList
                    reviews={givenReviews}
                    emptyMessage="No ratings submitted yet."
                />
            )}
        </div>
    );
}
import React from 'react';

export default function RatingFeedback() {
    return (
        <div className="tab-pane-content">
            <h3 className="mb-3">Rating and Feedback</h3>
            <p>Overall Rating: ★★★★☆ (4.2/5)</p>
            <h4>Feedback Received</h4>
            {/* Feedback List Placeholder */}
            <p className="border-bottom pb-2">"Excellent communication and timely delivery." - Nonprofit Z</p>
        </div>
    );
}
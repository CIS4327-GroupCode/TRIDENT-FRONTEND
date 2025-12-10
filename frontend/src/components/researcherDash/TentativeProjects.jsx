import React from 'react';

export default function TentativeProjects() {
    return (
        <div className="tab-pane-content">
            <h3 className="mb-3">Tentative Projects Available (Possible Match)</h3>
            <p>Based on your profile, Trident recommends the following projects:</p>
            {/* Matching Project Cards Placeholder */}
            <div className="alert alert-info">Project X: Analyzing local climate data. **Match Score: 85%**</div>
            <div className="alert alert-info">Project Y: Survey design for mental health. **Match Score: 78%**</div>
        </div>
    );
}
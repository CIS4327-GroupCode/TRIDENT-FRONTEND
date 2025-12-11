import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';
import { useAuth } from '../../auth/AuthContext';

// Personal Info Component
const PersonalInfo = ({ user, profile, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        affiliation: profile?.affiliation || '',
        domains: profile?.domains || '',
        methods: profile?.methods || '',
        tools: profile?.tools || '',
        availability: profile?.availability || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onUpdate(formData);
        setEditing(false);
    };

    if (editing) {
        return (
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-bold">Name</label>
                    <p className="form-control-plaintext">{user.name}</p>
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <p className="form-control-plaintext">{user.email}</p>
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Affiliation/Institution</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                        placeholder="e.g., Harvard University, MIT"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Research Domains</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.domains}
                        onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                        placeholder="e.g., Machine Learning, Public Health, Data Science"
                    />
                    <small className="text-muted">Separate multiple domains with commas</small>
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Research Methods</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.methods}
                        onChange={(e) => setFormData({ ...formData, methods: e.target.value })}
                        placeholder="e.g., Quantitative Analysis, Qualitative Research"
                    />
                    <small className="text-muted">Separate multiple methods with commas</small>
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Tools & Technologies</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.tools}
                        onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                        placeholder="e.g., Python, R, SPSS, Tableau"
                    />
                    <small className="text-muted">Separate multiple tools with commas</small>
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Availability</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="e.g., 10-20 hours/week, Flexible"
                    />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            </form>
        );
    }

    return (
        <div>
            <div className="mb-3">
                <label className="form-label fw-bold">Name</label>
                <p className="mb-2">{user.name}</p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <p className="mb-2">{user.email}</p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Role</label>
                <p className="mb-2"><span className="badge bg-info">{user.role}</span></p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Affiliation/Institution</label>
                <p className="mb-2">{profile?.affiliation || <em className="text-muted">Not specified</em>}</p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Research Domains</label>
                <p className="mb-2">{profile?.domains || <em className="text-muted">Not specified</em>}</p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Research Methods</label>
                <p className="mb-2">{profile?.methods || <em className="text-muted">Not specified</em>}</p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Tools & Technologies</label>
                <p className="mb-2">{profile?.tools || <em className="text-muted">Not specified</em>}</p>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Availability</label>
                <p className="mb-2">{profile?.availability || <em className="text-muted">Not specified</em>}</p>
            </div>
            <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>
                <i className="bi bi-pencil me-1"></i>
                Edit Profile
            </button>
        </div>
    );
};

// Academic Info Component with CRUD
const AcademicInfo = ({ token }) => {
    const [academics, setAcademics] = useState([]);
    const [editing, setEditing] = useState(null);
    const [newItem, setNewItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAcademics();
    }, []);

    const fetchAcademics = async () => {
        try {
            const res = await fetch(getApiUrl('/api/researchers/me/academic'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAcademics(data.academics);
            }
        } catch (e) {
            console.error('Failed to fetch academics:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setNewItem({ degree: '', institution: '', year: '', field: '' });
    };

    const handleSaveNew = async () => {
        if (newItem.degree && newItem.institution) {
            try {
                const res = await fetch(getApiUrl('/api/researchers/me/academic'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newItem)
                });
                const data = await res.json();
                if (res.ok) {
                    setAcademics([...academics, data.academic]);
                    setNewItem(null);
                } else {
                    alert(data.error || 'Failed to add academic entry');
                }
            } catch (e) {
                alert('Failed to add academic entry');
            }
        }
    };

    const handleEdit = (item) => {
        setEditing({ ...item });
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`/api/researchers/me/academic/${editing.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    degree: editing.degree,
                    field: editing.field,
                    institution: editing.institution,
                    year: editing.year
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAcademics(academics.map(a => a.id === editing.id ? data.academic : a));
                setEditing(null);
            } else {
                alert(data.error || 'Failed to update academic entry');
            }
        } catch (e) {
            alert('Failed to update academic entry');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this academic entry?')) {
            try {
                const res = await fetch(`/api/researchers/me/academic/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setAcademics(academics.filter(a => a.id !== id));
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to delete academic entry');
                }
            } catch (e) {
                alert('Failed to delete academic entry');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4"><div className="spinner-border"></div></div>;
    }

    return (
        <div>
            <h5 className="mb-3">Academic Background</h5>
            
            {academics.length === 0 && !newItem && (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No academic entries added yet. Click "Add Academic Entry" to get started.
                </div>
            )}

            {academics.map(item => (
                <div key={item.id} className="card mb-3">
                    {editing?.id === item.id ? (
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Degree</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.degree}
                                        onChange={(e) => setEditing({ ...editing, degree: e.target.value })}
                                        placeholder="e.g., Ph.D., M.Sc., B.A."
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Field of Study</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.field}
                                        onChange={(e) => setEditing({ ...editing, field: e.target.value })}
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label">Institution</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.institution}
                                        onChange={(e) => setEditing({ ...editing, institution: e.target.value })}
                                        placeholder="e.g., Harvard University"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Year</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.year}
                                        onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                                        placeholder="e.g., 2020"
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button className="btn btn-primary btn-sm me-2" onClick={handleSaveEdit}>
                                    <i className="bi bi-check-lg me-1"></i>Save
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="mb-1">{item.degree} {item.field && `in ${item.field}`}</h6>
                                    <p className="mb-1 text-muted">{item.institution}</p>
                                    {item.year && <small className="text-muted">{item.year}</small>}
                                </div>
                                <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-primary" onClick={() => handleEdit(item)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-outline-danger" onClick={() => handleDelete(item.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {newItem && (
                <div className="card mb-3 border-primary">
                    <div className="card-body">
                        <h6 className="mb-3">Add New Academic Entry</h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Degree *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.degree}
                                    onChange={(e) => setNewItem({ ...newItem, degree: e.target.value })}
                                    placeholder="e.g., Ph.D., M.Sc., B.A."
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Field of Study</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.field}
                                    onChange={(e) => setNewItem({ ...newItem, field: e.target.value })}
                                    placeholder="e.g., Computer Science"
                                />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label">Institution *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.institution}
                                    onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })}
                                    placeholder="e.g., Harvard University"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Year</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.year}
                                    onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                                    placeholder="e.g., 2020"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <button className="btn btn-primary btn-sm me-2" onClick={handleSaveNew}>
                                <i className="bi bi-plus-lg me-1"></i>Add Entry
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setNewItem(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!newItem && (
                <button className="btn btn-outline-primary" onClick={handleAdd}>
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Academic Entry
                </button>
            )}
        </div>
    );
};

// Certifications Component with CRUD
const Certifications = ({ token }) => {
    const [certifications, setCertifications] = useState([]);
    const [editing, setEditing] = useState(null);
    const [newItem, setNewItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        try {
            const res = await fetch(getApiUrl('/api/researchers/me/certifications'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCertifications(data.certifications);
            }
        } catch (e) {
            console.error('Failed to fetch certifications:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setNewItem({ name: '', issuer: '', year: '', credential_id: '' });
    };

    const handleSaveNew = async () => {
        if (newItem.name && newItem.issuer) {
            try {
                const res = await fetch(getApiUrl('/api/researchers/me/certifications'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newItem)
                });
                const data = await res.json();
                if (res.ok) {
                    setCertifications([...certifications, data.certification]);
                    setNewItem(null);
                } else {
                    alert(data.error || 'Failed to add certification');
                }
            } catch (e) {
                alert('Failed to add certification');
            }
        }
    };

    const handleEdit = (item) => {
        setEditing({ ...item });
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`/api/researchers/me/certifications/${editing.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editing.name,
                    issuer: editing.issuer,
                    year: editing.year,
                    credential_id: editing.credential_id
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCertifications(certifications.map(c => c.id === editing.id ? data.certification : c));
                setEditing(null);
            } else {
                alert(data.error || 'Failed to update certification');
            }
        } catch (e) {
            alert('Failed to update certification');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this certification?')) {
            try {
                const res = await fetch(`/api/researchers/me/certifications/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setCertifications(certifications.filter(c => c.id !== id));
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to delete certification');
                }
            } catch (e) {
                alert('Failed to delete certification');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4"><div className="spinner-border"></div></div>;
    }

    return (
        <div>
            <h5 className="mb-3">Certifications & Credentials</h5>
            
            {certifications.length === 0 && !newItem && (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No certifications added yet. Click "Add Certification" to get started.
                </div>
            )}

            {certifications.map(item => (
                <div key={item.id} className="card mb-3">
                    {editing?.id === item.id ? (
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label">Certification Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.name}
                                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                        placeholder="e.g., Ethical Research Certification"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Year</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.year}
                                        onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                                        placeholder="e.g., 2024"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Issuing Organization</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.issuer}
                                        onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                                        placeholder="e.g., IRB Council"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Credential ID (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editing.credentialId}
                                        onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
                                        placeholder="e.g., CERT-12345"
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button className="btn btn-primary btn-sm me-2" onClick={handleSaveEdit}>
                                    <i className="bi bi-check-lg me-1"></i>Save
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="mb-1">{item.name}</h6>
                                    <p className="mb-1 text-muted">{item.issuer}</p>
                                    <small className="text-muted">
                                        {item.year && `Issued: ${item.year}`}
                                        {item.credentialId && ` • ID: ${item.credentialId}`}
                                    </small>
                                </div>
                                <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-primary" onClick={() => handleEdit(item)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-outline-danger" onClick={() => handleDelete(item.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {newItem && (
                <div className="card mb-3 border-primary">
                    <div className="card-body">
                        <h6 className="mb-3">Add New Certification</h6>
                        <div className="row g-3">
                            <div className="col-md-8">
                                <label className="form-label">Certification Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g., Ethical Research Certification"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Year</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.year}
                                    onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                                    placeholder="e.g., 2024"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Issuing Organization *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.issuer}
                                    onChange={(e) => setNewItem({ ...newItem, issuer: e.target.value })}
                                    placeholder="e.g., IRB Council"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Credential ID (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.credentialId}
                                    onChange={(e) => setNewItem({ ...newItem, credentialId: e.target.value })}
                                    placeholder="e.g., CERT-12345"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <button className="btn btn-primary btn-sm me-2" onClick={handleSaveNew}>
                                <i className="bi bi-plus-lg me-1"></i>Add Certification
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setNewItem(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!newItem && (
                <button className="btn btn-outline-primary" onClick={handleAdd}>
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Certification
                </button>
            )}
        </div>
    );
};

export default function ProfileSection({ user }) {
    const { token } = useAuth();
    const [profileTab, setProfileTab] = useState('personal');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(getApiUrl('/api/researchers/me'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data.profile);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (updates) => {
        try {
            const res = await fetch(getApiUrl('/api/researchers/me'), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data.profile);
                alert('Profile updated successfully!');
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const renderProfileContent = () => {
        if (loading) {
            return <div className="text-center py-4"><div className="spinner-border"></div></div>;
        }

        switch (profileTab) {
            case 'personal':
                return <PersonalInfo user={user} profile={profile} onUpdate={handleUpdateProfile} />;
            case 'academic':
                return <AcademicInfo token={token} />;
            case 'certifications':
                return <Certifications token={token} />;
            default:
                return <PersonalInfo user={user} profile={profile} onUpdate={handleUpdateProfile} />;
        }
    };

    return (
        <div className="tab-pane-content">
            <h3 className="mb-3">Profile Information</h3>
            <ul className="nav nav-pills mb-3">
                <li className="nav-item">
                    <button
                        className={`nav-link ${profileTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setProfileTab('personal')}
                    >
                        <i className="bi bi-person me-1"></i>
                        Personal
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${profileTab === 'academic' ? 'active' : ''}`}
                        onClick={() => setProfileTab('academic')}
                    >
                        <i className="bi bi-mortarboard me-1"></i>
                        Academic
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${profileTab === 'certifications' ? 'active' : ''}`}
                        onClick={() => setProfileTab('certifications')}
                    >
                        <i className="bi bi-award me-1"></i>
                        Certifications
                    </button>
                </li>
            </ul>
            <div className="card p-3">{renderProfileContent()}</div>
        </div>
    );
}
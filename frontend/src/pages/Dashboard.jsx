import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

// Import nonprofit components
import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";
import SearchPreview from "../components/SearchPreview";
import ProjectMatchesView from "../components/matching/ProjectMatchesView";
import ApplicationsTab from "../components/nonprofitDash/ApplicationsTab";

// Import researcher components
import ProfileSection from "../components/researcherDash/ProfileSection";
import ProjectsInvolved from "../components/researcherDash/ProjectsInvolved";
import RatingFeedback from "../components/researcherDash/RatingFeedback";

const NONPROFIT_TABS = [
  "projects",
  "matches",
  "applications",
  "browse",
  "agreements",
  "rating"
];

const RESEARCHER_TABS = [
  "profile",
  "projects",
  "rating"
];

const RESEARCHER_PROJECTS_SUBTABS = [
  "current",
  "completed",
  "applications",
  "invitations",
  "tentative"
];

const RESEARCHER_LEGACY_TAB_TO_PROJECTS_SUBTAB = {
  invitations: 'invitations',
  tentative: 'tentative',
  agreements: 'current',
};

// Example dashboard components for each role
function NonprofitDashboard({ user, initialTab = "projects" }) {
  const [activeTab, setActiveTab] = useState(
    NONPROFIT_TABS.includes(initialTab) ? initialTab : "projects"
  );
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectFormMode, setProjectFormMode] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (NONPROFIT_TABS.includes(initialTab)) {
      setActiveTab(initialTab);
      setEditingProjectId(null);
      setProjectFormMode(null);
    }
  }, [initialTab]);

  const handleProjectSuccess = (project) => {
    setEditingProjectId(null);
    setProjectFormMode(null);
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("projects");
  };

  const handleEdit = (projectId) => {
    setEditingProjectId(projectId);
    setProjectFormMode("edit");
    setActiveTab("projects");
  };

  const handleCreate = () => {
    setEditingProjectId(null);
    setProjectFormMode("create");
    setActiveTab("projects");
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setProjectFormMode(null);
    setActiveTab("projects");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        if (projectFormMode) {
          return (
            <ProjectForm
              projectId={editingProjectId}
              onSuccess={handleProjectSuccess}
              onCancel={handleCancelEdit}
            />
          );
        }

        return (
          <ProjectList
            onEdit={handleEdit}
            onCreate={handleCreate}
            onRefresh={refreshTrigger}
          />
        );
      case "matches":
        return <ProjectMatchesView />;
      case "applications":
        return <ApplicationsTab />;
      case "agreements":
        return (
          <div className="card p-4">
            <h3>Agreement Workspace</h3>
            <p className="text-muted mb-3">
              Create and manage agreements for accepted applications.
            </p>
            <Link className="btn btn-primary" to="/agreements">
              Open Agreements
            </Link>
          </div>
        );
      case "browse":
        return <SearchPreview />;
      case "rating":
        return <RatingFeedback />;
      default:
        return (
          <ProjectList
            onEdit={handleEdit}
            onCreate={handleCreate}
            onRefresh={refreshTrigger}
          />
        );
    }
  };

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <h1 className="page-heading">Nonprofit Dashboard</h1>
        <p className="page-subheading">
          Manage your research collaborations and track project outcomes
        </p>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "projects" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "projects"}
              aria-controls="projects-panel"
              onClick={() => {
                setActiveTab("projects");
                setEditingProjectId(null);
                setProjectFormMode(null);
              }}
            >
              My Projects
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "matches" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "matches"}
              aria-controls="matches-panel"
              onClick={() => {
                setActiveTab("matches");
                setEditingProjectId(null);
                setProjectFormMode(null);
              }}
            >
              Matches
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "applications" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "applications"}
              aria-controls="applications-panel"
              onClick={() => {
                setActiveTab("applications");
                setEditingProjectId(null);
                setProjectFormMode(null);
              }}
            >
              Applications
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "browse" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "browse"}
              aria-controls="browse-panel"
              onClick={() => {
                setActiveTab("browse");
                setEditingProjectId(null);
                setProjectFormMode(null);
              }}
            >
              Browse Researchers
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "agreements" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "agreements"}
              aria-controls="agreements-panel"
              onClick={() => {
                setActiveTab("agreements");
                setEditingProjectId(null);
                setProjectFormMode(null);
              }}
            >
              Agreements
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "rating" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "rating"}
              aria-controls="rating-panel"
              onClick={() => {
                setActiveTab("rating");
                setEditingProjectId(null);
                setProjectFormMode(null);
              }}
            >
              Ratings
            </button>
          </li>
        </ul>

        {/* Content Area */}
        <div className="dashboard-content-area">{renderContent()}</div>
      </main>
      <Footer />
    </div>
  );
}

/**RESEARCHER DASHBOARD **/

function ResearcherDashboard({ user, initialTab = "profile", initialProjectsTab = 'current' }) {
  const [activeTab, setActiveTab] = useState(
    RESEARCHER_TABS.includes(initialTab) ? initialTab : "profile"
  );

  useEffect(() => {
    if (RESEARCHER_TABS.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Function to render the active component based on the main state
  const renderMainContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection user={user} />;
      case "projects":
        return <ProjectsInvolved initialTab={initialProjectsTab} />;
      case "rating":
        return <RatingFeedback />;
      default:
        return <ProfileSection user={user} />;
    }
  };
  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <h1 className="page-heading">Researcher Dashboard</h1>
        <p className="page-subheading">
          Track your profile, project involvement and collaboration outcomes
        </p>

        {/* Main Tab Navigation */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "profile"}
              aria-controls="profile-panel"
              onClick={() => setActiveTab("profile")}
            >
              Profile Information
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "projects" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "projects"}
              aria-controls="projects-panel"
              onClick={() => setActiveTab("projects")}
            >
              Projects Involved
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "rating" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "rating"}
              aria-controls="rating-panel"
              onClick={() => setActiveTab("rating")}
            >
              Ratings
            </button>
          </li>
        </ul>
        {/* Main Content Area */}
        <div className="dashboard-content-area">{renderMainContent()}</div>
      </main>
      <Footer />
    </div>
  );
}

function AdminDashboard({ user }) {
  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      {/* Add more admin-specific content here */}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fallback to localStorage if context is not populated
  let currentUser = user;
  if (!currentUser) {
    try {
      const rawUser = localStorage.getItem("trident_user");
      if (rawUser) currentUser = JSON.parse(rawUser);
    } catch (e) {
      currentUser = null;
    }
  }

  useEffect(() => {
    if (!currentUser) {
      // Redirect after 2 seconds
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="page-root">
        <TopBar />
        <main className="page-content container-center py-5">
          <div className="alert alert-warning">
            You must be logged in to view the dashboard. Redirecting...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const requestedTab = new URLSearchParams(location.search).get("tab");
  const requestedProjectsTab = new URLSearchParams(location.search).get('projectsTab');
  const nonprofitInitialTab = NONPROFIT_TABS.includes(requestedTab) ? requestedTab : "projects";
  const legacyMappedProjectsTab = RESEARCHER_LEGACY_TAB_TO_PROJECTS_SUBTAB[requestedTab] || null;
  const researcherInitialTab = RESEARCHER_TABS.includes(requestedTab)
    ? requestedTab
    : legacyMappedProjectsTab
      ? 'projects'
      : "profile";
  const researcherInitialProjectsTab = (() => {
    if (researcherInitialTab !== 'projects') return 'current';
    if (RESEARCHER_PROJECTS_SUBTABS.includes(requestedProjectsTab)) return requestedProjectsTab;
    if (legacyMappedProjectsTab) return legacyMappedProjectsTab;
    return 'current';
  })();

  switch (currentUser.role) {
    case "nonprofit":
      return <NonprofitDashboard user={currentUser} initialTab={nonprofitInitialTab} />;
    case "researcher":
      return (
        <ResearcherDashboard
          user={currentUser}
          initialTab={researcherInitialTab}
          initialProjectsTab={researcherInitialProjectsTab}
        />
      );
    case "admin":
      return <AdminDashboard user={currentUser} />;
    default:
      return (
        <div className="alert alert-info">Unknown role: {currentUser.role}</div>
      );
  }
}

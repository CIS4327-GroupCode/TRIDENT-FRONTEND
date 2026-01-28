import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

// Import nonprofit components
import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";
import SearchPreview from "../components/SearchPreview";

// Example dashboard components for each role
function NonprofitDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("projects");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjectSuccess = (project) => {
    setEditingProjectId(null);
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("projects");
  };

  const handleEdit = (projectId) => {
    setEditingProjectId(projectId);
    setActiveTab("create");
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setActiveTab("projects");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectList onEdit={handleEdit} onRefresh={refreshTrigger} />;
      case "create":
        return (
          <ProjectForm
            projectId={editingProjectId}
            onSuccess={handleProjectSuccess}
            onCancel={handleCancelEdit}
          />
        );
      case "browse":
        return <SearchPreview />;
      default:
        return <ProjectList onEdit={handleEdit} onRefresh={refreshTrigger} />;
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
              }}
            >
              My Projects
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
              }}
            >
              Browse Researchers
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "create" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "create"}
              aria-controls="create-panel"
              onClick={() => {
                setActiveTab("create");
                setEditingProjectId(null);
              }}
            >
              {editingProjectId ? "Edit Project" : "Create New Project"}
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

// Import the modularized components for researcher dashboard
import ProfileSection from "../components/researcherDash/ProfileSection";
import ProjectsInvolved from "../components/researcherDash/ProjectsInvolved";
import TentativeProjects from "../components/researcherDash/TentativeProjects";
import RatingFeedback from "../components/researcherDash/RatingFeedback";

function ResearcherDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("profile");

  // Function to render the active component based on the main state
  const renderMainContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection user={user} />;
      case "projects":
        return <ProjectsInvolved />;
      case "tentative":
        return <TentativeProjects />;
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
          Track your projects and manage collaboration invitations
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
              className={`nav-link ${
                activeTab === "tentative" ? "active" : ""
              }`}
              role="tab"
              aria-selected={activeTab === "tentative"}
              aria-controls="tentative-panel"
              onClick={() => setActiveTab("tentative")}
            >
              Tentative Projects
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
              Rating & Feedback
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

  switch (currentUser.role) {
    case "nonprofit":
      return <NonprofitDashboard user={currentUser} />;
    case "researcher":
      return <ResearcherDashboard user={currentUser} />;
    case "admin":
      return <AdminDashboard user={currentUser} />;
    default:
      return (
        <div className="alert alert-info">Unknown role: {currentUser.role}</div>
      );
  }
}

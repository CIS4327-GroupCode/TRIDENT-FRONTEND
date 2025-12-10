import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

// Import nonprofit components
import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";

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
      default:
        return <ProjectList onEdit={handleEdit} onRefresh={refreshTrigger} />;
    }
  };

  return (
    <div className="page-root">
      <TopBar />
      <main className="page-content container py-5">
        <h1 className="mb-4">Nonprofit Dashboard</h1>
        <p className="text-muted mb-4">
          Welcome, {user.profile?.name || user.name}! ({user.email})
        </p>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("projects");
                setEditingProjectId(null);
              }}
            >
              My Projects
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "create" ? "active" : ""}`}
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
        // Pass the user prop down to the ProfileSection
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
      <main className="page-content container py-5">
        <h1 className="mb-4">Researcher Dashboard</h1>

        {/* Main Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Information
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              Projects Involved
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "tentative" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tentative")}
            >
              Tentative Projects
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "rating" ? "active" : ""}`}
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

  if (!currentUser) {
    return (
      <div className="alert alert-warning">
        You must be logged in to view the dashboard.
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

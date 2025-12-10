import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import ProfileSettings from "../components/settings/ProfileSettings";
import PasswordSettings from "../components/settings/PasswordSettings";
import PreferencesSettings from "../components/settings/PreferencesSettings";
import OrganizationSettings from "../components/settings/OrganizationSettings";
import ResearcherSettings from "../components/settings/ResearcherSettings";
import DangerZone from "../components/settings/DangerZone";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

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
      <div className="page-root">
        <TopBar />
        <main className="page-content container py-5">
          <div className="alert alert-warning">
            You must be logged in to view settings.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings user={currentUser} />;
      case "password":
        return <PasswordSettings />;
      case "preferences":
        return <PreferencesSettings />;
      case "organization":
        return currentUser.role === "nonprofit" ? (
          <OrganizationSettings />
        ) : null;
      case "researcher":
        return currentUser.role === "researcher" ? (
          <ResearcherSettings />
        ) : null;
      case "danger":
        return <DangerZone />;
      default:
        return <ProfileSettings user={currentUser} />;
    }
  };

  return (
    <div className="page-root">
      <TopBar />
      <main className="page-content container py-5">
        <h1 className="mb-4">Account Settings</h1>

        <div className="row">
          <div className="col-md-3">
            {/* Sidebar Navigation */}
            <div className="list-group">
              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "password" ? "active" : ""
                }`}
                onClick={() => setActiveTab("password")}
              >
                Password
              </button>
              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "preferences" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preferences")}
              >
                Notifications
              </button>

              {currentUser.role === "nonprofit" && (
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "organization" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("organization")}
                >
                  Organization
                </button>
              )}

              {currentUser.role === "researcher" && (
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "researcher" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("researcher")}
                >
                  Researcher Profile
                </button>
              )}

              <button
                className={`list-group-item list-group-item-action text-danger ${
                  activeTab === "danger" ? "active" : ""
                }`}
                onClick={() => setActiveTab("danger")}
              >
                Delete Account
              </button>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card">
              <div className="card-body">{renderContent()}</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

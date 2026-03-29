import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles.css";

function Root() {
  return (
    <App />
  );
}

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
	  <AuthProvider>
	    <Root />
	  </AuthProvider>
	</BrowserRouter>
);
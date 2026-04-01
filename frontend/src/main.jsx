import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ui/ToastContainer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles.css";

function Root() {
  return (
    <>
      <App />
      <ToastContainer />
    </>
  );
}

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
	  <AuthProvider>
	    <ToastProvider>
	      <Root />
	    </ToastProvider>
	  </AuthProvider>
	</BrowserRouter>
);
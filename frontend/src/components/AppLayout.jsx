// src/components/AppLayout.jsx
import React from "react";
import Navbar from "./Navbar.jsx";
import "./AppLayout.css";

/**
 * AppLayout
 * - Renders Navbar once for the whole app so the menu is always visible.
 * - Wraps page content in .app-content to provide consistent spacing and responsiveness.
 * - Use this component to wrap your <Routes> in App.jsx.
 */
export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">{children}</main>
    </div>
  );
}

// src/components/Navbar.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { getAllNotifications, getNotificationsByVoter } from "../api/notifications";
import "./Navbar.css";

export default function Navbar() {
  const { user, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [voterOpen, setVoterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const navRef = useRef(null);
  const hamburgerRef = useRef(null);
  const firstVoterLinkRef = useRef(null);

  const isLoggedIn = !!user;
  const isAdmin = !!user && (user.role === "admin" || user.isAdmin === true);

  const isPollRoute = (path = location.pathname) =>
    path === "/polls" ||
    path.startsWith("/polls/") ||
    path === "/voter/polls" ||
    path.startsWith("/voter/polls/");

  // Reliable mobile detection using matchMedia
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Keep menu open on poll routes; otherwise adapt to viewport
  useEffect(() => {
    if (isPollRoute()) {
      setMenuOpen(true);
    } else {
      setMenuOpen(!isMobile ? true : false);
    }
    setAdminOpen(false);
    setVoterOpen(false);
  }, [location.pathname, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open voter dropdown on mobile when menu opens
  useEffect(() => {
    if (isMobile && menuOpen && isLoggedIn && !isAdmin) {
      setVoterOpen(true);
    } else if (!menuOpen) {
      setVoterOpen(false);
    }
  }, [isMobile, menuOpen, isLoggedIn, isAdmin]);

  // Focus first voter link when voter dropdown opens on mobile
  useEffect(() => {
    if (isMobile && voterOpen && firstVoterLinkRef.current) {
      const t = setTimeout(() => {
        try { firstVoterLinkRef.current.focus(); } catch {}
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isMobile, voterOpen]);

  // Close dropdowns on Escape and outside click; keep menuOpen on poll routes
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setAdminOpen(false);
        setVoterOpen(false);
        if (!isPollRoute()) setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    function onClickOutside(e) {
      const navEl = navRef.current;
      const hamEl = hamburgerRef.current;
      if (!navEl) return;
      if (!navEl.contains(e.target) && (!hamEl || !hamEl.contains(e.target))) {
        setAdminOpen(false);
        setVoterOpen(false);
        if (!isPollRoute()) setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []); // stable handlers

  // Notifications polling
  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        if (!mounted) return;
        if (isAdmin) {
          const res = await getAllNotifications();
          const items = Array.isArray(res?.data) ? res.data : [];
          setUnreadCount(items.filter((n) => !n.isRead).length);
        } else if (isLoggedIn && user?.voterId) {
          const res = await getNotificationsByVoter(user.voterId);
          const items = Array.isArray(res?.data) ? res.data : [];
          setUnreadCount(items.filter((n) => !n.isRead).length);
        } else {
          setUnreadCount(0);
        }
      } catch {
        // ignore
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [isAdmin, isLoggedIn, user?.voterId]);

  const handleLogout = () => {
    setAuth(null);
    try {
      localStorage.removeItem("app_user");
      localStorage.removeItem("app_token");
    } catch {}
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  // Close menu when navigating via links on mobile unless target is a poll route
  const handleNavClick = (to) => {
    if (typeof to === "string") {
      if (!isPollRoute(to) && isMobile) setMenuOpen(false);
      else if (isPollRoute(to)) setMenuOpen(true);
    } else {
      if (!isPollRoute() && isMobile) setMenuOpen(false);
    }
    setAdminOpen(false);
    setVoterOpen(false);
  };

  const toggleAdmin = () => { setAdminOpen((s) => !s); setVoterOpen(false); };
  const toggleVoter = () => { setVoterOpen((s) => !s); setAdminOpen(false); };

  return (
    <header className="navbar" role="navigation" aria-label="Main navigation" ref={navRef}>
      <NavLink to="/" className="nav-logo" onClick={() => handleNavClick("/")}>
        🗳️ Online Voting
        {isLoggedIn && <span className={`role-badge ${isAdmin ? "admin" : "voter"}`}>{isAdmin ? "Admin" : "Voter"}</span>}
      </NavLink>

      <button
        ref={hamburgerRef}
        className={`hamburger ${menuOpen ? "open" : ""}`}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="navbar-links"
        onClick={() => setMenuOpen((s) => !s)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="navbar-links"
        className={`nav-links ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen && isMobile}
      >
        <NavLink to="/" className={linkClass} onClick={() => handleNavClick("/")}>Home</NavLink>
        <NavLink to="/about" className={linkClass} onClick={() => handleNavClick("/about")}>About Us</NavLink>

        {!isLoggedIn && (
          <>
            <NavLink to="/register" className={linkClass} onClick={() => handleNavClick("/register")}>Register</NavLink>
            <NavLink to="/login" className={linkClass} onClick={() => handleNavClick("/login")}>Login</NavLink>
          </>
        )}

        {isLoggedIn && !isAdmin && (
          <>
            <div className={`dropdown ${voterOpen ? "open" : ""}`}>
              <button
                className="dropdown-toggle nav-link"
                onClick={toggleVoter}
                aria-expanded={voterOpen}
                aria-controls="voter-menu"
                aria-haspopup="menu"
              >
                Voter Menu ▾
              </button>

              <div id="voter-menu" className="dropdown-menu" role="menu" aria-hidden={!voterOpen}>
                <NavLink
                  to="/profile"
                  className={linkClass}
                  onClick={() => handleNavClick("/profile")}
                  ref={(el) => { firstVoterLinkRef.current = el; }}
                >
                  Profile
                </NavLink>

                <NavLink to="/vote" className={linkClass} onClick={() => handleNavClick("/vote")}>Cast Vote</NavLink>
                <NavLink to="/voter/polls" className={linkClass} onClick={() => handleNavClick("/voter/polls")}>Active Polls</NavLink>
                <NavLink to="/results" className={linkClass} onClick={() => handleNavClick("/results")}>Results</NavLink>
                <NavLink to="/feedback" className={linkClass} onClick={() => handleNavClick("/feedback")}>Feedback</NavLink>
                <NavLink to="/change-password" className={linkClass} onClick={() => handleNavClick("/change-password")}>Change Password</NavLink>
                <NavLink to="/my-notifications" className={linkClass} onClick={() => handleNavClick("/my-notifications")}>
                  Notifications{unreadCount > 0 && <span className="nav-badge" aria-hidden>{unreadCount}</span>}
                </NavLink>
              </div>
            </div>

            <NavLink to="/results" className={linkClass} onClick={() => handleNavClick("/results")}>Results</NavLink>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/dashboard" className={linkClass} onClick={() => handleNavClick("/dashboard")}>Dashboard</NavLink>

            <div className={`dropdown ${adminOpen ? "open" : ""}`}>
              <button
                className="dropdown-toggle nav-link"
                onClick={toggleAdmin}
                aria-expanded={adminOpen}
                aria-controls="admin-menu"
                aria-haspopup="menu"
              >
                Admin Tools ▾
              </button>

              <div id="admin-menu" className="dropdown-menu" role="menu" aria-hidden={!adminOpen}>
                <NavLink to="/voters" className={linkClass} onClick={() => handleNavClick("/voters")}>Voters</NavLink>
                <NavLink to="/candidates" className={linkClass} onClick={() => handleNavClick("/candidates")}>Candidates</NavLink>
                <NavLink to="/elections" className={linkClass} onClick={() => handleNavClick("/elections")}>Elections</NavLink>
                <NavLink to="/parties" className={linkClass} onClick={() => handleNavClick("/parties")}>Parties</NavLink>
                <NavLink to="/polls" className={linkClass} onClick={() => handleNavClick("/polls")}>Polls</NavLink>
                <NavLink to="/admins" className={linkClass} onClick={() => handleNavClick("/admins")}>Admins</NavLink>
                <NavLink to="/results" className={linkClass} onClick={() => handleNavClick("/results")}>Results</NavLink>
                <NavLink to="/feedbacks" className={linkClass} onClick={() => handleNavClick("/feedbacks")}>Feedbacks</NavLink>
                <NavLink to="/notifications" className={linkClass} onClick={() => handleNavClick("/notifications")}>
                  Notifications{unreadCount > 0 && <span className="nav-badge" aria-hidden>{unreadCount}</span>}
                </NavLink>
                <NavLink to="/notifications/new" className={linkClass} onClick={() => handleNavClick("/notifications/new")}>Create Notification</NavLink>
                <NavLink to="/admin/reports" className={linkClass} onClick={() => handleNavClick("/admin/reports")}>Reports</NavLink>
                <NavLink to="/admin/analytics" className={linkClass} onClick={() => handleNavClick("/admin/analytics")}>Analytics</NavLink>
              </div>
            </div>

            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

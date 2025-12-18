// src/App.jsx
// App routes: reads authenticated user from AuthContext and forwards user?.voterId
// into the VoterNotifications route so the component always receives a voterId prop.

import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import AuthProvider, { AuthContext } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";

/* Public pages */
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import VoterRegister from "./pages/VoterRegister.jsx";
import About from "./pages/About.jsx";

/* Admin pages */
import Dashboard from "./pages/Dashboard.jsx";
import Voters from "./pages/Voters.jsx";
import VoterForm from "./pages/VoterForm.jsx";
import Admins from "./pages/Admins.jsx";
import AdminForm from "./pages/AdminForm.jsx";
import Candidates from "./pages/Candidates.jsx";
import CandidateForm from "./pages/CandidateForm.jsx";
import Elections from "./pages/Elections.jsx";
import ElectionForm from "./pages/ElectionForm.jsx";
import Results from "./pages/Results.jsx";

/* Voter pages */
import Vote from "./pages/Vote.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

/* Parties / Polls / Feedback / Reports / Admin tools */
import Parties from "./pages/Parties.jsx";
import PartyForm from "./pages/PartyForm.jsx";
import Polls from "./pages/Polls.jsx";
import PollForm from "./pages/PollForm.jsx";
import PollResults from "./pages/PollResults.jsx";
import VoterPolls from "./pages/VoterPolls.jsx";
import VoterPollView from "./pages/VoterPollView.jsx";
import VoterPollResults from "./pages/VoterPollResults.jsx";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import ReportsHome from "./pages/admin/ReportsHome.jsx";
import ElectionReport from "./pages/admin/ElectionReport.jsx";
import TurnoutReport from "./pages/admin/TurnoutReport.jsx";
import PollReport from "./pages/admin/PollReport.jsx";
import FeedbackReport from "./pages/admin/FeedbackReport.jsx";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard.jsx";
import SecurityLogs from "./pages/admin/SecurityLogs.jsx";

/* Notifications */
import NotificationForm from "./pages/NotificationForm.jsx";
import NotificationList from "./pages/NotificationList.jsx";
import VoterNotifications from "./pages/VoterNotifications.jsx";

import "./App.css";

/**
 * AppRoutesInner consumes AuthContext and forwards user?.voterId into the
 * VoterNotifications route. This ensures the page receives voterId as soon
 * as the user is authenticated.
 */
function AppRoutesInner() {
  const { user } = useContext(AuthContext);
  const voterId = user?.voterId ?? null;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<VoterRegister />} />
      <Route path="/about" element={<About />} />

      {/* Admin-only routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
      <Route path="/voters" element={<ProtectedRoute role="admin"><Voters /></ProtectedRoute>} />
      <Route path="/voters/new" element={<ProtectedRoute role="admin"><VoterForm /></ProtectedRoute>} />
      <Route path="/voters/:id/edit" element={<ProtectedRoute role="admin"><VoterForm /></ProtectedRoute>} />
      <Route path="/candidates" element={<ProtectedRoute role="admin"><Candidates /></ProtectedRoute>} />
      <Route path="/candidates/new" element={<ProtectedRoute role="admin"><CandidateForm /></ProtectedRoute>} />
      <Route path="/candidates/:id/edit" element={<ProtectedRoute role="admin"><CandidateForm /></ProtectedRoute>} />
      <Route path="/admins" element={<ProtectedRoute role="admin"><Admins /></ProtectedRoute>} />
      <Route path="/admins/new" element={<ProtectedRoute role="admin"><AdminForm /></ProtectedRoute>} />
      <Route path="/admins/:id/edit" element={<ProtectedRoute role="admin"><AdminForm /></ProtectedRoute>} />

      {/* Election routes (admin) */}
      <Route path="/elections" element={<ProtectedRoute role="admin"><Elections /></ProtectedRoute>} />
      <Route path="/elections/new" element={<ProtectedRoute role="admin"><ElectionForm /></ProtectedRoute>} />
      <Route path="/elections/:id/edit" element={<ProtectedRoute role="admin"><ElectionForm /></ProtectedRoute>} />

      {/* Reporting routes (admin) */}
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ReportsHome /></ProtectedRoute>} />
      <Route path="/admin/reports/election/:electionId" element={<ProtectedRoute role="admin"><ElectionReport /></ProtectedRoute>} />
      <Route path="/admin/reports/turnout" element={<ProtectedRoute role="admin"><TurnoutReport /></ProtectedRoute>} />
      <Route path="/admin/reports/turnout/:electionId" element={<ProtectedRoute role="admin"><TurnoutReport /></ProtectedRoute>} />
      <Route path="/admin/reports/poll/:pollId" element={<ProtectedRoute role="admin"><PollReport /></ProtectedRoute>} />
      <Route path="/admin/reports/feedback" element={<ProtectedRoute role="admin"><FeedbackReport /></ProtectedRoute>} />
      <Route path="/admin/reports/feedback/:electionId" element={<ProtectedRoute role="admin"><FeedbackReport /></ProtectedRoute>} />

      <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AnalyticsDashboard /></ProtectedRoute>} />
      <Route path="/admin/security" element={<ProtectedRoute role="admin"><SecurityLogs /></ProtectedRoute>} />

      {/* Shared results */}
      <Route path="/results" element={<ProtectedRoute role={["voter", "admin"]}><Results /></ProtectedRoute>} />

      {/* Voter-only routes */}
      <Route path="/vote" element={<ProtectedRoute role="voter"><Vote /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="voter"><Profile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute role="voter"><ChangePassword /></ProtectedRoute>} />

      {/* Parties / Polls */}
      <Route path="/parties" element={<ProtectedRoute role="admin"><Parties /></ProtectedRoute>} />
      <Route path="/parties/new" element={<ProtectedRoute role="admin"><PartyForm /></ProtectedRoute>} />
      <Route path="/parties/:id/edit" element={<ProtectedRoute role="admin"><PartyForm /></ProtectedRoute>} />

      <Route path="/polls" element={<ProtectedRoute role="admin"><Polls /></ProtectedRoute>} />
      <Route path="/polls/new" element={<ProtectedRoute role="admin"><PollForm /></ProtectedRoute>} />
      <Route path="/polls/:id" element={<ProtectedRoute role="admin"><PollForm /></ProtectedRoute>} />
      <Route path="/polls/:id/results" element={<ProtectedRoute role="admin"><PollResults /></ProtectedRoute>} />

      <Route path="/voter/polls" element={<ProtectedRoute role="voter"><VoterPolls /></ProtectedRoute>} />
      <Route path="/voter/polls/:id" element={<ProtectedRoute role="voter"><VoterPollView /></ProtectedRoute>} />
      <Route path="/voter/polls/:id/results" element={<ProtectedRoute role="voter"><VoterPollResults /></ProtectedRoute>} />

      {/* Feedback */}
      <Route path="/feedback" element={<ProtectedRoute role="voter"><FeedbackForm /></ProtectedRoute>} />
      <Route path="/feedbacks" element={<ProtectedRoute role="admin"><FeedbackList /></ProtectedRoute>} />

      {/* Notifications (admin) */}
      <Route path="/notifications" element={<ProtectedRoute role="admin"><NotificationList /></ProtectedRoute>} />
      <Route path="/notifications/new" element={<ProtectedRoute role="admin"><NotificationForm /></ProtectedRoute>} />

      {/* Voter notifications: forward voterId from AuthContext */}
      <Route
        path="/my-notifications"
        element={
          <ProtectedRoute role="voter">
            <VoterNotifications voterId={voterId} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <AppRoutesInner />
      </AppLayout>
    </AuthProvider>
  );
}

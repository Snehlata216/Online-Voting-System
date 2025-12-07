// src/pages/Home.jsx
import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
          <img src="src/images/home/second.jpg" alt="Govt Certified" />
        <h1>Secure Online Voting Made Simple</h1>
        <p>
          Government-approved, trusted by corporates, NGOs, and housing societies.
        </p>
        <button className="cta-btn">Get Started</button>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="feature-grid">
          <div className="feature-card">
           <img src="src/images/home/feature1.jfif" alt="Govt Certified" />
            <h3>Govt. Certified</h3>
            <p>
              Tested and certified by STQC under Ministry of Electronics & IT, approved by MCA.
            </p>
          </div>
          <div className="feature-card">
              <img src="src/images/home/mission.jfif" alt="Govt Certified" />
            <h3>Easy & Fast</h3>
            <p>
              Vote directly from your mobile or laptop in seconds, no queues or travel required.
            </p>
          </div>
          <div className="feature-card">
            <img src="src/images/home/teamwork.jfif" alt="Govt Certified" />
            <h3>Cost Effective</h3>
            <p>
              Save time and money with our efficient online voting platform.
            </p>
          </div>
          <div className="feature-card">
            <img src="src/images/home/forth.jpg" alt="Govt Certified" />
            <h3>Feature Rich</h3>
            <p>
              Supports eVoting, eAGM, eAuction, and secure data rooms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

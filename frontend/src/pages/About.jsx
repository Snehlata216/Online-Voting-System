// src/pages/AboutUs.jsx
import React from "react";
import "./AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Intro */}
      <section className="intro">
        <h1>About Us</h1>
        <p>
          Just like mobile banking transformed cash transactions, we are transforming elections
          by making voting accessible from anywhere, anytime.
        </p>
      </section>

      {/* Mission */}
      <section className="mission">
        <h2>Our Mission</h2>
       <img src="src/images/about/third.jpg" alt="Govt Certified" />
        <p>
          To empower organizations with secure, transparent, and cost-effective online elections,
          ensuring every vote counts.
        </p>
      </section>

      {/* Industries Served */}
      <section className="industries">
        <h2>Industries We Serve</h2>
        <div className="industry-grid">
          <div className="industry-card">Housing Societies</div>
          <div className="industry-card">Corporates</div>
          <div className="industry-card">Colleges & Universities</div>
          <div className="industry-card">NGOs</div>
          <div className="industry-card">Unions</div>
        </div>
      </section>

      {/* Team */}
      <section className="team">
        <h2>Our Team</h2>
        <div className="team-grid">
          <div className="team-card">
            <img
              src="src/images/about/elletakesphotos.jpg"
              alt="Team member"
            />
            <h3>Jane Doe</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="team-card">
            <img
              src="src/images/about/melo.jpg"
              alt="Team member"
            />
            <h3>John Smith</h3>
            <p>CTO</p>
          </div>
          <div className="team-card">
            <img
              src="src/images/about/simon-robben.jpg"
              alt="Team member"
            />
            <h3>Michele</h3>
            <p>Director</p>
          </div>
          <div className="team-card">
            <img
              src="src/images/about/stefanstefancik.jpg"
              alt="Team member"
            />
            <h3>Alice</h3>
            <p>Manager</p>
          </div>
        </div>
      </section>
    </div>
  );
}

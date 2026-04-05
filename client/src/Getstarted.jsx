import React from 'react';
import { Truck, ArrowRight, CheckCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './Getstarted.css';
import driverImg from './photo/driverimg.jpg';

const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="gs-container">
      <header className="gs-header">
        <div className="gs-logo-box">
          <Truck size={20} color="white" strokeWidth={2.5} />
        </div>
        <span className="gs-brand">Wesselli</span>
        <ThemeToggle />
      </header>

      <div className="gs-hero">
        <div className="gs-image-wrapper">
          <img src={driverImg} alt="Driver" className="gs-image" />
          <div className="gs-badge">
            <CheckCircle size={13} strokeWidth={2.5} />
            <span>VERIFIED CARRIERS</span>
          </div>
        </div>
      </div>

      <main className="gs-content">
        <h2 className="gs-title">Seamless Logistics</h2>
        <p className="gs-description">
          Connecting truckers and businesses for fast, reliable deliveries across Algeria.
        </p>
      </main>

      <footer className="gs-actions">
        <button className="gs-btn-primary" onClick={onGetStarted}>
          Get Started
          <span className="gs-arrow"><ArrowRight size={20} strokeWidth={2.5} /></span>
        </button>
        <button className="gs-btn-secondary" onClick={onLogin}>
          Log In
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;
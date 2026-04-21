import ThemeToggle from "./ThemeToggle";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "./photo/Logo.svg";
import "./AboutUsPage.css";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function AboutUsPage({ onBack }) {
  const socialAccounts = [
    {
      label: "Instagram",
      handle: "wesselli",
      url: "https://instagram.com/wesselli",
      icon: Instagram,
    },
    {
      label: "Facebook",
      handle: "wesselli",
      url: "https://facebook.com/wesselli",
      icon: Facebook,
    },
    {
      label: "LinkedIn",
      handle: "wesselli",
      url: "https://linkedin.com/company/wesselli",
      icon: Linkedin,
    },
  ];

  return (
    <div className="about-screen">
      <div className="about-container">
        <div className="about-header">
          <button className="about-back-btn" onClick={onBack} type="button">
            <BackIcon />
          </button>
          <h1 className="about-title">About Wesselli</h1>
          <ThemeToggle />
        </div>

        <div className="about-body">
          <div className="about-logo-wrap">
            <img src={logo} alt="Wesselli logo" className="about-logo" />
          </div>

          <div className="about-card">
            <p className="about-text">
              Wesselli is a Multi-Sided digital platform designed to help in Delivery Operations for
              small and medium businesses as well as independent Truckers.
            </p>
            <p className="about-text">
              Where we connect shippers with truckers to achieve explained objectives.
            </p>
          </div>

          <div className="about-social-card">
            <h2 className="about-social-title">Find us online</h2>
            <div className="about-social-list">
              {socialAccounts.map((account) => (
                <a
                  key={account.label}
                  className="about-social-item"
                  href={account.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="about-social-left">
                    <span className="about-social-icon" aria-hidden="true">
                      <account.icon size={15} strokeWidth={2.2} />
                    </span>
                    <span className="about-social-platform">{account.label}</span>
                  </span>
                  <span className="about-social-handle">@{account.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import "./Regestration.css";

import myIcon from "./photo/Icon.svg";
import mysender from "./photo/Icon(2).svg";
import mytrucker from "./photo/Icon(1).svg";

export default function Regestration() {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  // Function to handle sending role to backend
  async function Send() {
    if (!selectedRole) {
      alert("Choose one of the two roles or click Skip");
      return;
    }

    try {
      const res = await fetch("http://your-backend.com/reset-password", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: selectedRole,
      });

      if (res.ok) {
        // Redirect to next page
        navigate("/ramzi"); // 
      } else {
        alert("Error sending role");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <Link to="/ramzi">
          <img src={myIcon} alt="back" className="back-icon" />
        </Link>
        <h1 className="regestration">Registration</h1>
      </div>

      {/* STEP SECTION */}
      <div className="step-section">
        <div className="step-top">
          <span className="account-text">Account Setup</span>
          <span className="step-badge">STEP 2 OF 3</span>
        </div>

        <div className="progressbarr">
          <div className="progressfilll"></div>
        </div>
      </div>

      {/* TITLE */}
      <div className="title-section">
        <h1>Tell us who you are</h1>
        <p>Select the role that best describes how you will use Wesseli.</p>
      </div>

      {/* TRUCKER CARD */}
      <div
        className={`card ${selectedRole === "trucker" ? "active" : ""}`}
        onClick={() => setSelectedRole("trucker")}
      >
        <div className="card-left">
          <div className="icon-box">
            <img src={mytrucker} alt="trucker" />
          </div>

          <div>
            <h3>Trucker</h3>
            <p>I want to deliver goods and earn money</p>
          </div>
        </div>

        <div className="radio">
          {selectedRole === "trucker" && <div className="radio-fill"></div>}
        </div>
      </div>

      {/* SENDER CARD */}
      <div
        className={`card ${selectedRole === "sender" ? "active" : ""}`}
        onClick={() => setSelectedRole("sender")}
      >
        <div className="card-left">
          <div className="icon-box">
            <img src={mysender} alt="sender" />
          </div>

          <div>
            <h3>Businessman/Sender</h3>
            <p>I want to ship items to customers or partners</p>
          </div>
        </div>

        <div className="radio">
          {selectedRole === "sender" && <div className="radio-fill"></div>}
        </div>
      </div>

      {/* BUTTON */}
      <button
  className="create-btn"
  onClick={Send}   // still correct
>
  Create Account
</button>

      {/* SKIP LINK */}
      <Link to="/skip">
        <p className="skip">Skip for now</p>
      </Link>
    </div>
  );
}
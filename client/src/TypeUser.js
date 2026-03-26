import mylogo from "./photo/Logo.svg";
import photo from "./photo/Image.svg";
import photo1 from "./photo/Image(1).svg";
import ThemeToggle from "./ThemeToggle";
import './App.css';
import { useState } from "react";

export default function TypeUser() {
  const [selected, setSelected] = useState(null);
  
  const handleNext = () => {
    if (!selected) {
      alert("Please select a role");
      return;
    }
    console.log("Selected Role:", selected);
  };
  
  return (
    <div>
      <div className="container">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <h1 style={styles.title}>Are you...?</h1>
            <ThemeToggle />
          </div>

          <div style={styles.cardContainer}>
            <div
              onClick={() => setSelected("trucker")}
              style={{
                ...styles.card,
                border: selected === "trucker" ? "2px solid #22c55e" : "2px solid var(--border-color)",
              }}
            >
              <img src={photo1} alt="Trucker" style={styles.image} />
              <p style={styles.text}>Trucker / Delivery person</p>
            </div>

            <div
              onClick={() => setSelected("shipper")}
              style={{
                ...styles.card,
                border: selected === "shipper" ? "2px solid #22c55e" : "2px solid var(--border-color)",
              }}
            >
              <img src={photo} alt="Shipper" style={styles.image} />
              <p style={styles.text}>Shipper / Business</p>
            </div>
          </div>

          <button style={styles.button} onClick={handleNext} className="button_user">
            Next
          </button>
        </div>
        
        <img src={mylogo} alt="logo" className="mylogo" />
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "80px",
    fontFamily: "Arial",
    position: "relative",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginBottom: "30px",
  },
  card: {
    width: "220px",
    padding: "20px",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "0.3s",
    background: "var(--bg-secondary)",
  },
  image: {
    width: "80px",
    marginBottom: "15px",
  },
  text: {
    fontWeight: "bold",
    color: "var(--text-primary)",
  },
  button: {
    padding: "10px 40px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#22c55e",
    color: "white",
    cursor: "pointer",
    width: "500px",
    marginTop: "80px",
    transition: "background 0.15s ease",
  },
};
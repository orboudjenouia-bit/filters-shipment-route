import mylogo from "./photo/Logo.svg";
import photo from "./photo/Image.svg";
import photo1 from "./photo/Image(1).svg";
import './App.css';
//import "./PasswordReset.css";
import { useState } from "react";

export default function TypeUser() {
   const [selected, setSelected] = useState(null);
  
    const handleNext = () => {
      if (selected) {
        alert("Please select a role");
        return;
      }
      console.log("Selected Role:", selected);
    };
  
  return (
    <div>
      <div className="container">
        {/* Circles */}
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
<div style={styles.container}>
      <h1 style={styles.title}>Are you...?</h1>

      <div style={styles.cardContainer}>
        {/* Trucker */}
        <div
          onClick={() => setSelected("trucker")}
          style={{
            ...styles.card,
            border:
              selected === "trucker"
                ? "2px solid rgb(1, 0, 0)"
                : "2px solid #ccc",
          }}
        >
          <img
            src={photo1}
            alt="Trucker"
            style={styles.image}
          />
          <p style={styles.text}>Trucker / Delivery person</p>
        </div>

        {/* Shipper */}
        <div
          onClick={() => setSelected("shipper")}
          style={{
            ...styles.card,
            border:
              selected === "shipper"
                ? "2px solid #080808"
                : "2px solid #ccc",
          }}
        >
          <img
            src={photo}
            alt="Shipper"
            style={styles.image}
          />
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
  },
  title: {
    marginBottom: "30px",
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
  },
  image: {
    width: "80px",
    marginBottom: "15px",
  },
  text: {
    fontWeight: "bold",
  },
  button: {
    padding: "10px 40px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#000000",
    color: "white",
    cursor: "pointer",
    width:"500px",
    marginTop: "80px", 
  },
  
};

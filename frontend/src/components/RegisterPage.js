import React, { useState } from "react";
import logo from "../assets/schedulr-logo-square.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import backgroundMotif from "../assets/background-motif.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("registerStep1");
    return savedData
      ? JSON.parse(savedData)
      : {
          fullName: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        };
  });

  useEffect(() => {
    const isCompleted = localStorage.getItem("registerComplete");
    if (isCompleted === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("registerStep1", JSON.stringify(updated));
      return updated;
    });
  };

  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    navigate("/nextregister");
  };

  return (
    <div
      className="columns is-gapless is-fullheight"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "clamp(0.875rem, 1vw, 1rem)",
        lineHeight: 1.6,
        fontWeight: 400,
      }}
    >
      {/* Left Panel */}
      <div
        className="column is-half"
        style={{
          backgroundColor: "#0F172A",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt="Schedulr Logo"
          style={{
            objectFit: "contain",
            width: "clamp(100px, 50vw, 600px)",
          }}
        />
      </div>

      {/* Right Panel - Form */}
      <div
        className="column is-half"
        style={{
          backgroundImage: `url(${backgroundMotif})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h2
            className="has-text-grey-dark has-text-centered"
            style={{
              fontSize: "clamp(1.50rem, 4vw, 1.75rem)",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Register your account
          </h2>
          <p
            className="has-text-grey has-text-centered"
            style={{
              fontSize: "clamp(0.8rem, 1.2vw, 0.9rem)",
              fontWeight: 400,
              marginBottom: "4rem",
            }}
          >
            Please fill out the information below
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="field">
              <label
                className="label"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: "0.1rem",
                }}
              >
                Full Name
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="fullName"
                  placeholder="Enter your Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="field">
              <label
                className="label"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: "0.1rem",
                }}
              >
                Username
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="username"
                  placeholder="Enter your Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="field">
              <label
                className="label"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: "0.1rem",
                }}
              >
                Email
              </label>
              <div className="control">
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label
                className="label"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: "0.1rem",
                }}
              >
                Password
              </label>
              <div className="control">
                <input
                  className="input"
                  type="password"
                  name="password"
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div
              className="field"
              style={{
                marginBottom: "2.5rem", // ✅ Tambahin jeda di bawah field ini
              }}
            >
              <label
                className="label"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: "0.1rem",
                }}
              >
                Re-Type Password
              </label>
              <div className="control">
                <input
                  className="input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-Type your Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="has-text-centered my-4">
              <span
                className="has-text-centered"
                style={{
                  fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
                  fontWeight: 400,
                  color: "#0D1A2A",
                  background: "none",
                  border: "none",
                  marginBottom: "0.1rem",
                }}
              >
                By signing up, you agree to our Terms of Service
              </span>
            </div>
            {/* Error Message */}
            {errorMessage && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                }}
              >
                {errorMessage}
              </p>
            )}

            <div className="field">
              <button
                type="submit"
                className="button is-fullwidth"
                style={{
                  fontSize: "clamp(0.95rem, 1vw, 1.1rem)",
                  fontWeight: 600,
                  backgroundColor: "#0F172A",
                  color: "#ffffff",
                }}
              >
                Next Page
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

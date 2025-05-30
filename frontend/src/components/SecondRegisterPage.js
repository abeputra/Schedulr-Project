import React, { useState } from "react";
import logo from "../assets/schedulr-logo-square.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import backgroundMotif from "../assets/background-motif.png";

const SecondRegisterPage = () => {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("registerStep2");
    return savedData
      ? JSON.parse(savedData)
      : {
          phoneNumber: "",
          country: "",
          address: "",
          gender: "",
          dob: "",
        };
  });

  useEffect(() => {
    const step1 = localStorage.getItem("registerStep1");
    if (!step1) {
      // Kalau belum isi step 1, kembalikan user
      navigate("/register");
    }

    const isCompleted = localStorage.getItem("registerComplete");
    if (isCompleted === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "password" || name === "confirmPassword") {
        if (updated.password !== updated.confirmPassword) {
          setPasswordError("Passwords do not match");
        } else {
          setPasswordError("");
        }
      }
      localStorage.setItem("registerStep2", JSON.stringify(updated)); // ✅ Simpan ke registerStep2
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const step1 = JSON.parse(localStorage.getItem("registerStep1"));
    const step2 = JSON.parse(localStorage.getItem("registerStep2"));

    if (!step1 || !step2) {
      alert("Data tidak lengkap!");
      return;
    }

    if (step1.password !== step1.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const fullData = {
      full_name: step1.fullName,
      username: step1.username,
      email: step1.email,
      password: step1.password,
      phone_number: step2.phoneNumber,
      country: step2.country,
      address: step2.address,
      gender: step2.gender,
      dob: step2.dob,
    };

    try {
      await axios.post("http://20.115.99.118:5000/api/register", fullData);

      // ✅ Clear localStorage hanya setelah submit sukses
      localStorage.removeItem("registerStep1");
      localStorage.removeItem("registerStep2");
      localStorage.setItem("registerComplete", "true");

      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Failed to register. Please try again.");
    }
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
            {/* Phone Number */}
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
                Phone Number
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter your Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Country */}
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
                Country
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="country"
                  placeholder="Enter your Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
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
                Address
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="address"
                  placeholder="Enter your Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Gender */}
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
                Gender
              </label>
              <div className="control">
                <select
                  className="input"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Date of Birth */}
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
                Date of Birth
              </label>
              <div className="control">
                <input
                  className="input"
                  type="date"
                  name="dob"
                  placeholder="Enter your Date of Birth"
                  value={formData.dob}
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
                Submit Data
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecondRegisterPage;

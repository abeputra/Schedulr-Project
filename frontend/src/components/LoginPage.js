import React, { useState, useEffect } from "react";
import { FaGoogle } from "react-icons/fa";
import logo from "../assets/schedulr-logo-square.png";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import backgroundMotif from "../assets/background-motif.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Hapus sisa data registrasi
    localStorage.removeItem("registerStep1");
    localStorage.removeItem("registerStep2");
    localStorage.removeItem("registerComplete");
    localStorage.removeItem("registerData");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://20.115.99.118:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Login success:", data);
        localStorage.setItem("token", data.token);

        // Optional: decode token to get user info
        const decoded = jwtDecode(data.token);
        console.log("Decoded token:", decoded);

        navigate("/dashboard"); // Redirect setelah login sukses
      } else {
        console.error("Login failed:", data.error);
        alert(data.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div
      className="columns is-gapless is-fullheight"
      style={{
        backgroundImage: `url(${backgroundMotif})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)",
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

      {/* Right Panel */}
      <div
        className="column is-half"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h2
            className="has-text-grey-dark has-text-centered"
            style={{
              fontSize: "clamp(1.50rem, 4vw, 1.75rem)",
              fontWeight: 700,
              marginBottom: "0.1rem",
            }}
          >
            Great to see you again!
          </h2>
          <p
            className="has-text-grey has-text-centered"
            style={{
              fontSize: "clamp(0.8rem, 1.2vw, 0.9rem)",
              fontWeight: 400,
              marginBottom: "4rem",
            }}
          >
            Log in and keep things running smoothly
          </p>

          <form onSubmit={handleLogin}>
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
                Enter Your Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  marginBottom: "0.3rem",
                }}
              />
            </div>

            <div className="field">
              <label
                className="label"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0D1A2A",
                  marginBottom: "0.1rem",
                }}
              >
                Enter Your Password
              </label>
              <input
                className="input"
                type="password"
                placeholder="Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="field mb-2">
              <button
                type="submit"
                className="button is-fullwidth"
                style={{
                  fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                  fontWeight: 600,
                  marginBottom: "2rem",
                }}
              >
                LOGIN
              </button>
            </div>

            <div className="has-text-centered">
              <button
                type="button"
                className="is-clickable"
                style={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontWeight: 700,
                  color: "#0D1A2A",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  marginBottom: "0.1rem",
                }}
              >
                FORGOT PASSWORD?
              </button>
            </div>
          </form>

          <div className="has-text-centered my-4">
            <hr
              style={{
                marginTop: "0.5rem",
                marginBottom: "1rem",
              }}
            />
            <span
              className="has-text-centered"
              style={{
                fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
                fontWeight: 700,
                color: "#0D1A2A",
                background: "none",
                border: "none",
                marginBottom: "0.1rem",
              }}
            >
              OR
            </span>
          </div>

          <div className="buttons is-centered">
            <a
              className="button is-light"
              href="http://20.115.99.118:5000/auth/google"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FaGoogle size={20} />
              Continue with Google
            </a>
          </div>

          <p
            className="has-text-centered mt-4"
            style={{
              fontSize: "clamp(0.9rem, 1vw, 1rem)",
              fontWeight: 700,
              color: "#0D1A2A",
              background: "none",
              border: "none",
            }}
          >
            Don’t have an account?{" "}
            <span
              className="has-text-centered is-clickable"
              onClick={() => navigate("/register")}
              style={{
                fontWeight: 700,
                fontSize: "clamp(0.9rem, 1vw, 1rem)",
                color: "#F38B40",
                background: "none",
                border: "none",
                marginTop: "0.1rem",
              }}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

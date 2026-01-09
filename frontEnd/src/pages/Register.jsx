import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "player",
    companyName: "", // NEW: for advertisers
    status: "inactive"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    // Advertiser-specific validation
    if (formData.role === "advertiser" && !formData.companyName) {
      setError("Company name is required for advertisers");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Choose endpoint based on role
      const endpoint = formData.role === "advertiser" 
        ? '/register-advertiser' 
        : '/register';

      // Prepare request body based on role
      const requestBody = formData.role === "advertiser"
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            status: formData.status
          };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        
        // Different messages for advertiser vs other roles
        if (formData.role === "advertiser") {
          alert('Advertiser registration successful! Your account is pending operator approval. Please login after approval.');
        } else {
          alert('Registration successful! Please login with your credentials.');
        }
        
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              name="name"
              autoComplete="username"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter username (no spaces)"
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
              disabled={loading}
            >
              <option value="player">Player</option>
              <option value="leagueOwner">League Owner</option>
              <option value="advertiser">Advertiser</option> 
            </select>
          </div>

          {/* Show company name field only for advertisers */}
          {formData.role === "advertiser" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your company name"
                disabled={loading}
                required
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter password (min 6 characters)"
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Confirm your password"
              disabled={loading}
              required
            />
          </div>

          {formData.role === "advertiser" && (
            <div style={styles.infoBox}>
              ℹ️ Advertiser accounts require operator approval before you can login.
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "1rem"
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "450px"
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#333"
  },
  error: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "0.75rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    border: "1px solid #fcc"
  },
  infoBox: {
    backgroundColor: "#e7f3ff",
    color: "#0066cc",
    padding: "0.75rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    border: "1px solid #b3d9ff",
    fontSize: "0.9rem"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  formGroup: {
    marginBottom: "1rem"
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box",
    backgroundColor: "white"
  },
  hint: {
    display: "block",
    marginTop: "0.25rem",
    fontSize: "0.875rem",
    color: "#666"
  },
  button: {
    padding: "0.875rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "background-color 0.2s"
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed"
  },
  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
    color: "#666"
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500"
  }
};
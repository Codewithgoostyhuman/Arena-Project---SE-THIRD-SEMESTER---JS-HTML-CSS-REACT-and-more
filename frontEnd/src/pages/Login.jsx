import { useState, useEffect } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAs, setLoginAs] = useState("player");
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const role = user.role;
      switch (role) {
        case "operator":
          navigate("/operator", { replace: true });
          break;
        case "leagueowner":
          navigate("/league-owner", { replace: true });
          break;
        case "player":
          navigate("/player", { replace: true });
          break;
        case "advertiser":
          navigate("/advertiser", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Spectator bypass
    if (loginAs === "spectator") {
      navigate("/spectator");
      return;
    }

    if (!name || !password) {
      setError("Username and password are required");
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(name, password);
      console.log('Login result:', result);

      if (result.success && result.user) {

      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#ffebee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        

        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="name"
            placeholder="Username"
            autoComplete="username"
            disabled={loginAs === "spectator"}
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            disabled={loginAs === "spectator"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button
  type="button"
  onClick={() => navigate("/spectator")}
  style={{
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    fontSize: "1rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  }}
>
  Continue as Spectator
</button>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Don't have an account?{' '}
        <span 
          onClick={() => navigate('/register')}
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Register here
        </span>
      </p>
    </div>
  );
}
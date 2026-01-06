import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Access Denied</h1>

      <p>
        You do not have permission to access this page.
      </p>

      {user ? (
        <>
          <p>
            Logged in as: <strong>{user.name}</strong> ({user.role})
          </p>

          <p>
            Please navigate to a page that matches your role:
          </p>

          <ul>
            {user.role === "Operator" && (
              <li>
                <Link to="/operator">Operator Dashboard</Link>
              </li>
            )}

            {user.role === "LeagueOwner" && (
              <li>
                <Link to="/league-owner">League Owner Dashboard</Link>
              </li>
            )}

            {user.role === "Player" && (
              <li>
                <Link to="/player">Player Dashboard</Link>
              </li>
            )}
          </ul>
        </>
      ) : (
        <p>
          <Link to="/login">Go to Login</Link>
        </p>
      )}
    </div>
  );
}
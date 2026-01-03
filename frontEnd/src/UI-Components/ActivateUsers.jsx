import React, { useState, useEffect } from "react";
import { getUsers, activateUser, deactivateUser } from "../APIs/UserAPI";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await activateUser(userId);
      alert("User activated successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error activating user:", err);
      alert("Failed to activate user");
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await deactivateUser(userId);
      alert("User deactivated successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error deactivating user:", err);
      alert("Failed to deactivate user");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span style={{ 
                  color: user.status === "active" ? "green" : "orange",
                  fontWeight: "bold"
                }}>
                  {user.status}
                </span>
              </td>
              <td>
                {user.status === "active" ? (
                  <button onClick={() => handleDeactivate(user._id)}>
                    Deactivate
                  </button>
                ) : (
                  <button onClick={() => handleActivate(user._id)}>
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
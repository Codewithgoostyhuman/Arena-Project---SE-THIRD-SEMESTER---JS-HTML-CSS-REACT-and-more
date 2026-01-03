import { useState } from "react";
import { createUser } from "../APIs/UserAPI";
import { getUserByName } from "../APIs/UserAPI";
import React from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "pending",
  });
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/\s+/g, "");
    }

    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  // 1️⃣ Clean the username
  const cleanedName = formData.name.trim().replace(/\s+/g, ""); // remove all spaces
  if (!cleanedName) {
    alert("Please enter a valid username");
    return;
  }

  if (!formData.role) {
    alert("Please select a role");
    return;
  }

  // 2️⃣ Prepare cleaned form data
  const dataToSend = {
    ...formData,
    name: cleanedName,
  };

  try {
    // 3️⃣ Try to create the user
    const res = await createUser(dataToSend);
    console.log("Registered:", res.data);
    alert("User registered successfully");

    // 4️⃣ Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      status: "active",
    });

  } catch (err) {
    // 5️⃣ Handle errors
    // If backend says user already exists (409) or user not found (404)
    if (err.response?.status === 409) {
      alert("Username already taken");
    } else if (err.response?.status === 404) {
      // Sometimes getUser throws 404 → just create the user
      try {
        const res = await createUser(dataToSend);
        alert("User registered successfully");
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "",
          status: "active",
        });
      } catch (createErr) {
        console.error(createErr);
        alert("Registration failed");
      }
    } else {
      console.error(err);
      alert("Registration failed");
    }
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      {/* Name */}
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      {/* Email (HTML5 validation) */}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
      />

      {/* Password */}
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        minLength={6}
      />

      {/* Role Dropdown */}
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
      >
        <option value="">Select Role</option>
        <option value="player">Player</option>
        <option value="league-owner">League Owner</option>
        <option value="advertiser">Advertiser</option>
      </select>

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;

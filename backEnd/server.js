import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();
console.log("server.js file loaded");
//User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
//User model
const User = mongoose.model("User", UserSchema);
//connect to MongoDB
main().catch((err) => console.log(err));
//async function to connect to MongoDB
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
}
//get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
});
//get user by id
app.get("/user/id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
// Activate user by ID
app.patch("/user/activate/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User activated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error activating user:", err);
    res.status(500).json({ message: "Error activating user", error: err.message });
  }
});

// Deactivate user by ID 
app.patch("/user/deactivate/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deactivated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ message: "Error deactivating user", error: err.message });
  }
});
// Activate user by name 
app.patch("/user/activate/name/:name", async (req, res) => {
  try {
    const cleanedName = req.params.name.replace(/\s+/g, "");
    
    const updatedUser = await User.findOneAndUpdate(
      { name: cleanedName },
      { status: "active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User activated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error activating user:", err);
    res.status(500).json({ message: "Error activating user", error: err.message });
  }
});
//get user by name
app.get("/user/name/:name", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
//create a new user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Remove spaces from name
    const cleanedName = name.replace(/\s+/g, "");

    // Check if user with same name exists
    const existingUser = await User.findOne({ name: cleanedName });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }
    // Create new user
    const newUser = new User({
      name: cleanedName,
      email,
      password,
      role,
      status,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).send(err);
  }
});

//update user
app.put("/user/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send(err);
  }
});
// login user
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    const cleanedName = name.replace(/\s+/g, "");

    const user = await User.findOne({ name: cleanedName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account not active" });
    }

    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});




app
  .listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err.message);
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    }
  });

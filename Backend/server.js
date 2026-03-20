const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Existing routes
const helpRoutes = require("./routes/campus_assistant/helpRequest.route");

// ✅ New Feedback routes
const feedbackRoutes = require("./routes/FeedbackRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
app.use("/api/help", helpRoutes);

// ✅ Feedback API route
app.use("/api/feedback", feedbackRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log("Server running on " + PORT));
  })
  .catch((err) => console.log(err));
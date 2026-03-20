const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ==============================
   ROUTE IMPORTS
============================== */

// Campus Assistant
const helpRoutes = require("./routes/campus_assistant/helpRequest.route");

// Feedback
const feedbackRoutes = require("./routes/FeedbackRoutes");

// Lost & Found
const lostRoutes = require("./routes/Lost-Found_MS/lostRoutes");
const foundRoutes = require("./routes/Lost-Found_MS/foundRoutes");

/* ==============================
   MIDDLEWARE
============================== */
app.use(cors());
app.use(express.json());

// Access uploaded images
app.use("/uploads", express.static("uploads"));

/* ==============================
   TEST ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* ==============================
   API ROUTES
============================== */

// Campus Assistant Help Board
app.use("/api/help", helpRoutes);

// Feedback
app.use("/api/feedback", feedbackRoutes);

// Lost Item Management
app.use("/api/lost", lostRoutes);

// Found Item Management
app.use("/api/found", foundRoutes);

/* ==============================
   DATABASE CONNECTION
============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
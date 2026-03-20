const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Existing routes
const helpRoutes = require("./routes/campus_assistant/helpRequest.route");
const helpRequestRoutes = require("./routes/campus_assistant/helpRequest.route");

// ✅ New Feedback routes
const feedbackRoutes = require("./routes/FeedbackRoutes");


// Middleware
const app = express();

/* ==============================
   ROUTE IMPORTS
============================== */
const helpRoutes = require("./routes/campus_assistant/helpRequest.route");
const lostRoutes = require("./routes/Lost-Found_MS/lostRoutes");
const foundRoutes = require("./routes/Lost-Found_MS/foundRoutes");

/* ==============================
   MIDDLEWARE
============================== */
app.use(cors());
app.use(express.json());

// ✅ Access uploaded images
app.use("/uploads", express.static("uploads"));

/* ==============================
   TEST ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
app.use("/api/help", helpRoutes);

app.use("/api/help-requests", helpRequestRoutes);

// ✅ Feedback API route
app.use("/api/feedback", feedbackRoutes);

// MongoDB connection
/* ==============================
   API ROUTES
============================== */

// Campus Assistant Help Board
app.use("/api/help", helpRoutes);

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
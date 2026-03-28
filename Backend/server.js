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

// ✅ Feedback (FIXED PATH)
const feedbackRoutes = require("./routes/FeedbackRoutes/FeedbackRoutes");

// Lost & Found
const lostRoutes = require("./routes/Lost-Found_MS/lostRoutes");
const foundRoutes = require("./routes/Lost-Found_MS/foundRoutes");
const itemRoutes = require("./routes/Lost-Found_MS/itemRoutes");
const userRoutes = require("./routes/userManagement/userRoutes");
const LostFoundManagement = require("./routes/Lost-Found_MS/LostFoundManagement");


/* ==============================
   MIDDLEWARE
============================== */
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

/* ==============================
   TEST ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
app.use("/api/help", helpRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lostfound", LostFoundManagement);

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
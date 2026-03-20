const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const helpRoutes = require("./routes/helpRequest.route");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ✅ Help board API
app.use("/api/help", helpRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log("Server running on " + PORT));
  })
  .catch((err) => console.log(err));
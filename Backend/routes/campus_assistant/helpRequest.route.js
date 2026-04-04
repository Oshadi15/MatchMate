const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  getMyHelpRequests,
  replyToHelpRequest,
  updateHelpStatus,
  deleteHelpRequest,
} = require("../../controllers/campus_assistant/helpRequest.controller");

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// STUDENT ROUTES

// Create help request
router.post("/", upload.single("document"), createHelpRequest);

// Get only logged/requester student's own requests
router.get("/my-requests", getMyHelpRequests);

// Get one request by ID
router.get("/:id", getHelpRequestById);


// ADMIN ROUTES

// Get all help requests
router.get("/", getHelpRequests);

// Reply to a help request
router.patch("/:id/reply", replyToHelpRequest);

// Update request status
router.patch("/:id/status", updateHelpStatus);

// Delete help request
router.delete("/:id", deleteHelpRequest);

module.exports = router;
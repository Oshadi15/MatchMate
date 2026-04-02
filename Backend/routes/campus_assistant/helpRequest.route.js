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

// Routes
router.post("/", upload.single("document"), createHelpRequest);
router.get("/", getHelpRequests);
router.get("/my-requests", getMyHelpRequests);
router.get("/:id", getHelpRequestById);
router.patch("/:id/reply", replyToHelpRequest);
router.patch("/:id/status", updateHelpStatus);
router.delete("/:id", deleteHelpRequest);

module.exports = router;
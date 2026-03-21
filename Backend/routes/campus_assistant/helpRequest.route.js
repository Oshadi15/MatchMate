const express = require("express");
const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getMyHelpRequests,
  getHelpRequestById,
  replyToHelpRequest,      // ✅ ADD
  updateHelpStatus,        // ✅ ADD (optional, but useful)
  deleteHelpRequest,
} = require("../../controllers/campus_assistant/helpRequest.controller");

router.post("/", createHelpRequest);
router.get("/", getHelpRequests);

// ✅ keep BEFORE "/:id"
router.get("/mine", getMyHelpRequests);

// ✅ GET one
router.get("/:id", getHelpRequestById);

// ✅ REPLY
router.patch("/:id/reply", replyToHelpRequest);

// ✅ STATUS UPDATE (optional)
router.patch("/:id/status", updateHelpStatus);

router.delete("/:id", deleteHelpRequest);

module.exports = router;
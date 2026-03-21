const express = require("express");
const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getMyHelpRequests,
  getHelpRequestById, // ✅ added
  deleteHelpRequest,
} = require("../../controllers/campus_assistant/helpRequest.controller");

router.post("/", createHelpRequest);
router.get("/", getHelpRequests);

// ✅ keep this BEFORE "/:id" (important)
router.get("/mine", getMyHelpRequests);

// ✅ new route for reply page (get one request by id)
router.get("/:id", getHelpRequestById);

router.delete("/:id", deleteHelpRequest);

module.exports = router;
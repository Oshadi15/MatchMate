const express = require("express");
const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getMyHelpRequests,
  deleteHelpRequest,
} = require("../../controllers/campus_assistant/helpRequest.controller");

router.post("/", createHelpRequest);
router.get("/", getHelpRequests);
router.get("/mine", getMyHelpRequests);
router.delete("/:id", deleteHelpRequest);

module.exports = router;
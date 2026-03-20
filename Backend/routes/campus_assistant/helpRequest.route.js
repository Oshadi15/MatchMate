const router = require("express").Router();
const controller = require("../../controllers/campus_assistant/helpRequest.controller");

router.post("/", controller.createHelpRequest);
router.get("/", controller.getHelpRequests);
router.get("/:id", controller.getHelpRequestById);
router.patch("/:id/status", controller.updateHelpStatus);
router.delete("/:id", controller.deleteHelpRequest);

module.exports = router;
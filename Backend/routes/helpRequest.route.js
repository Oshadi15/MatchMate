const router = require("express").Router();
const helpController = require("../controllers/helpRequest.controller");

router.post("/", helpController.createHelpRequest);
router.get("/", helpController.getHelpRequests);
router.get("/:id", helpController.getHelpRequestById);
router.patch("/:id/status", helpController.updateHelpStatus);
router.delete("/:id", helpController.deleteHelpRequest);

module.exports = router;
const express = require("express");
const router = express.Router();
const claimController = require("../../controllers/Lost-Found_MS/ClaimController");

/* ================= CLAIM ROUTES ================= */
router.post("/", claimController.createClaim);
router.get("/", claimController.getAllClaims);
router.get("/:id", claimController.getClaimById);
router.put("/:id", claimController.updateClaim);
router.delete("/:id", claimController.deleteClaim);

module.exports = router;
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Lost-Found_MS/LostFoundManagementController");

/* ================= ROUTES ================= */
router.get("/items", controller.getAllItems);
router.delete("/items/:id", controller.deleteItem);
router.put("/items/:id", controller.updateItem);
router.patch("/items/status/:id", controller.updateStatus);
router.patch("/claim/:id", controller.handleClaim);

module.exports = router;
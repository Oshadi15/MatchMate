const express = require("express");
const router = express.Router();
const lostController = require("../../controllers/Lost-Found_MS/lostController");
const multer = require("multer");


// ===== MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// ===== ROUTES =====
router.post("/", upload.single("image"), lostController.createLostItem);

router.get("/", lostController.getAllLostItems);

router.get("/:id", lostController.getLostItemById);

router.put("/:id", upload.single("image"), lostController.updateLostItem);

router.delete("/:id", lostController.deleteLostItem);

module.exports = router;
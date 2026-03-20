const express = require("express");
const router = express.Router();
const foundController = require("../../controllers/Lost-Found_MS/foundController");
const multer = require("multer");


// ===== Multer Setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// ===== Routes =====
router.post(
  "/",
  upload.single("image"),
  foundController.createFoundItem
);

router.get("/", foundController.getAllFoundItems);

router.get("/:id", foundController.getFoundItemById);

router.put(
  "/:id",
  upload.single("image"),
  foundController.updateFoundItem
);

router.delete("/:id", foundController.deleteFoundItem);

module.exports = router;
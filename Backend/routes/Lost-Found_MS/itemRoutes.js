const express = require("express");
const router = express.Router();

const {
  getLostItems,
  getFoundItems,
  createLostItem,
  createFoundItem,
  getMyLostItems,
} = require('../../controllers/Lost-Found_MS/itemController');


router.get("/my-lost-items", getMyLostItems);


router.get("/lost-items", getLostItems);
router.get("/found-items", getFoundItems);

router.post("/lost-items", createLostItem);
router.post("/found-items", createFoundItem);


module.exports = router;
const Item= require("../../models/Lost-Found_MS/itemModel");

// @desc    Get recent lost items
// @route   GET /api/lost-items
// @access  Public
const getLostItems = async (req, res) => {
  try {
    const { name, date } = req.query;

    const filter = { type: "lost" };

    if (name) {
      filter.itemName = { $regex: name, $options: "i" };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lost items",
      error: error.message,
    });
  }
};

// @desc    Get recent found items
// @route   GET /api/found-items
// @access  Public
const getFoundItems = async (req, res) => {
  try {
    const { name, date } = req.query;

    const filter = { type: "found" };

    if (name) {
      filter.itemName = { $regex: name, $options: "i" };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch found items",
      error: error.message,
    });
  }
};

// @desc    Create lost item
// @route   POST /api/lost-items
// @access  Public
const createLostItem = async (req, res) => {
  try {
    const { itemName, date, location, image, description, reportedBy } = req.body;

    if (!itemName || !date || !location) {
      return res.status(400).json({
        message: "Item name, date, and location are required",
      });
    }

    const item = await Item.create({
      itemName,
      type: "lost",
      date,
      location,
      image,
      description,
      reportedBy,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create lost item",
      error: error.message,
    });
  }
};

// @desc    Create found item
// @route   POST /api/found-items
// @access  Public
const createFoundItem = async (req, res) => {
  try {
    const { itemName, date, location, image, description, reportedBy } = req.body;

    if (!itemName || !date || !location) {
      return res.status(400).json({
        message: "Item name, date, and location are required",
      });
    }

    const item = await Item.create({
      itemName,
      type: "found",
      date,
      location,
      image,
      description,
      reportedBy,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create found item",
      error: error.message,
    });
  }
};


const getMyLostItems = async (req, res) => {
  const email = req.query.email;
  
  console.log("Searching for items reported by:", email);

  try {
    if (!email) {
      return res.status(400).json({ message: "User email is required in query params" });
    }

    // This searches the 'reportedBy' field in your Item model
    const items = await Item.find({ 
      reportedBy: email, 
      type: "lost" 
    }).sort({ createdAt: -1 });

    console.log(`Found ${items.length} items for ${email}`);
    
    res.status(200).json(items);
  } catch (error) {
    console.error("Error in getMyLostItems:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLostItems,
  getFoundItems,
  createLostItem,
  createFoundItem,
  getMyLostItems,
};
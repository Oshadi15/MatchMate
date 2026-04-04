const Claim = require("../../models/Lost-Found_MS/ClaimModel");

/* ================= CREATE CLAIM ================= */
exports.createClaim = async (req, res) => {
  try {
    const {
      itemId,
      itemName,
      claimantName,
      email,
      contact,
      reason,
      status,
    } = req.body;

    if (!itemId || !itemName || !claimantName || !email || !contact || !reason) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const newClaim = new Claim({
      itemId,
      itemName,
      claimantName,
      email,
      contact,
      reason,
      status: status || "Pending",
    });

    const savedClaim = await newClaim.save();

    res.status(201).json({
      message: "Claim submitted successfully",
      claim: savedClaim,
    });
  } catch (error) {
    console.error("Error creating claim:", error);
    res.status(500).json({
      message: "Server error while submitting claim",
      error: error.message,
    });
  }
};

/* ================= GET ALL CLAIMS ================= */
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Claims fetched successfully",
      claims,
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({
      message: "Server error while fetching claims",
      error: error.message,
    });
  }
};

/* ================= GET SINGLE CLAIM ================= */
exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    res.status(200).json(claim);
  } catch (error) {
    console.error("Error fetching claim:", error);
    res.status(500).json({
      message: "Server error while fetching claim",
      error: error.message,
    });
  }
};

/* ================= UPDATE CLAIM BY ADMIN ================= */
exports.updateClaim = async (req, res) => {
  try {
    const { status, meetingDate, meetingTime, venue, adminNote } = req.body;

    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        status,
        meetingDate,
        meetingTime,
        venue,
        adminNote,
      },
      { new: true, runValidators: true }
    );

    if (!updatedClaim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    res.status(200).json({
      message: "Claim updated successfully",
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Error updating claim:", error);
    res.status(500).json({
      message: "Server error while updating claim",
      error: error.message,
    });
  }
};

/* ================= DELETE CLAIM ================= */
exports.deleteClaim = async (req, res) => {
  try {
    const deletedClaim = await Claim.findByIdAndDelete(req.params.id);

    if (!deletedClaim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    res.status(200).json({
      message: "Claim deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting claim:", error);
    res.status(500).json({
      message: "Server error while deleting claim",
      error: error.message,
    });
  }
};
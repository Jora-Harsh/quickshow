import Theater from "../models/theaterModel.js";

// Get all theaters
export const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json({ success: true, theaters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get one theater by ID or name
export const getTheaterById = async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await Theater.findOne({
      $or: [{ _id: theaterId }, { name: theaterId }],
    });

    if (!theater)
      return res.status(404).json({ success: false, message: "Theater not found" });

    res.status(200).json({ success: true, theater });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

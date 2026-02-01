const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.create({
      user: req.user.id,
      service: req.body.service,
      date: req.body.date
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "email")
      .populate("service", "name price");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "email")
      .populate("service", "name price");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
});

router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/stats/by-service", async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$service",
          totalBookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" },
      {
        $project: {
          _id: 0,
          serviceName: "$service.name",
          totalBookings: 1
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats/by-user", async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$user",
          totalBookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          email: "$user.email",
          totalBookings: 1
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats/revenue", async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" },
      {
        $group: {
          _id: "$service._id",
          serviceName: { $first: "$service.name" },
          revenue: { $sum: "$service.price" }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
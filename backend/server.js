const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

app.use(cors());

// Middleware
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/services", require("./routes/serviceRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   MongoDB Connection
================================ */

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* ================================
   Order Schema
================================ */

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  items: { type: Array, required: true },
  total: { type: Number, required: true },

  paymentMethod: { type: String, required: true }, // COD or ONLINE
  paymentStatus: { type: String, required: true }, // Pending or Paid

  date: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", OrderSchema);

/* ================================
   Create Order (COD + ONLINE)
================================ */

app.post("/order", async (req, res) => {
  try {

    const {
      name,
      phone,
      address,
      pincode,
      items,
      total,
      paymentMethod
    } = req.body;

    let paymentStatus = "Pending";

    if (paymentMethod === "ONLINE") {
      paymentStatus = "Paid"; // For now (Razorpay will handle later)
    }

    const newOrder = new Order({
      name,
      phone,
      address,
      pincode,
      items,
      total,
      paymentMethod,
      paymentStatus
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ================================
   Get All Orders (Admin)
================================ */

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

/* ================================
   Server
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

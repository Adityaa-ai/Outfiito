require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require("razorpay");
const axios = require("axios");
const path = require("path");

const app = express();

// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());

// ================================
// SERVE FRONTEND
// ================================
app.use(express.static(path.join(__dirname, "../Frontend")));

// ================================
// DATABASE
// ================================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ================================
// MODELS
// ================================
const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  description: String,
  frontImage: String,
  backImage: String,
  stock: Number
});

const Order = mongoose.model("Order", {
  name: String,
  phone: String,
  address: String,
  pincode: String,
  items: Array,
  total: Number,
  paymentMethod: String,
  paymentStatus: String,
  date: { type: Date, default: Date.now }
});

// ================================
// RAZORPAY
// ================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ================================
// SHIPROCKET
// ================================
let shiprocketToken = "";

async function getShiprocketToken() {
  try {
    console.log("📧 Email:", process.env.SHIPROCKET_EMAIL);

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    shiprocketToken = response.data.token;

    console.log("✅ Token Generated");

  } catch (error) {
    console.log("❌ Login Error:",
      error.response?.data || error.message
    );
  }
}

async function createShipment(order) {
  try {
    if (!shiprocketToken) {
      await getShiprocketToken();
    }

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        order_id: order._id.toString(),
        order_date: new Date(),

        pickup_location: "Home",

        billing_customer_name: order.name,
        billing_phone: order.phone,
        billing_address: order.address,
        billing_pincode: order.pincode,
        billing_city: "Mumbai",
        billing_state: "Maharashtra",
        billing_country: "India",

        order_items: order.items.map(item => ({
          name: item.name,
          sku: "TSHIRT",
          units: item.qty || 1,
          selling_price: item.price
        })),

        payment_method:
          order.paymentMethod === "COD" ? "COD" : "Prepaid",

        sub_total: order.total,

        length: 10,
        breadth: 10,
        height: 2,
        weight: 0.5
      },
      {
        headers: {
          Authorization: `Bearer ${shiprocketToken}`
        }
      }
    );

    console.log("🚀 Shipment Created:", response.data);

  } catch (error) {
    console.log("❌ Shipment Error:",
      error.response?.data || error.message
    );
  }
}

// ================================
// ROUTES
// ================================

// ➤ Get Products (static or DB later)
app.get("/products", async (req, res) => {
  res.json([]); // you can ignore for now
});

// ➤ Razorpay Order
app.post("/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount * 100,
      currency: "INR"
    });

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: "Razorpay Error" });
  }
});

// ➤ Place Order
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

    const newOrder = new Order({
      name,
      phone,
      address,
      pincode,
      items,
      total,
      paymentMethod,
      paymentStatus: "Pending"
    });

    await newOrder.save();

    createShipment(newOrder);

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ➤ Admin Orders
app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ date: -1 });
  res.json(orders);
});

// ================================
// FALLBACK
// ================================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
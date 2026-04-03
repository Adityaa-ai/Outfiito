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

async function createShiprocketOrder(order) {

  try {
    console.log("📦 Sending to Shiprocket...");

    const token = await getShiprocketToken();

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        order_id: "ORDER_" + Date.now(),
        order_date: new Date(),

        billing_customer_name: order.name,
        billing_last_name: "User",

        billing_address: order.address,
        billing_city: "Mumbai",
        billing_pincode: order.pincode,
        billing_state: "Maharashtra",
        billing_country: "India",
        billing_phone: order.phone,

        shipping_is_billing: true,

        order_items: order.items.map(item => ({
          name: item.name,
          sku: item.name,
          units: 1,
          selling_price: item.price
        })),

        payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
        sub_total: order.total,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("✅ Shiprocket Success:", response.data);

  } catch (err) {
    console.log("❌ Shiprocket Error:", err.response?.data || err.message);
  }
}

const axios = require("axios");

async function getShiprocketToken() {
  try {
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    return res.data.token;

  } catch (err) {
    console.log("❌ Shiprocket Auth Error:", err.response?.data || err.message);
  }
}

app.post("/order", async (req, res) => {
  console.log("📦 Order API called");
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
    await Order.create(orderData);
    createShiprocketOrder(orderData);


    console.log("🔥 ORDER RECEIVED:", newOrder);

    // 🔥 CALL SHIPROCKET (DON’T AWAIT)
    createShipment(newOrder);


    res.json({ success: true });

  } catch (error) {
    console.log(error);
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
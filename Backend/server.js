require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require("razorpay");
const axios = require("axios");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const app = express();

// // ================================
// // CLOUDINARY
// // ================================
// cloudinary.config({
//   cloud_name: "YOUR_CLOUD_NAME",
//   api_key: "YOUR_API_KEY",
//   api_secret: "YOUR_API_SECRET"
// });

// const upload = multer({ dest: "uploads/" });

// // Upload Route
// app.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(req.file.path);

//     res.json({
//       url: result.secure_url
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

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

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  pincode: String,

  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],

  total: Number,

  paymentMethod: String,

  paymentStatus: {
    type: String,
    default: "Pending"
  },

  status: {
    type: String,
    default: "Pending"
  }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

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
async function getShiprocketToken() {
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    console.log("✅ Shiprocket Token Generated");
    return response.data.token;

  } catch (error) {
    console.log("❌ Shiprocket Auth Error:",
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

// ================================
// CREATE RAZORPAY ORDER
// ================================
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    console.log("❌ Razorpay Error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// ================================
// ORDER ROUTE
// ================================
app.post("/order", async (req, res) => {
  console.log("📦 Order API called");

  try {
    const orderData = req.body;

    const newOrder = new Order({
      ...orderData,
      paymentStatus: "Pending"
    });

    await newOrder.save();

    createShiprocketOrder(orderData);

    res.json({ success: true });

  } catch (error) {
    console.log("❌ Order Error:", error);
    res.status(500).json({ success: false });
  }
});

// ================================
// ADMIN APIs
// ================================

// GET ORDERS
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE STATUS
app.put("/admin/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// ================================
// ADMIN PAGE ROUTE (FIXED)
// ================================
app.get("/admin", (req, res) => {
  const pass = req.query.pass;

  if (pass === "outfiito@1234") {
    res.sendFile(path.join(__dirname, "../Frontend/admin.html"));
  } else {
    res.send("Access Denied ❌");
  }
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

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require("razorpay");
const axios = require("axios");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();

// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());

// ================================
// CLOUDINARY SETUP
// ================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "outfiito_products",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

// ================================
// MONGODB CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// ================================
// PRODUCT SCHEMA
// ================================
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  frontImage: String,
  backImage: String,
  stock: Number
});

const Product = mongoose.model("Product", ProductSchema);

// ================================
// ADD PRODUCT
// ================================
app.post(
  "/add-product",
  upload.fields([
    { name: "frontImage" },
    { name: "backImage" }
  ]),
  async (req, res) => {
    try {
      const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        stock: req.body.stock,
        frontImage: req.files.frontImage[0].path,
        backImage: req.files.backImage[0].path
      });

      await product.save();

      res.json({ success: true, product });

    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false });
    }
  }
);

// ================================
// GET PRODUCTS
// ================================
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ================================
// RAZORPAY SETUP
// ================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ================================
// SHIPROCKET SETUP
// ================================
let shiprocketToken = "";

async function getShiprocketToken() {
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    shiprocketToken = response.data.token;

  } catch (error) {
    console.log("Shiprocket login error:", error.message);
  }
}

async function createShipment(order) {
  try {
    if (!shiprocketToken) {
      await getShiprocketToken();
    }

    await axios.post(
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
          units: 1,
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

    console.log("Shipment created");

  } catch (error) {
    console.log("Shipment error:", error.message);
  }
}

// ================================
// ORDER SCHEMA
// ================================
const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  items: { type: Array, required: true },
  total: { type: Number, required: true },

  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true },

  date: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", OrderSchema);

// ================================
// PLACE ORDER
// ================================
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

    if (!name || !phone || !address || !items) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

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

    // 🚀 background shipment (no freeze)
    createShipment(newOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// ================================
// GET ORDERS
// ================================
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// ================================
// CREATE RAZORPAY ORDER
// ================================
app.post("/create-order", async (req, res) => {
  try {
    const amount = req.body.amount;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now()
    });

    res.json(order);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating Razorpay order");
  }
});

// ================================
// SERVER START
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
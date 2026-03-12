require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require("razorpay");
const axios = require("axios");

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
   Razorpay Setup
================================ */

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================================
   Shiprocket Setup
================================ */

let shiprocketToken = "";

// Login to Shiprocket
async function getShiprocketToken(){

try{

const response = await axios.post(
"https://apiv2.shiprocket.in/v1/external/auth/login",
{
email: process.env.SHIPROCKET_EMAIL,
password: process.env.SHIPROCKET_PASSWORD
}
);

shiprocketToken = response.data.token;

console.log("Shiprocket token generated");

}catch(error){

console.log(
"Shiprocket login error:",
error.response?.data || error.message
);

}

}

// Create Shipment
async function createShipment(order){

try{

if(!shiprocketToken){
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
headers:{
Authorization:`Bearer ${shiprocketToken}`
}
}

);

console.log("Shipment created:",response.data);

}catch(error){

console.log(
"Shiprocket shipment error:",
error.response?.data || error.message
);

}

}

/* ================================
   Order Schema
================================ */

const OrderSchema = new mongoose.Schema({

name:{type:String,required:true},
phone:{type:String,required:true},
address:{type:String,required:true},
pincode:{type:String,required:true},
items:{type:Array,required:true},
total:{type:Number,required:true},

paymentMethod:{type:String,required:true},
paymentStatus:{type:String,required:true},

date:{
type:Date,
default:Date.now
}

});

const Order = mongoose.model("Order",OrderSchema);

/* ================================
   Create Order (COD + ONLINE)
================================ */

app.post("/order",async(req,res)=>{

try{

const{
name,
phone,
address,
pincode,
items,
total,
paymentMethod
}=req.body;

let paymentStatus="Pending";

if(paymentMethod==="ONLINE"){
paymentStatus="Paid";
}

const newOrder=new Order({

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

// create shipment automatically
await createShipment(newOrder);

res.status(201).json({
success:true,
message:"Order placed successfully",
order:newOrder
});

}catch(error){

console.log(error);

res.status(500).json({
success:false,
message:"Server Error"
});

}

});

/* ================================
   Get All Orders (Admin)
================================ */

app.get("/orders",async(req,res)=>{

try{

const orders=await Order.find().sort({date:-1});

res.json(orders);

}catch(error){

res.status(500).json({
message:"Error fetching orders"
});

}

});

/* ================================
   Razorpay Create Order
================================ */

app.post("/create-order",async(req,res)=>{

try{

const amount=req.body.amount;

const options={

amount:amount*100,
currency:"INR",
receipt:"order_"+Date.now()

};

const order=await razorpay.orders.create(options);

res.json(order);

}catch(err){

console.log(err);

res.status(500).send("Error creating Razorpay order");

}

});

/* ================================
   Server Start
================================ */

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`);
});
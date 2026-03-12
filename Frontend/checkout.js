// ===============================
// LOAD CART
// ===============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cartItems");
const totalAmount = document.getElementById("totalAmount");
const form = document.getElementById("checkoutForm");

let orderData = {};
let total = 0;


// ===============================
// DISPLAY CART
// ===============================

function renderCart() {

  if (!cartItems || !totalAmount) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    totalAmount.innerText = "";
    return;
  }

  total = 0;

  cartItems.innerHTML = cart.map((item, i) => {
    total += item.price;

    return `
      <div class="order-item">
        <span>${item.name}</span>
        <span>₹${item.price}</span>
      </div>
    `;

  }).join("");

  totalAmount.innerHTML = `
    <div class="order-total-line">
      <span>Total</span>
      <span>₹${total}</span>
    </div>
  `;

}

renderCart();


// ===============================
// PLACE ORDER
// ===============================

if (form) {

form.addEventListener("submit", async function (e) {

e.preventDefault();

if (cart.length === 0) {
alert("Cart is empty");
return;
}

const name = document.getElementById("name").value.trim();
const phone = document.getElementById("phone").value.trim();
const address = document.getElementById("address").value.trim();
const pincode = document.getElementById("pincode").value.trim();
const paymentMethod = document.getElementById("paymentMethod").value;

orderData = {
name,
phone,
address,
pincode,
items: cart,
total,
paymentMethod
};


// ===============================
// COD ORDER
// ===============================

if (paymentMethod === "COD") {

placeOrder();

}


// ===============================
// ONLINE PAYMENT (RAZORPAY)
// ===============================

if (paymentMethod === "ONLINE") {

try {

const res = await fetch("https://outfiito-backend.onrender.com/create-order", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ amount: total })
});

const data = await res.json();

const options = {

key: "rzp_live_SQFPQzNYbprUQ7",

amount: data.amount,

currency: "INR",

name: "Outfiito",

description: "T-shirt Order",

order_id: data.id,

handler: function (response) {

placeOrder();

},

theme: {
color: "#000"
}

};

const rzp = new Razorpay(options);
rzp.open();

} catch (err) {

console.log(err);
alert("Payment failed");

}

}

});

}


// ===============================
// SAVE ORDER TO DATABASE
// ===============================

function placeOrder() {

fetch("https://outfiito-backend.onrender.com/order", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify(orderData)

})

.then(res => res.json())

.then(data => {

if (data.success) {

localStorage.removeItem("cart");

window.location.href = "order_success.html";

} else {

alert("Order failed");

}

})

.catch(err => {

console.log(err);
alert("Server error");

});

}
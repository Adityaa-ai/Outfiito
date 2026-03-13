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
// GROUP ITEMS WITH QUANTITY
// ===============================

function groupCartItems() {

  const grouped = {};

  cart.forEach(item => {

    if (grouped[item.name]) {

      grouped[item.name].qty += 1;

    } else {

      grouped[item.name] = {
        name: item.name,
        price: item.price,
        qty: 1
      };

    }

  });

  return Object.values(grouped);

}


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

  const groupedItems = groupCartItems();

  cartItems.innerHTML = groupedItems.map((item, i) => {

    const itemTotal = item.price * item.qty;

    total += itemTotal;

    return `
      <div class="order-item">

        <div class="order-info">
          <strong>${item.name}</strong>
          <div class="qty-controls">
            <button onclick="decreaseQty('${item.name}')">-</button>
            <span>${item.qty}</span>
            <button onclick="increaseQty('${item.name}')">+</button>
          </div>
        </div>

        <div class="order-price">
          ₹${itemTotal}
          <button onclick="removeItem('${item.name}')" class="remove-btn">❌</button>
        </div>

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
// QUANTITY CONTROLS
// ===============================

function increaseQty(name) {

  const item = cart.find(i => i.name === name);

  if (item) {
    cart.push({ name: item.name, price: item.price });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

}

function decreaseQty(name) {

  const index = cart.findIndex(i => i.name === name);

  if (index > -1) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

}


// ===============================
// REMOVE ITEM COMPLETELY
// ===============================

function removeItem(name) {

  cart = cart.filter(item => item.name !== name);

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();

}


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
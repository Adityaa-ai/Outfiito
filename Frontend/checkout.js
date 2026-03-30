```javascript
// ===============================
// GLOBAL VARIABLES
// ===============================

let buyNow = JSON.parse(localStorage.getItem("buyNow"));
let cart = buyNow || JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cartItems");
const totalAmount = document.getElementById("totalAmount");
const form = document.getElementById("checkoutForm");

let orderData = {};
let total = 0;


// ===============================
// GROUP ITEMS
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
        image: item.image,
        qty: 1
      };
    }
  });

  return Object.values(grouped);
}


// ===============================
// RENDER CART
// ===============================

function renderCart() {

  if (!cartItems || !totalAmount) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    totalAmount.innerHTML = "";
    return;
  }

  total = 0;

  const groupedItems = groupCartItems();

  cartItems.innerHTML = groupedItems.map(item => {

    const itemTotal = item.price * item.qty;
    total += itemTotal;

    return '
      <div class="order-item">

        <img src="${item.image || '/images/IMG_1603F.PNG'}" width="60" />

        <div>
          <strong>${item.name}</strong>

          <div>
            <button onclick="decreaseQty('${item.name}')">-</button>
            <span>${item.qty}</span>
            <button onclick="increaseQty('${item.name}')">+</button>
          </div>
        </div>

        <div>
          ₹${itemTotal}
          <button onclick="removeItem('${item.name}')">❌</button>
        </div>

      </div>
    `;
  ;join("");

  totalAmount.innerHTML = `<h3>Total: ₹${total}</h3>`;

renderCart();


// ===============================
// GLOBAL FUNCTIONS (IMPORTANT)
// ===============================

window.increaseQty = function(name) {
  const item = cart.find(i => i.name === name);

  if (item) {
    cart.push({
      name: item.name,
      price: item.price,
      image: item.image
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

window.decreaseQty = function(name) {
  const index = cart.findIndex(i => i.name === name);

  if (index > -1) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

window.removeItem = function(name) {
  cart = cart.filter(item => item.name !== name);

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};


// ===============================
// FORM SUBMIT
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
    // COD
    // ===============================

    if (paymentMethod === "COD") {
      placeOrder();
    }

    // ===============================
    // ONLINE PAYMENT
    // ===============================

    if (paymentMethod === "ONLINE") {

      try {

        const res = await fetch("https://outfiito-backend.onrender.com/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total })
        });

        const data = await res.json();

        if (!window.Razorpay) {
          alert("Razorpay not loaded");
          return;
        }

        const options = {
          key: "rzp_live_SQFPQzNYbprUQ7",
          amount: data.amount,
          currency: "INR",
          name: "Outfiito",
          order_id: data.id,

          handler: function (response) {
            orderData.paymentId = response.razorpay_payment_id;
            placeOrder();
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

      } catch (err) {
        console.log(err);
        alert("Payment error");
      }
    }

  });
}


// ===============================
// PLACE ORDER
// ===============================

async function placeOrder() {

  try {

    const res = await fetch("https://outfiito-backend.onrender.com/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const data = await res.json();

    if (data.success) {

      localStorage.removeItem("cart");
      localStorage.removeItem("buyNow");

      window.location.href = "order-success.html";

    } else {
      alert("Order failed");
    }

  } catch (err) {
    console.log(err);
    alert("Server error");
  }
}


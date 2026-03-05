// ===============================
// LOAD CART
// ===============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cartItems");
const totalAmount = document.getElementById("totalAmount");
const form = document.getElementById("checkoutForm");

// ===============================
// DISPLAY CART
// ===============================

function renderCart() {

  if (!cartItems || !totalAmount) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    totalAmount.innerHTML = "";
    return;
  }

  let subtotal = 0;

  cartItems.innerHTML = cart.map((item) => {

    subtotal += item.price;

    const parts = item.name.split(" - ");
    const productName = parts[0];
    const size = parts[1] || "";

    return `
      <div class="order-item">
        <div class="order-left">
          <div class="order-product-name">${productName}</div>
          <div class="order-meta">Size: ${size}</div>
        </div>
        <div class="order-price">₹${item.price}</div>
      </div>
    `;

  }).join("");

  const shipping = subtotal > 999 ? 0 : 49;
  const total = subtotal + shipping;

  totalAmount.innerHTML = `
    <div class="summary-line">
      <span>Subtotal</span>
      <span>₹${subtotal}</span>
    </div>

    <div class="summary-line">
      <span>Shipping</span>
      <span>${shipping === 0 ? "Free" : "₹" + shipping}</span>
    </div>

    <div class="summary-total">
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
      alert("Your cart is empty.");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!name || !phone || !address || !pincode || !paymentMethod) {
      alert("Please fill all fields.");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const orderData = {
      name,
      phone,
      address,
      pincode,
      items: cart,
      total,
      paymentMethod
    };

    const button = document.querySelector(".checkout-btn");
    button.innerText = "Placing Order...";
    button.disabled = true;

    try {

      const response = await fetch("https://outfiito-backend.onrender.com/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("cart");
        window.location.href = "order_success.html";
      } else {
        alert("Order failed. Please try again.");
        button.innerText = "Place Order";
        button.disabled = false;
      }

    } catch (error) {
      console.error(error);
      alert("Server error. Please try again later.");
      button.innerText = "Place Order";
      button.disabled = false;
    }

  });

}
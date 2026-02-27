let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cartItems");
const totalAmount = document.getElementById("totalAmount");
const form = document.getElementById("checkoutForm");

// Show cart
if (cartItems && totalAmount) {
  let total = 0;
  cartItems.innerHTML = cart.map((item, i) => {
    total += item.price;
    return `<p>${i + 1}. ${item.name} - ₹${item.price}</p>`;
  }).join("");

  totalAmount.innerText = "Total: ₹" + total;
}

// Place order
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const pincode = document.getElementById("pincode").value;
    const paymentMethod = document.getElementById("paymentMethod").value;

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

    fetch("http://localhost:5000/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        window.location.href = "order_success.html";
      } else {
        alert("Order failed.");
      }
    })
    .catch(error => {
      console.error(error);
      alert("Server error.");
    });

  });
}
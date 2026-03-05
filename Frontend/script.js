// ===============================
// GLOBAL CART COUNT
// ===============================

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.innerText = cart.length;
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
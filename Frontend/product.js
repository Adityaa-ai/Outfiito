// ===============================
// PRODUCT DATA (Same as shop)
// ===============================

const products = [
  {
    id: 1,
    name: "Classic White Tee",
    price: 499,
    front: "images/product1.jpg",
    back: "images/product1-back.jpg"
  },
  {
    id: 2,
    name: "Back Print Tee",
    price: 599,
    front: "images/product2.jpg",
    back: "images/product2-back.jpg"
  },
  {
    id: 3,
    name: "Minimal Logo Tee",
    price: 549,
    front: "images/product3.jpg",
    back: "images/product3-back.jpg"
  },
  {
    id: 4,
    name: "Streetwear Graphic Tee",
    price: 699,
    front: "images/product4.jpg",
    back: "images/product4-back.jpg"
  }
];

// ===============================
// LOAD SELECTED PRODUCT
// ===============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productId = localStorage.getItem("selectedProduct");
const product = products.find(p => p.id == productId);

const container = document.getElementById("productDetails");

if (product && container) {
  container.innerHTML = `
    <div style="flex:1; min-width:300px;">
      <img src="${product.front}" style="width:100%; max-height:400px; object-fit:contain;">
      <br><br>
      <img src="${product.back}" style="width:100%; max-height:400px; object-fit:contain;">
    </div>

    <div style="flex:1; min-width:300px;">
      <h2>${product.name}</h2>
      <h3>₹${product.price}</h3>

      <br>

      <label>Select Size:</label>
      <select id="sizeSelect">
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
        <option value="XL">XL</option>
      </select>

      <br><br>

      <button onclick="addToCart()">Add to Cart</button>
    </div>
  `;
}

// ===============================
// ADD TO CART
// ===============================

function addToCart() {
  const size = document.getElementById("sizeSelect").value;

  const item = {
    name: product.name + " - " + size,
    price: product.price
  };

  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to cart!");
  window.location.href = "checkout.html";
}

// ===============================
// CART COUNT
// ===============================

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = cart.length;
  }
}

updateCartCount();
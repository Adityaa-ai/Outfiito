// ===============================
// PRODUCT DATA
// ===============================

const products = [
  {
    id: 1,
    name: "Classic White Tee",
    price: 499,
    image: "images/product1.jpg"
  },
  {
    id: 2,
    name: "Back Print Tee",
    price: 599,
    image: "images/product2.jpg"
  },
  {
    id: 3,
    name: "Minimal Logo Tee",
    price: 549,
    image: "images/product3.jpg"
  },
  {
    id: 4,
    name: "Streetwear Graphic Tee",
    price: 699,
    image: "images/product4.jpg"
  }
];

// ===============================
// CART LOGIC
// ===============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = cart.length;
  }
}

updateCartCount();

// ===============================
// LOAD PRODUCTS
// ===============================

const productList = document.getElementById("productList");

if (productList) {
  productList.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      <button onclick="viewProduct(${product.id})">View</button>
      <br><br>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    </div>
  `).join("");
}

// ===============================
// VIEW PRODUCT
// ===============================

function viewProduct(id) {
  localStorage.setItem("selectedProduct", id);
  window.location.href = "product.html";
}

// ===============================
// ADD TO CART
// ===============================

function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Added to cart!");
}
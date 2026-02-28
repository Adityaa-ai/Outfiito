// ===============================
// PRODUCT DATA (Same as shop)
// ===============================

const products = [
  {
    id: 1,
    name: "Emirates",
    price: 499,
    front: "imagess/IMG_1601F.png",
    back: "imagess/IMG_1601B.png"
  },
  {
    id: 2,
    name: "Calm bitch",
    price: 599,
    front: "imagess/IMG_1602F.png",
    back: "imagess/IMG_1602B.png"
  },
  {
    id: 3,
    name: "Eagle",
    price: 549,
    front: "imagess/IMG_1603F.png",
    back: "imagess/IMG_1603B.png"
  },
  {
    id: 4,
    name: "COHCO3",
    price: 699,
    front: "imagess/IMG_1606.png",
    back: "imagess/IMG_1607.png"
  },

  {
    id: 5,
    name: "Unknown Saint",
    price: 699,
    front: "imagess/IMG_1609.png",
    back: "imagess/IMG_1609.png"
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

function changeImage(element) {
  document.getElementById("mainProductImage").src = element.src;
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
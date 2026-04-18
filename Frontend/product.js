// ===============================
// PRODUCT DATA
// ===============================

const products = [
  { id: 1, name: "Urban Muse ", price: 599, front: "/images/IMG_1610F.PNG", back: "/images/IMG_1610B.PNG" },

  { id: 2, name: "Attack On Titan", price: 599, front: "/images/IMG_1604F.PNG", back: "/images/IMG_1604B.PNG" },

  { id: 3, name: "Velocity drift", price: 799, front: "/images/IMG_1611F.PNG", back: "/images/IMG_1611B.PNG" },
  
  { id: 5, name: "Focus Dimension", price: 699, front: "/images/IMG_1613F.PNG", back: "/images/IMG_1613B.PNG" }, 

  { id: 6, name: "Dark Zenith", price: 699, front: "/images/IMG_1614F.PNG", back: "/images/IMG_1614B.PNG" }, 


  { id: 4, name: "Retro Beast", price: 799, front: "/images/IMG_1612F.PNG", back: "/images/IMG_1612B.PNG" }
];


// ===============================
// GET PRODUCT FROM URL
// ===============================

const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

const product = products.find(p => p.id === productId);


// ===============================
// LOAD PRODUCT
// ===============================

if (product) {

  document.querySelector(".product-title").innerText = product.name;
  document.querySelector(".product-price").innerText = "₹" + product.price;

  const mainImage = document.getElementById("mainProductImage");
  const frontThumb = document.getElementById("frontThumb");
  const backThumb = document.getElementById("backThumb");

  if (mainImage) mainImage.src = product.front;
  if (frontThumb) frontThumb.src = product.front;
  if (backThumb) backThumb.src = product.back;

  if (frontThumb) frontThumb.onclick = () => mainImage.src = product.front;
  if (backThumb) backThumb.onclick = () => mainImage.src = product.back;
}


// ===============================
// ADD TO CART
// ===============================

const addBtn = document.querySelector(".add-cart-btn");

if (addBtn) {
  addBtn.addEventListener("click", () => {

    if (!product) {
      alert("Product not found");
      return;
    }

    const size = document.querySelector(".size-select")?.value;

    if (!size) {
      alert("Please select size");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = {
      name: product.name + " - " + size,
      price: product.price,
      image: product.front
    };

    cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));

    console.log("🛒 CART SAVED:", cart);

    alert("Added to cart!");
  });
}


// ===============================
// BUY NOW
// ===============================

const buyBtn = document.querySelector(".buy-now-btn");

if (buyBtn) {
  buyBtn.addEventListener("click", () => {

    if (!product) {
      alert("Product not found");
      return;
    }

    const size = document.querySelector(".size-select")?.value;

    if (!size) {
      alert("Please select size");
      return;
    }

    const buyNowItem = [{
      name: product.name + " - " + size,
      price: product.price,
      image: product.front
    }];

    localStorage.setItem("buyNow", JSON.stringify(buyNowItem));

    window.location.href = "checkout.html";
  });
}


// ===============================
// CART COUNT
// ===============================

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.innerText = cart.length;
  }
}

updateCartCount();


// ===============================
// REVIEWS
// ===============================

function loadReviews() {
  const reviews = JSON.parse(localStorage.getItem("reviews_" + productId)) || [];
  const container = document.getElementById("reviewsList");

  if (!container) return;

  container.innerHTML = reviews.map(r => `
    <div class="review">${r}</div>
  `).join("");
}

function addReview() {
  const input = document.getElementById("reviewInput");

  if (!input || !input.value.trim()) return;

  let reviews = JSON.parse(localStorage.getItem("reviews_" + productId)) || [];

  reviews.push(input.value);

  localStorage.setItem("reviews_" + productId, JSON.stringify(reviews));

  input.value = "";

  loadReviews();
}

loadReviews();


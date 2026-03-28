// ===============================
// PRODUCT DATA
// ===============================

const products = [
  {
    id: 1,
    name: "Emirates",
    price: 499,
    front: "/images/IMG_1601F.PNG",
    back: "/images/IMG_1601B.PNG"
  },
  {
    id: 2,
    name: "Calm Bitch",
    price: 499,
    front: "/images/IMG_1602F.PNG",
    back: "/images/IMG_1602B.PNG"
  },
  {
    id: 3,
    name: "Eagle",
    price: 499,
    front: "/images/IMG_1603F.PNG",
    back: "/images/IMG_1603B.PNG"
  },
  {
    id: 4,
    name: "COHCO3",
    price: 499,
    front: "/images/IMG_1606.PNG",
    back: "/images/IMG_1607.PNG"
  },
  {
    id: 5,
    name: "Unknown Saint",
    price: 499,
    front: "/images/IMG_1609.PNG",
    back: "/images/IMG_1609.PNG"
  },

   {
    id: 6,
    name: "AOT",
    price: 499,
    front: "/images/IMG_1604F.PNG",
    back: "/images/IMG_1604B.PNG"
  }
];


// ===============================
// GET PRODUCT ID FROM URL
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

  mainImage.src = product.front;

  frontThumb.src = product.front;
  backThumb.src = product.back;

  frontThumb.onclick = () => mainImage.src = product.front;
  backThumb.onclick = () => mainImage.src = product.back;

}


// ===============================
// ADD TO CART
// ===============================

document.querySelector(".add-cart-btn").addEventListener("click", () => {

  const size = document.querySelector(".size-select").value;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push({
  name: product.name + " - " + size,
  price: product.price,
  image: product.front   // 🔥 ADD THIS LINE
});

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to cart!");

});

// ===============================
// BUY NOW
// ===============================

document.querySelector(".buy-now-btn").addEventListener("click", () => {

  const size = document.querySelector(".size-select").value;

  const buyNowItem = [{
    name: product.name + " - " + size,
    price: product.price,
    image: product.front
  }];

  localStorage.setItem("buyNow", JSON.stringify(buyNowItem));

  window.location.href = "checkout.html";

});


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
// Review section
// ===============================

function loadReviews(){

const reviews = JSON.parse(localStorage.getItem("reviews_"+productId)) || [];

const container = document.getElementById("reviewsList");

if(!container) return;

container.innerHTML = reviews.map(r=>`
<div class="review">${r}</div>
`).join("");

}

function addReview(){

const input = document.getElementById("reviewInput");

if(!input.value.trim()) return;

let reviews = JSON.parse(localStorage.getItem("reviews_"+productId)) || [];

reviews.push(input.value);

localStorage.setItem("reviews_"+productId, JSON.stringify(reviews));

input.value="";

loadReviews();

}

loadReviews();
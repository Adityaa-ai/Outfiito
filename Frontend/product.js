// ===============================
// PRODUCT DATA
// ===============================

const products = [
{
id:1,
name:"Emirates",
price:499,
front:"imagess/IMG_1601F.png",
back:"imagess/IMG_1601B.png"
},

{
id:2,
name:"Calm Bitch",
price:599,
front:"imagess/IMG_1602F.png",
back:"imagess/IMG_1602B.png"
},

{
id:3,
name:"Eagle",
price:549,
front:"imagess/IMG_1603F.png",
back:"imagess/IMG_1603B.png"
},

{
id:4,
name:"COHCO3",
price:699,
front:"imagess/IMG_1606.png",
back:"imagess/IMG_1607.png"
},

{
id:5,
name:"Unknown Saint",
price:699,
front:"imagess/IMG_1609.png",
back:"imagess/IMG_1609.png"
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

if(product){

document.querySelector(".product-title").innerText = product.name;
document.querySelector(".product-price").innerText = "₹"+product.price;

const mainImage = document.getElementById("mainProductImage");
const frontThumb = document.getElementById("frontThumb");
const backThumb = document.getElementById("backThumb");

mainImage.src = product.front;

frontThumb.src = product.front;
backThumb.src = product.back;

// click switch
frontThumb.onclick = () => mainImage.src = product.front;
backThumb.onclick = () => mainImage.src = product.back;

}

// ===============================
// ADD TO CART
// ===============================

const addBtn = document.querySelector(".add-cart-btn");

if(addBtn){

addBtn.addEventListener("click",()=>{

const size = document.querySelector(".size-select").value;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart.push({
name:product.name + " - " + size,
price:product.price
});

localStorage.setItem("cart",JSON.stringify(cart));

alert("Added to cart!");

});

}

// ===============================
// CART COUNT
// ===============================

function updateCartCount(){

const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cartCount");

if(cartCount){
cartCount.innerText = cart.length;
}

}

updateCartCount();

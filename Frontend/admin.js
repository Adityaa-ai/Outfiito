const ordersDiv = document.getElementById("orders");

async function loadOrders() {
  try {
    const res = await fetch("/admin/orders");
    const orders = await res.json();

    displayOrders(orders);

  } catch (err) {
    console.log("Error loading orders", err);
  }
}

function displayOrders(orders) {
  ordersDiv.innerHTML = "";

  orders.forEach(order => {
    const box = document.createElement("div");
    box.className = "order";

    box.innerHTML = `
      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>Name:</b> ${order.name}</p>
      <p><b>Total:</b> ₹${order.total}</p>
      <p><b>Status:</b> ${order.status || "Pending"}</p>

      <select onchange="changeStatus('${order._id}', this.value)">
        <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
        <option ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
        <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
        <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
      </select>
    `;

    ordersDiv.appendChild(box);
  });
}

async function changeStatus(id, status) {
  try {
    await fetch(`/admin/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    loadOrders();

  } catch (err) {
    console.log("Update failed", err);
  }
}

loadOrders();
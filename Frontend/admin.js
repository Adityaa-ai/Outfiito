const ordersDiv = document.getElementById("orders");

async function loadOrders() {
  try {
    const res = await fetch("/admin/orders");
    const data = await res.json();

    displayOrders(data);

  } catch (err) {
    console.log("Error fetching orders", err);
  }
}

function displayOrders(orders) {
  ordersDiv.innerHTML = "";

  orders.forEach(order => {

    const box = document.createElement("div");

    box.style.border = "1px solid black";
    box.style.margin = "10px";
    box.style.padding = "10px";

    box.innerHTML = `
      <p><b>ID:</b> ${order._id}</p>
      <p><b>Name:</b> ${order.name}</p>
      <p><b>Phone:</b> ${order.phone}</p>
      <p><b>Address:</b> ${order.address}</p>
      <p><b>Total:</b> ₹${order.total}</p>
      <p><b>Status:</b> ${order.status}</p>

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

    alert("Updated ✅");

  } catch (err) {
    console.log("Update failed", err);
  }
}

loadOrders();
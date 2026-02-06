const API = "http://localhost:3000";

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "services.html";
  } else {
    document.getElementById("error").innerText = "Login failed";
  }
}

// LOAD SERVICES
async function loadServices() {
  const res = await fetch(`${API}/services`);
  const services = await res.json();

  const ul = document.getElementById("services");
  services.forEach(s => {
    const li = document.createElement("li");
    li.innerText = `${s.name} - $${s.price}`;
    ul.appendChild(li);
  });
}

// LOAD BOOKINGS (JWT)
async function loadBookings() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const bookings = await res.json();

  const ul = document.getElementById("bookings");
  bookings.forEach(b => {
    const li = document.createElement("li");
    li.innerText = `${b.service.name} on ${new Date(b.date).toDateString()}`;
    ul.appendChild(li);
  });
}

async function addService() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  await fetch(`${API}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  });

  alert("Service added");
}

async function addBooking() {
  const token = localStorage.getItem("token");

  await fetch(`${API}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      service: document.getElementById("serviceId").value,
      date: document.getElementById("date").value
    })
  });

  alert("Booking created");
}

async function loadProfile() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  document.getElementById("profile").innerText =
    JSON.stringify(await res.json(), null, 2);
}

async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  document.getElementById("msg").innerText = data.message || "Registered!";
}

function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  window.location.href = "index.html";
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("mainContent");

  sidebar.classList.toggle("hidden");
  main.classList.toggle("full");
}

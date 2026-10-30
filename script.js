function formatPrice(amount) {
  const rounded = Math.round(amount);
  return "$" + rounded.toLocaleString("es-CL");
}

function isValidAmount(text) {
  if (text.trim() === "") return false;
  const value = Number(text);
  if (isNaN(value)) return false;
  if (value <= 0) return false;
  return true;
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function readFromStorage(key, defaultValue) {
  const saved = localStorage.getItem(key);
  if (saved === null) return defaultValue;
  return JSON.parse(saved);
}

function initStatusBar() {
  const statusBar = document.getElementById("statusBar");
  if (!statusBar) return;

  const statusText = document.getElementById("statusBarText");
  const closeButton = document.getElementById("statusBarClose");

  const isAdmin = readFromStorage("admin", false);
  const orders = readFromStorage("compras", []);

  if (isAdmin === true) {
    statusText.textContent = "Bienvenido, Administrador";
    statusBar.classList.add("show", "ok");
  } else if (orders.length > 0) {
    const lastOrder = orders[orders.length - 1];
    statusText.textContent = `Tienes un pedido activo por ${formatPrice(lastOrder.total)}`;
    statusBar.classList.add("show", "info");
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      statusBar.classList.remove("show");
    });
  }
}

const equipofit = [
  { 
    name: "José Coronado", 
    role: "CEO", 
    specialty: "Creador y dueño del emprendimiento",
    image: "IMG/jose.jpeg" 
  },

  { 
    name: "Karlibeth Moran",
    role: "Project Manager", 
    specialty: "Líder en proyectos de la empresa",
    image: "IMG/karlibeth.png"
  },
  
  { 
    name: "Ashley Ossa",
    role: "Subdirector de operaciones",
    specialty: "Encargada de las operaciones del negocio",
    image: "IMG/ashley.jpeg"
  }
];

function initTeamSection() {
  const container = document.getElementById("teamGrid");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < equipofit.length; i++) {
    const member = equipofit[i];

    const card = document.createElement("div");
    card.className = "card member-card";
    
    const imgHtml = member.image 
      ? `<img src="${member.image}" alt="${member.name}" class="member-photo">` 
      : "";

    card.innerHTML = `
      <h3>${member.name}</h3>
      ${imgHtml}
      <span class="cargo">${member.role}</span>
      <p>${member.specialty}</p>
    `;

    container.appendChild(card);
  }
}

const menuCombos = [
  { 
    id: "banda",
    name: "Banda elástica",
    price: 2000,
    color: "#ff6b6b",
    image: "IMG/Bandas-de-estiramiento.jpg"
  },

  {
    id: "mano",
    name: "Ejercitador de mano", 
    price: 3990, 
    color: "#4dabf7",
    image: "IMG/ejercitador-de-mano.jpg"
  },

  { 
    id: "mat", 
    name: "Colchoneta MAT", 
    price: 11900, 
    color: "#80df8f",
    image: "IMG/colchoneta-mat.jpg"
  },

  { 
    id: "cuerda", 
    name: "Cuerda para saltar", 
    price: 4990, 
    color: "#c4aeff",
    image: "IMG/cuerda-para-saltar.jpg"
  },

  { 
    id: "pelota", 
    name: "Pelota pequeña", 
    price: 5290, 
    color: "#fbff0c",
    image: "IMG/pelota-ejercicio.jpg"
  },

  { 
    id: "correa", 
    name: "Correa elastica", 
    price: 2100, 
    color: "#ffd9f5",
    image: "IMG/correa-de-estiramiento.jpg"
  }
];

let cart = [];

function initServicesSection() {
  const container = document.getElementById("comboGrid");
  if (!container) return;

  const stock = readFromStorage("stock", { 
    banda: 25, 
    mano: 25, 
    mat: 25, 
    cuerda: 25, 
    pelota: 25, 
    correa: 25 
  });

  container.innerHTML = "";

  for (let i = 0; i < menuCombos.length; i++) {
    createComboCard(menuCombos[i], stock, container);
  }

  renderCart();
}

function createComboCard(combo, stock, container) {
  const card = document.createElement("div");
  card.className = "card combo-card";
  card.style.borderTop = `6px solid ${combo.color}`;

  // Se añade la imagen del combo si existe
  const imgHtml = combo.image 
    ? `<img src="${combo.image}" alt="${combo.name}" class="combo-photo">` 
    : "";

  card.innerHTML = `
    <h3>${combo.name}</h3>
    ${imgHtml}
    <div class="combo-precio" style="color:${combo.color}">${formatPrice(combo.price)}</div>
    <p class="combo-stock">Stock disponible: <span class="numero-stock">${stock[combo.id]}</span></p>
    <div class="combo-qty-row">
      <input type="number" min="1" value="1" class="campo-cantidad">
      <button type="button" class="cta small">Agregar al pedido</button>
    </div>
    <p class="field-error"></p>
  `;

  container.appendChild(card);

  const quantityInput = card.querySelector(".campo-cantidad");
  const errorText = card.querySelector(".field-error");
  const stockText = card.querySelector(".numero-stock");
  const addButton = card.querySelector("button");

  addButton.addEventListener("click", () => {
    const quantityText = quantityInput.value;
    const quantity = Number(quantityText);

    if (!isValidAmount(quantityText) || !Number.isInteger(quantity)) {
      errorText.textContent = "Cantidad no válida";
      return;
    }

    if (quantity > stock[combo.id]) {
      errorText.textContent = `Solo quedan ${stock[combo.id]} unidades`;
      return;
    }

    errorText.textContent = "";

    stock[combo.id] = stock[combo.id] - quantity;
    saveToStorage("stock", stock);
    stockText.textContent = stock[combo.id];

    addToCart(combo, quantity);
    quantityInput.value = 1;
  });
}

function addToCart(combo, quantity) {
  let existingItem = null;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === combo.id) {
      existingItem = cart[i];
    }
  }

  if (existingItem) {
    existingItem.quantity = existingItem.quantity + quantity;
  } else {
    cart.push({ id: combo.id, name: combo.name, price: combo.price, quantity: quantity });
  }

  renderCart();
}

function calculateCartTotal() {
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    total = total + cart[i].price * cart[i].quantity;
  }
  return total;
}

function renderCart() {
  const cartBox = document.getElementById("cartBox");
  if (!cartBox) return;

  if (cart.length === 0) {
    cartBox.innerHTML = "<p>Tu pedido está vacío.</p>";
    return;
  }

  let rows = "";
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemSubtotal = item.price * item.quantity;
    rows = rows + `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatPrice(itemSubtotal)}</td>
      </tr>
    `;
  }

  const subtotal = calculateCartTotal();
  const hasDiscount = subtotal > 10000;
  let finalTotal = subtotal;
  if (hasDiscount) {
    finalTotal = subtotal * 0.85;
  }

  let discountMessage = "Compra sobre $10.000 y obtén 15% de descuento";
  if (hasDiscount) {
    discountMessage = "Descuento del 15% aplicado";
  }

  cartBox.innerHTML = `
    <h3>Tu pedido</h3>
    <table>
      <thead><tr><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="descuento">${discountMessage}</p>
    <p class="total-row"><b>Total: ${formatPrice(finalTotal)}</b></p>
    <button type="button" id="btnConfirmar" class="cta mostaza">Confirmar y guardar pedido</button>
  `;

  document.getElementById("btnConfirmar").addEventListener("click", () => {
    const orders = readFromStorage("compras", []);
    orders.push({ fecha: new Date().toLocaleString("es-CL"), items: cart.slice(), total: finalTotal });
    saveToStorage("compras", orders);

    cart = [];
    renderCart();
  });
}

function initContactSection() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      validateContactForm();
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      checkLogin();
    });
  }

  const logoutButton = document.getElementById("btnLogout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      saveToStorage("admin", false);
      document.getElementById("contactoPublico").classList.remove("hidden");
      document.getElementById("adminPanel").classList.add("hidden");
    });
  }

  if (loginForm && readFromStorage("admin", false) === true) {
    showAdminPanel();
  }
}

function validateContactForm() {
  const name = document.getElementById("cNombre").value.trim();
  const email = document.getElementById("cCorreo").value.trim();
  const phone = document.getElementById("cTelefono").value.trim();
  const message = document.getElementById("cMensaje").value.trim();

  document.getElementById("errNombre").textContent = "";
  document.getElementById("errCorreo").textContent = "";
  document.getElementById("errTelefono").textContent = "";
  document.getElementById("errMensaje").textContent = "";

  let isFormValid = true;

  if (name.length < 3) {
    document.getElementById("errNombre").textContent = "Ingresa tu nombre completo";
    isFormValid = false;
  }
  if (email === "" || email.indexOf("@") === -1) {
    document.getElementById("errCorreo").textContent = "Ingresa un correo válido";
    isFormValid = false;
  }
  if (phone === "" || isNaN(Number(phone))) {
    document.getElementById("errTelefono").textContent = "El teléfono debe ser numérico";
    isFormValid = false;
  }
  if (message.length < 10) {
    document.getElementById("errMensaje").textContent = "Escribe un mensaje más largo";
    isFormValid = false;
  }

  const notice = document.getElementById("contactoAviso");
  if (isFormValid) {
    notice.className = "alert ok show";
    notice.textContent = `Gracias ${name}, recibimos tu mensaje.`;
    document.getElementById("contactForm").reset();
  } else {
    notice.className = "alert error show";
    notice.textContent = "Revisa los campos marcados en rojo.";
  }
}

function checkLogin() {
  const username = document.getElementById("lUsuario").value.trim();
  const password = document.getElementById("lClave").value.trim();
  const loginError = document.getElementById("errLogin");

  if (username === "admin" && password === "1234") {
    loginError.textContent = "";
    saveToStorage("admin", true);
    showAdminPanel();
  } else {
    loginError.textContent = "Usuario o clave incorrectos";
  }
}

function showAdminPanel() {
  document.getElementById("contactoPublico").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");

  const orders = readFromStorage("compras", []);
  const tableBody = document.getElementById("adminTablaBody");

  if (orders.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='3'>Aún no hay pedidos.</td></tr>";
    return;
  }

  let rows = "";
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    let itemsText = "";
    for (let j = 0; j < order.items.length; j++) {
      itemsText = itemsText + order.items[j].name + " x" + order.items[j].quantity + " ";
    }
    rows = rows + `
      <tr>
        <td>${order.fecha}</td>
        <td>${itemsText}</td>
        <td>${formatPrice(order.total)}</td>
      </tr>
    `;
  }
  tableBody.innerHTML = rows;
}

const DOMAIN_COST = 9990;
const HOSTING_COST = 29990;

function initFinanceSection() {
  const form = document.getElementById("finanzasForm");
  if (!form) return;

  document.getElementById("domCosto").textContent = formatPrice(DOMAIN_COST);
  document.getElementById("hostCosto").textContent = formatPrice(HOSTING_COST);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateBudget();
  });
}

function calculateBudget() {
  const hourlyRate = document.getElementById("fTarifa").value;
  const hours = document.getElementById("fHoras").value;
  const costPerClick = document.getElementById("fCPC").value;
  const clicks = document.getElementById("fClics").value;
  const budgetError = document.getElementById("errFinanzas");
  const adsWarning = document.getElementById("warnAds");

  budgetError.textContent = "";
  adsWarning.classList.remove("show");

  if (!isValidAmount(hourlyRate) || !isValidAmount(hours) || !isValidAmount(costPerClick) || !isValidAmount(clicks)) {
    budgetError.textContent = "Cantidad no válida: completa todos los campos con números positivos";
    return;
  }

  const laborCost = Number(hourlyRate) * Number(hours);
  const monthlyAdsCost = Number(costPerClick) * Number(clicks);
  const totalCost = DOMAIN_COST + HOSTING_COST + laborCost + monthlyAdsCost;

  document.getElementById("resCapitalHumano").textContent = formatPrice(laborCost);
  document.getElementById("resAdsMensual").textContent = formatPrice(monthlyAdsCost);
  document.getElementById("resTotal").textContent = formatPrice(totalCost);
  document.getElementById("resultadoFinanzas").classList.remove("hidden");

  if (monthlyAdsCost > 50000) {
    adsWarning.classList.add("show");
    adsWarning.innerHTML = `
      Presupuesto de marketing alto para fase de lanzamiento
      <br><a href="#" class="cta small mostaza">Adquirir campaña de Ads</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    initStatusBar,
    initTeamSection,
    initServicesSection,
    initContactSection,
    initFinanceSection,
  ];

  for (let i = 0; i < sections.length; i++) {
    try {
      sections[i]();
    } catch (error) {
      console.error(`Error al iniciar "${sections[i].name}":`, error);
    }
  }
});

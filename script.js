document.addEventListener("DOMContentLoaded", () => {
  // 1. LIGHT AND DARK MODE
  const themeButton = document.getElementById("theme-toggle");

  function updateThemeButton() {
    if (!themeButton) return;
    themeButton.textContent = document.body.classList.contains("dark-mode")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
  }

  if (localStorage.getItem("kigaliTheme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  updateThemeButton();

  themeButton?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
      "kigaliTheme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );

    updateThemeButton();
  });

  // 2. CITY ALERTS
  const alertMessage = document.getElementById("alert-message");
  const alertCount = document.getElementById("alert-count");
  const params = new URLSearchParams(window.location.search);
  const alertText = params.get("alert");

  if (alertMessage) {
    alertMessage.textContent = alertText || "No active city alerts.";
  }

  if (alertCount) {
    alertCount.textContent = alertText ? "1" : "0";
  }

  const alertForm = document.getElementById("alert-form");
  const alertInput = document.getElementById("alert-input");

  alertForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = alertInput?.value.trim();

    if (!message) {
      alert("Please type a city alert first!");
      return;
    }

    window.location.href = "index.html?alert=" + encodeURIComponent(message);
  });

  // 3. LIVE KIGALI WEATHER
  const scanButton = document.getElementById("scan-weather");
  const weatherResult = document.getElementById("weather-result");

  async function scanWeather() {
    if (!weatherResult) {
      alert("Weather display not found. Check weather.html.");
      return;
    }

    if (scanButton) {
      scanButton.disabled = true;
      scanButton.textContent = "⏳ Scanning...";
    }

    weatherResult.textContent = "Connecting to Kigali weather data...";

    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-1.95&longitude=30.06&current=temperature_2m,wind_speed_10m&timezone=Africa%2FKigali"
      );

      if (!response.ok) throw new Error("Weather service error");

      const data = await response.json();
      const current = data.current;

      weatherResult.textContent =
        "🌡️ Temperature: " + current.temperature_2m + " °C | " +
        "💨 Wind: " + current.wind_speed_10m + " km/h";

    } catch (error) {
      weatherResult.textContent =
        "Couldn't load weather. Check your internet and try again.";
    } finally {
      if (scanButton) {
        scanButton.disabled = false;
        scanButton.textContent = "🔄 Scan Weather Again";
      }
    }
  }

  scanButton?.addEventListener("click", scanWeather);

  // 4. EVENT TICKET WALLET
  const ticketName = document.getElementById("ticket-name");
  const ticketDate = document.getElementById("ticket-date");
  const ticketPrice = document.getElementById("ticket-price");
  const saveTicketButton = document.getElementById("save-ticket");
  const ticketList = document.getElementById("ticket-list");
  const ticketCount = document.getElementById("ticket-count");

  function getTickets() {
    try {
      const tickets = JSON.parse(localStorage.getItem("kigaliTickets"));
      return Array.isArray(tickets) ? tickets : [];
    } catch {
      return [];
    }
  }

  function displayTickets() {
    const tickets = getTickets();

    if (ticketCount) ticketCount.textContent = tickets.length;
    if (!ticketList) return;

    ticketList.innerHTML = "";

    if (tickets.length === 0) {
      ticketList.textContent = "🎟️ No tickets yet. Save your first event!";
      return;
    }

    tickets.forEach((ticket, index) => {
      const card = document.createElement("div");
      card.className = "panel";

      const title = document.createElement("h3");
      title.textContent = "🎟️ " + ticket.name;

      const details = document.createElement("p");
      details.textContent =
        "📅 " + (ticket.date || "Date not set") +
        " · 💰 RWF " + (ticket.price || "0");

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "btn";
      removeButton.textContent = "🗑️ Remove Ticket";

      removeButton.addEventListener("click", () => {
        const updatedTickets = getTickets();
        updatedTickets.splice(index, 1);
        localStorage.setItem("kigaliTickets", JSON.stringify(updatedTickets));
        displayTickets();
      });

      card.append(title, details, removeButton);
      ticketList.appendChild(card);
    });
  }

  saveTicketButton?.addEventListener("click", () => {
    const name = ticketName?.value.trim();
    const date = ticketDate?.value || "";
    const price = ticketPrice?.value.trim();

    if (!name) {
      alert("Please enter the event name!");
      ticketName?.focus();
      return;
    }

    if (!price || Number(price) < 0 || !Number.isFinite(Number(price))) {
      alert("Please enter a valid ticket price!");
      ticketPrice?.focus();
      return;
    }

    const tickets = getTickets();
    tickets.push({ name, date, price: Number(price) });

    localStorage.setItem("kigaliTickets", JSON.stringify(tickets));

    if (ticketName) ticketName.value = "";
    if (ticketDate) ticketDate.value = "";
    if (ticketPrice) ticketPrice.value = "";

    displayTickets();
    saveTicketButton.textContent = "✅ Ticket Saved!";

    setTimeout(() => {
      saveTicketButton.textContent = "🎟️ Save Event";
    }, 1800);
  });

  displayTickets();

  // 5. MINI-GAME: KIGALI CITY CHALLENGE
  const startGameButton = document.getElementById("start-game");
  const gameTarget = document.getElementById("game-target");
  const gameScore = document.getElementById("game-score");
  const gameMessage = document.getElementById("game-message");
  const highScoreDisplay = document.getElementById("game-high-score");

  let score = 0;
  let gameRunning = false;

  function getHighScore() {
    return Number(localStorage.getItem("kigaliGameHighScore")) || 0;
  }

  function updateGame() {
    if (gameScore) gameScore.textContent = score;
    if (highScoreDisplay) highScoreDisplay.textContent = getHighScore();
  }

  if (gameTarget) gameTarget.disabled = true;
  updateGame();

  startGameButton?.addEventListener("click", () => {
    score = 0;
    gameRunning = true;

    if (gameTarget) {
      gameTarget.disabled = false;
      gameTarget.textContent = "💎 COLLECT!";
    }

    if (gameMessage) {
      gameMessage.textContent = "Collect 10 city gems to win! Let's go!";
    }

    startGameButton.textContent = "🔄 Restart Game";
    updateGame();
  });

  gameTarget?.addEventListener("click", () => {
    if (!gameRunning) return;

    score += 1;
    gameTarget.textContent =
      ["💎 COLLECT!", "⭐ NICE!", "🪙 BONUS!", "💖 AMAZING!"][Math.floor(Math.random() * 4)];

    if (score >= 10) {
      gameRunning = false;
      gameTarget.disabled = true;
      gameTarget.textContent = "🏆 YOU WON!";
      if (gameMessage) gameMessage.textContent = "Amazing! You collected all 10 gems!";

      if (score > getHighScore()) {
        localStorage.setItem("kigaliGameHighScore", score);
      }
    } else if (gameMessage) {
      gameMessage.textContent = "Great! " + (10 - score) + " more gems to win!";
    }

    updateGame();
  });

  // 6. HELPFUL BUTTON FEEDBACK
  document.querySelectorAll("[data-message]").forEach((button) => {
    button.addEventListener("click", () => {
      const message = button.getAttribute("data-message");
      if (message) alert(message);
    });
  });
});
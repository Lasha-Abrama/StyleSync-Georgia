(() => {
  const heartButtons = document.querySelectorAll(".heart-btn");
  const LS_KEY = "stylesync_favs";
  const getFavs = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  const setFavs = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

  //  burger-menu
  const burger = document.querySelector(".burger");
  const navContainer = document.querySelector(".nav_ig");

  burger.addEventListener("click", () => {
    navContainer.classList.toggle("open");

    // Update aria-expanded for accessibility
    const expanded = burger.getAttribute("aria-expanded") === "true" || false;
    burger.setAttribute("aria-expanded", !expanded);
  });

  //countdown logic
  const countdownEl = document.getElementById("countdown");
  if (countdownEl) {
    const saleDate = new Date("2025-09-01T13:30:00");
    function updateCountdown() {
      const now = new Date();
      const diff = saleDate - now;

      if (diff <= 0) {
        countdownEl.textContent = "Sale is LIVE! 🔥";
        clearInterval(intervalId);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 60) % 60);
      const seconds = Math.floor(diff % 60);

      countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
  }

  const filterToggle = document.getElementById("filter-toggle");
  const filterMenu = document.getElementById("filter-menu");
  let filter_buttons = [];

  if (filterToggle && filterMenu) {
    filter_buttons = filterMenu.querySelectorAll(".filter-btn");

    filterToggle.addEventListener("click", () => {
      filterMenu.classList.toggle("open");

      // Check if any button has .active
      const anyActive = Array.from(filter_buttons).some((btn) =>
        btn.classList.contains("active")
      );

      // If none active, set first button active
      if (!anyActive && filter_buttons.length > 0) {
        filter_buttons[0].classList.add("active");
      }
    });

    filter_buttons.forEach((button) => {
      button.addEventListener("click", () => {
        filter_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Update toggle button text
        filterToggle.textContent = button.textContent + " ▾";

        filterMenu.classList.remove("open");
      });
    });
  }

  function toggleHeart(slug, btn) {
    const favs = getFavs();
    const idx = favs.indexOf(slug);
    if (idx === -1) {
      favs.push(slug);
      btn.textContent = "♥";
    } else {
      favs.splice(idx, 1);
      btn.textContent = "♡";
    }
    setFavs(favs);
  }

  heartButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.dataset.slug;
      toggleHeart(slug, btn);
    });
  });

  // Filter buttons logic — place here before gallery
  const filterButtons = document.querySelectorAll("#filter-menu .filter-btn");
  const productCards = document.querySelectorAll(".product-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const category = button.dataset.category;

      productCards.forEach((card) => {
        const prodCat = card.dataset.category;
        if (category === "all" || prodCat === category) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Carousel functionality
  const gallery = document.querySelector(".gallery");
  if (gallery) {
    const images = gallery.querySelectorAll(".gallery-img");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    let currentIndex = 0;

    function showImage(index) {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
      });
      currentIndex = index;
    }

    prevBtn.addEventListener("click", () => {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(newIndex);
    });

    nextBtn.addEventListener("click", () => {
      const newIndex = (currentIndex + 1) % images.length;
      showImage(newIndex);
    });
  }

  // Optional: keep image click to select image
  document.querySelectorAll(".gallery-img").forEach((img) => {
    img.addEventListener("click", () => {
      document
        .querySelectorAll(".gallery-img")
        .forEach((i) => i.classList.remove("active"));
      img.classList.add("active");
    });
  });

  // --- NEW: Hero slider ---
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    currentSlide = index;
  }

  // Auto slide
  function startAutoSlide() {
    slideInterval = setInterval(() => {
      nextSlide();
    }, 2500);
  }

  function stopAutoSlide() {
    clearInterval(slideInterval);
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  // Event listeners for arrows
  const sliderNext = document.getElementById("slider-next");
  const sliderPrev = document.getElementById("slider-prev");

  if (sliderNext) {
    sliderNext.addEventListener("click", () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });
  }

  if (sliderPrev) {
    sliderPrev.addEventListener("click", () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });
  }

  // Start the slideshow
  if (slides.length > 0) {
    startAutoSlide();
  }
})();

// 🤖 Chatbot functionality
let currentLanguage = "ka";

// Global event delegation for quick replies
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".qr-chip");
  if (!btn) return;
  e.preventDefault();
  const input = document.getElementById("chatbot-input-field");
  if (!input) return;
  input.value = btn.getAttribute("data-text");
  sendChatbotMessage();
});

function scrollChatToBottom() {
  const messagesContainer = document.getElementById("chatbot-messages");
  if (messagesContainer)
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Render quick replies (replaces previous)
function renderQuickReplies(suggestions = []) {
  const messagesContainer = document.getElementById("chatbot-messages");
  if (!messagesContainer) return;

  // Remove existing quick replies
  const existing = messagesContainer.querySelector(".quick-replies");
  if (existing) existing.remove();

  if (!suggestions.length) return;

  const wrap = document.createElement("div");
  wrap.className = "quick-replies";
  wrap.innerHTML = suggestions
    .map(
      (s) =>
        `<button class="qr-chip" type="button" data-text="${s}">${s}</button>`
    )
    .join("");
  messagesContainer.appendChild(wrap);
  scrollChatToBottom();
}

// Open chatbot
function openChatbot() {
  const chatbot = document.getElementById("chatbot");
  if (!chatbot) return;
  chatbot.style.display = "flex";

  setTimeout(() => {
    const inputField = document.getElementById("chatbot-input-field");
    if (inputField) inputField.focus();
    scrollChatToBottom();
  }, 100);

  // Default quick replies
  const suggestions =
    currentLanguage === "ka"
      ? ["მიწოდება", "ზომების ცხრილი", "გადახდის მეთოდები", "აგენტთან საუბარი"]
      : ["Shipping", "Size guide", "Payment options", "Talk to agent"];
  renderQuickReplies(suggestions);
}

// Modal open/close
function openCloseConfirm() {
  const modal = document.getElementById("chatbot-close-modal");
  if (modal) modal.style.display = "flex";
}
function confirmCloseChat() {
  const modal = document.getElementById("chatbot-close-modal");
  if (modal) modal.style.display = "none";
  const chatbot = document.getElementById("chatbot");
  if (chatbot) chatbot.style.display = "none";
}
function cancelCloseChat() {
  const modal = document.getElementById("chatbot-close-modal");
  if (modal) modal.style.display = "none";
}
function closeChatbot() {
  openCloseConfirm();
}

// Send message
async function sendChatbotMessage() {
  const inputField = document.getElementById("chatbot-input-field");
  if (!inputField) return;

  const message = inputField.value.trim();
  if (!message) return;

  addMessage(message, "user");
  inputField.value = "";
  scrollChatToBottom();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language: currentLanguage }),
    });
    const data = await res.json();

    if (data.type === "fallback") {
      const igUrl = (window && window.INSTAGRAM_URL) || "#";
      const aboutUrl = "/about";
      data.message =
        currentLanguage === "ka"
          ? `🤖 ბოდიში, ვერ ვუპასუხე. სცადეთ Instagram <a href="${igUrl}" target="_blank">აქ</a> ან <a href="${aboutUrl}">About page</a>.`
          : `🤖 Sorry, I couldn't respond. Try Instagram <a href="${igUrl}" target="_blank">here</a> or <a href="${aboutUrl}">About page</a>.`;
    }

    addMessage(data.message, "bot", data.type);
    scrollChatToBottom();

    // Follow-up quick replies
    const followUps =
      currentLanguage === "ka"
        ? ["მიწოდება", "დაბრუნება", "ზომების ცხრილი", "ინსტაგრამი"]
        : ["Shipping", "Returns", "Size chart", "Instagram"];
    renderQuickReplies(followUps);
  } catch (err) {
    console.error("Chat error:", err);
    addMessage(
      currentLanguage === "ka"
        ? "ბოდიში, ვერ ვუპასუხე. სცადეთ მოგვიანებით."
        : "Sorry, I couldn't respond. Please try again later.",
      "bot",
      "error"
    );
    scrollChatToBottom();
  }
}

// Handle Enter key
function handleChatbotKeyPress(event) {
  if (event.key === "Enter") sendChatbotMessage();
}

// Add message to chat
function addMessage(text, sender, type = "normal") {
  const messagesContainer = document.getElementById("chatbot-messages");
  if (!messagesContainer) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tbilisi",
  });

  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${text}</p>
    </div>
    <div class="message-time">${timeString}</div>
  `;

  messagesContainer.appendChild(messageDiv);
  scrollChatToBottom();
}

// Update language
function updateChatbotLanguage(lang) {
  currentLanguage = lang;
  const inputField = document.getElementById("chatbot-input-field");
  const welcomeMessage = document.getElementById("welcome-message");

  if (inputField)
    inputField.placeholder =
      lang === "en" ? "Type your question..." : "დაწერეთ თქვენი შეკითხვა...";
  if (welcomeMessage)
    welcomeMessage.textContent =
      lang === "en"
        ? "👋 Hello! How can we help you?"
        : "👋 გამარჯობა! როგორ შეგვიძლია დაგეხმაროთ?";
}

// Language switch listener
window.addEventListener("DOMContentLoaded", () => {
  const langCookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("lang="));
  if (langCookie) {
    updateChatbotLanguage(langCookie.split("=")[1]);
  }
});

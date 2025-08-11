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
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
  }
  valId = setInterval(updateCountdown, 1000);

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
  document.getElementById("slider-next").addEventListener("click", () => {
    stopAutoSlide();
    nextSlide();
    startAutoSlide();
  });

  document.getElementById("slider-prev").addEventListener("click", () => {
    stopAutoSlide();
    prevSlide();
    startAutoSlide();
  });

  // Start the slideshow
  startAutoSlide();
})();
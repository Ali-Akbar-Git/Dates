document.querySelectorAll(".custom-slideshow").forEach((slideshow) => {
  const slides = slideshow.querySelector(".slides");
  const images = slideshow.querySelectorAll(".slide");
  const autoplayEnabled = slideshow.dataset.autoplay === "true";
  const speed = Number(slideshow.dataset.speed) * 1000;

  let current = 0;
  let autoplay;
  const dotsContainer = document.createElement("div");
  dotsContainer.classList.add("dots");
  slideshow.appendChild(dotsContainer);
  images.forEach((image, index) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (index === 0) {
      dot.classList.add("active");
    }
    dot.addEventListener("click", () => {
      current = index;
      showSlide();
    });
    dotsContainer.appendChild(dot);
  });
  const dots = slideshow.querySelectorAll(".dot");
  function showSlide() {
    const slideWidth = slideshow.offsetWidth;
    slides.style.transform = `translateX(-${current * slideWidth}px)`;
    slides.style.height = `${images[current].offsetHeight}px`;
    dots.forEach((dot) => {
      dot.classList.remove("active");
    });
    dots[current].classList.add("active");
  }
  function nextSlide() {
    current = (current + 1) % images.length;
    showSlide();
  }

  function previousSlide() {
    current = (current - 1 + images.length) % images.length;
    showSlide();
  }
  function startAutoplay() {
    if (!autoplayEnabled) return;
    clearInterval(autoplay);
    autoplay = setInterval(nextSlide, speed);
  }
  function stopAutoplay() {
    clearInterval(autoplay);
  }
  if (autoplayEnabled) startAutoplay();
  slideshow.addEventListener("mouseenter", stopAutoplay);
  slideshow.addEventListener("mouseleave", startAutoplay);
  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurrentX = 0;
  let isDragging = false;

  slides.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchCurrentX = touchStartX;
      isDragging = true;

      stopAutoplay();

      // Turn animation off while finger is moving
      slides.style.transition = "none";
    },
    { passive: true },
  );

  slides.addEventListener(
    "touchmove",
    (event) => {
      if (!isDragging) return;

      touchCurrentX = event.touches[0].clientX;
      const touchCurrentY = event.touches[0].clientY;

      const distanceX = touchCurrentX - touchStartX;
      const distanceY = touchCurrentY - touchStartY;

      // Don't interfere with vertical page scrolling
      if (Math.abs(distanceY) > Math.abs(distanceX)) return;

      const slideWidth = slideshow.offsetWidth;
      const currentPosition = -(current * slideWidth);

      // Move slider WITH finger
      slides.style.transform = `translateX(${currentPosition + distanceX}px)`;
    },
    { passive: true },
  );

  slides.addEventListener(
    "touchend",
    () => {
      if (!isDragging) return;

      isDragging = false;

      const distanceX = touchCurrentX - touchStartX;
      const slideWidth = slideshow.offsetWidth;

      // Turn smooth animation back on
      slides.style.transition = "transform 0.3s ease, height 0.5s ease";

      // Finger moved more than 20% of screen
      const threshold = slideWidth * 0.2;

      if (distanceX < -threshold) {
        nextSlide();
      } else if (distanceX > threshold) {
        previousSlide();
      } else {
        // Not enough swipe → return to current slide
        showSlide();
      }

      startAutoplay();
    },
    { passive: true },
  );
});

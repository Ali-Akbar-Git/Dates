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
  images.forEach((image,index) => {
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
    slides.style.transform = `translateX(-${current * 100}%)`;
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

slides.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  stopAutoplay();
}, { passive: true });

slides.addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;

  const distanceX = touchEndX - touchStartX;
  const distanceY = touchEndY - touchStartY;

  if (
    Math.abs(distanceX) > 50 &&
    Math.abs(distanceX) > Math.abs(distanceY)
  ) {
    if (distanceX < 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  }

  startAutoplay();
}, { passive: true });
});

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
});

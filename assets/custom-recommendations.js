const section = document.querySelector(".product-recommendations");

function loadRecommendations() {
  fetch(section.dataset.url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to load product recommendations.");
      }
      return response.text();
    })
    .then((responseText) => {
      const temporaryElement = document.createElement("div");
      temporaryElement.innerHTML = responseText;
      const newSection = temporaryElement.querySelector(
        ".product-recommendations",
      );
      if (newSection && newSection.innerHTML.trim().length > 0) {
        section.innerHTML = newSection.innerHTML;
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
if (section && section.dataset.url) {
  loadRecommendations();
}

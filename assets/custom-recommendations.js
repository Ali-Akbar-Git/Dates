function initCardAddToCart() {
  document.querySelectorAll(".card-add-to-cart").forEach((button) => {
    // Prevent binding the same button more than once
    if (button.dataset.cartBound === "true") return;

    button.dataset.cartBound = "true";

    button.addEventListener("click", async () => {
      // Mobile press animation
      button.classList.add("mobile-pressed");
      button.classList.add("hover-color");

      setTimeout(() => {
        button.classList.remove("mobile-pressed");
      }, 180);

      const variantId = Number(button.dataset.variantId);

      if (!variantId) {
        console.error("Variant ID is missing.");
        return;
      }

      // Prevent double-click / duplicate request
      if (button.dataset.adding === "true") return;

      button.dataset.adding = "true";

      const originalText = button.textContent.trim();

      try {
        button.disabled = true;
        button.textContent = "Adding...";

        const response = await fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                id: variantId,
                quantity: 1,
              },
            ],
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.description ||
              result.message ||
              "Unable to add product to cart.",
          );
        }

        button.textContent = "Added!";

        document.dispatchEvent(
          new CustomEvent("Added-to-cart", {
            detail: {
              item: result,
            },
          }),
        );

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("hover-color");
        }, 2000);
      } catch (error) {
        console.error("Add to cart error:", error);
        button.textContent = originalText;
      } finally {
        button.dataset.adding = "false";

        setTimeout(() => {
          button.disabled = false;
        }, 300);
      }
    });
  });
}
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
        initCardAddToCart();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

if (section && section.dataset.url) {
  loadRecommendations();
}
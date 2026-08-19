document.querySelectorAll(".card-button").forEach((button) => {
  // Prevent binding the same button more than once
  if (button.dataset.cardBound === "true") return;

  button.dataset.cardBound = "true";

  button.addEventListener("click", async () => {
    // Apply animation to every card-button
    button.classList.add("mobile-pressed");
    button.classList.add("hover-color");

    setTimeout(() => {
      button.classList.remove("mobile-pressed");
    }, 180);

    // If this is NOT an add-to-cart button,
    // stop here after applying the animation.
    if (!button.classList.contains("card-add-to-cart")) {
      setTimeout(() => {
        button.classList.remove("hover-color");
      }, 300);

      return;
    }

    // -------------------------
    // Add to cart logic
    // -------------------------

    const variantId = Number(button.dataset.variantId);

    if (!variantId) {
      console.error("Variant ID is missing.");
      button.classList.remove("hover-color");
      return;
    }

    // Prevent duplicate requests
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
            "Unable to add product to cart."
        );
      }

      button.textContent = "Added!";

      document.dispatchEvent(
        new CustomEvent("Added-to-cart", {
          detail: {
            item: result,
          },
        })
      );

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("hover-color");
      }, 2000);
    } catch (error) {
      console.error("Add to cart error:", error);

      button.textContent = originalText;
      button.classList.remove("hover-color");
    } finally {
      button.dataset.adding = "false";

      setTimeout(() => {
        button.disabled = false;
      }, 300);
    }
  });
});
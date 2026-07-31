const mainImage = document.getElementById("mainProductImage");
const thumbnails = document.querySelectorAll(".list-image-box");
const addToCartButton = document.querySelector(".product-add-button");
const imageList = document.getElementById("image-list");
const quantityBox = document.querySelector(".product-quantity-box");
const quantityInput = document.querySelector(".product-quantity-input");
const variantTitle = document.querySelector(".product-variant-title");
const variantButtons = document.querySelectorAll(".variant-button");
const salePrice = document.querySelector(".sale-price");
const regularPrice = document.querySelector(".regular-price");
const bargainButton = document.querySelector(".product-bargin-button");
const addToCartButtonText = addToCartButton?.querySelector(".add-to-cart-button-text");
const imageDrawer = document.getElementById("productImageDrawer");
const drawerMainImage = document.getElementById("drawerMainImage");
const drawerThumbnails = Array.from(
  document.querySelectorAll(".image-drawer-thumbnail"),
);
const drawerCloseButtons = document.querySelectorAll("[data-drawer-close]");
const drawerPreviousButton = document.querySelector(
  ".image-drawer-previous",
);
const drawerNextButton = document.querySelector(".image-drawer-next");

let activeDrawerImageIndex = 0;
let previouslyFocusedElement = null;

imageList.style.height = `${mainImage?.offsetHeight}px`;
thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", () => {
    const newImageUrl = thumbnail.dataset.imageUrl;
    const thumbnailImage = thumbnail.querySelector("img");

    mainImage.src = newImageUrl;
    mainImage.alt = thumbnailImage.alt;

    thumbnails.forEach(function (item) {
      item.classList.remove("active");
    });
    thumbnail.classList.add("active");
  });
});
window.addEventListener("load", () => {
  thumbnails.forEach((thumbnail) => {
    const imageUrl = thumbnail.dataset.imageUrl;

    if (imageUrl) {
      const preloadedImage = new Image();
      preloadedImage.src = imageUrl;
    }
  });
});
addToCartButton?.addEventListener("click", async () => {
  const buttonText = addToCartButton.querySelector(".add-to-cart-button-text");
  const errorBox = document.querySelector(".product-add-error");
  const variantId = Number(addToCartButton.dataset.variantId);

  if (!variantId) {
    console.error("Variant ID is missing.");
    return;
  }

  const originalText = buttonText.textContent;

  try {
    addToCartButton.disabled = true;
    buttonText.textContent = "Adding...";

    if (errorBox) {
      errorBox.textContent = "";
    }

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
            quantity: quantityInput.value,
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

    document.dispatchEvent(
      new CustomEvent("Added-to-cart", {
        detail: {
          item: result,
        },
      }),
    );

    buttonText.textContent = "Added!";

    setTimeout(() => {
      buttonText.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error("Add to cart error:", error);

    if (errorBox) {
      errorBox.textContent = error.message;
      setTimeout(() => {
        errorBox.textContent = "";
      }, 10000);
    }
    buttonText.textContent = originalText;
  } finally {
    addToCartButton.disabled = false;
  }
});
quantityBox?.addEventListener("click", (event) => {
  const plusButton = event.target?.closest(".product-quantity-button.plus");
  const minusButton = event.target?.closest(".product-quantity-button.minus");
  if (!plusButton && !minusButton) return;
  let quantity = Number(quantityInput?.value);

  if (plusButton) {
    quantity++;
  }

  if (minusButton) {
    quantity = Math.max(1, quantity - 1);
  }
  quantityInput.value = quantity;
});
variantButtons.forEach((variantButton) => {
  variantButton.addEventListener("click", () => {
    const variantId = variantButton.dataset.variantId;
    const variantName = variantButton.dataset.variantTitle;
    const price = variantButton.dataset.price;
    const regularPriceValue = variantButton.dataset.regularPrice;
    const isAvailable = variantButton.dataset.available === "true";

    variantButtons.forEach((button) => {
      button.classList.remove("active");
    });
    variantButton.classList.add("active");
    addToCartButton.dataset.variantId = variantId;
    addToCartButton.disabled = !isAvailable;
    if (bargainButton) {
      bargainButton.disabled = !isAvailable;
    }
    if (variantTitle) {
      variantTitle.textContent = variantName;
    }
    if (salePrice) {
      salePrice.textContent = price;
    }
    if (regularPrice) {
      regularPrice.textContent = regularPriceValue;
    }
    if (addToCartButtonText) {
      addToCartButtonText.textContent = isAvailable
        ? "Add to cart"
        : "Sold out";
    }
  });
});
function updateDrawerImage(index) {
  if (!drawerThumbnails.length || !drawerMainImage) return;

  if (index < 0) {
    index = drawerThumbnails.length - 1;
  }

  if (index >= drawerThumbnails.length) {
    index = 0;
  }

  activeDrawerImageIndex = index;

  const activeThumbnail = drawerThumbnails[activeDrawerImageIndex];
  const imageUrl = activeThumbnail.dataset.drawerImage;
  const imageAlt = activeThumbnail.dataset.drawerAlt || "";

  drawerMainImage.src = imageUrl;
  drawerMainImage.alt = imageAlt;

  drawerThumbnails.forEach((thumbnail, thumbnailIndex) => {
    const isActive = thumbnailIndex === activeDrawerImageIndex;

    thumbnail.classList.toggle("active", isActive);
    thumbnail.setAttribute("aria-current", isActive ? "true" : "false");
  });

  activeThumbnail.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  });
}

function openImageDrawer(index = 0) {
  if (!imageDrawer) return;

  previouslyFocusedElement = document.activeElement;

  updateDrawerImage(index);

  imageDrawer.classList.add("open");
  imageDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("image-drawer-open");

  imageDrawer.querySelector(".image-drawer-close")?.focus();
}

function closeImageDrawer() {
  if (!imageDrawer) return;

  imageDrawer.classList.remove("open");
  imageDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("image-drawer-open");

  previouslyFocusedElement?.focus();
}

/*
 * Open the drawer from the main product image.
 * It attempts to match the currently displayed image.
 */
mainImage?.addEventListener("click", () => {
  const currentImageUrl = mainImage.currentSrc || mainImage.src;

  const matchingIndex = drawerThumbnails.findIndex((thumbnail) => {
    const drawerImageUrl = thumbnail.dataset.drawerImage;

    if (!drawerImageUrl) return false;

    return (
      currentImageUrl.includes(drawerImageUrl) ||
      drawerImageUrl.includes(currentImageUrl)
    );
  });

  openImageDrawer(matchingIndex >= 0 ? matchingIndex : 0);
});

drawerThumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener("click", () => {
    updateDrawerImage(index);
  });
});

drawerPreviousButton?.addEventListener("click", () => {
  updateDrawerImage(activeDrawerImageIndex - 1);
});

drawerNextButton?.addEventListener("click", () => {
  updateDrawerImage(activeDrawerImageIndex + 1);
});

drawerCloseButtons.forEach((button) => {
  button.addEventListener("click", closeImageDrawer);
});

document.addEventListener("keydown", (event) => {
  if (!imageDrawer?.classList.contains("open")) return;

  if (event.key === "Escape") {
    closeImageDrawer();
  }

  if (event.key === "ArrowLeft") {
    updateDrawerImage(activeDrawerImageIndex - 1);
  }

  if (event.key === "ArrowRight") {
    updateDrawerImage(activeDrawerImageIndex + 1);
  }
});
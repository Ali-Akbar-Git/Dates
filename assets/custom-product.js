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
const addToCartButtonText = addToCartButton?.querySelector(
  ".add-to-cart-button-text",
);
const fullImageDrawer = document.querySelector(".full-image-drawer");
const fullMainProductImage = document.getElementById("fullMainProductImage");
const previousImageButton = document.querySelector(".image-previous-button");
const nextImageButton = document.querySelector(".image-next-button");
const innerNextButton = document.getElementById("innerNextButton");
const innerPreviousButton = document.getElementById("innerPreviousButton");
const innerCloseButton = document.getElementById("innerCloseButton");
const stockStatus = document.querySelector(".product-stock-status");
const stockStatusText = document.querySelector(".stock-status-text");
const lowStockLimit = Number(stockStatus?.dataset.lowStockLimit || 5);
const deliveryEstimate = document.querySelector(".delivery-estimate");

function updateImageListHeight() {
  if (!mainImage || !imageList) return;

  imageList.style.height = `${mainImage.offsetHeight}px`;
}

mainImage?.addEventListener("load", updateImageListHeight);
window.addEventListener("resize", updateImageListHeight);

if (mainImage?.complete && mainImage.naturalWidth > 0) {
  requestAnimationFrame(updateImageListHeight);
}
function getCurrentImageIndex() {
  return Array.from(thumbnails).findIndex((thumbnail) =>
    thumbnail.classList.contains("active"),
  );
}

function selectProductImage(index) {
  if (!mainImage || !thumbnails.length) return;

  const normalizedIndex = (index + thumbnails.length) % thumbnails.length;

  const selectedThumbnail = thumbnails[normalizedIndex];
  const thumbnailImage = selectedThumbnail.querySelector("img");
  const newImageUrl = selectedThumbnail?.dataset.imageUrl;
  const fullImageUrl = selectedThumbnail?.dataset.fullImageUrl;

  if (!newImageUrl) return;

  mainImage.src = newImageUrl;
  mainImage.dataset.fullImageUrl = fullImageUrl;
  mainImage.alt = thumbnailImage?.alt || "";

  if (fullMainProductImage) {
    fullMainProductImage.src = fullImageUrl || newImageUrl;
    fullMainProductImage.alt = thumbnailImage?.alt || "";
  }

  thumbnails.forEach((thumbnail) => {
    thumbnail.classList.remove("active");
  });

  selectedThumbnail.classList.add("active");

  selectedThumbnail.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener("click", () => {
    selectProductImage(index);
  });
});

previousImageButton?.addEventListener("click", (event) => {
  event.stopPropagation();

  const currentIndex = getCurrentImageIndex();
  selectProductImage(currentIndex - 1);
});

nextImageButton?.addEventListener("click", (event) => {
  event.stopPropagation();

  const currentIndex = getCurrentImageIndex();
  selectProductImage(currentIndex + 1);
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
  const cartBefore = await fetch("/cart.js").then((r) => r.json());
  const quantityBefore =
    cartBefore.items.find((item) => item.variant_id === variantId)?.quantity ||
    0;
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
      const cartAfter = await fetch("/cart.js").then((r) => r.json());
      const quantityAfter =
        cartAfter.items.find((item) => item.variant_id === variantId)
          ?.quantity || 0;
      if (quantityAfter > quantityBefore) {
        document.dispatchEvent(new CustomEvent("Added-to-cart"));
      }
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
      }, 5000);
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
    const inventoryQuantity = Number(
      variantButton.dataset.inventoryQuantity || 0,
    );
    const inventoryManagement = variantButton.dataset.inventoryManagement;
    const inventoryPolicy = variantButton.dataset.inventoryPolicy;
    const variantImageId = variantButton.dataset.imageId;

    variantButtons.forEach((button) => {
      button.classList.remove("active");
    });
    variantButton.classList.add("active");
    thumbnails.forEach((thumbnail, index) => {
      if (thumbnail.dataset.imageId === variantImageId) {
        selectProductImage(index);
      }
    });
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
    if (stockStatus && stockStatusText) {
      stockStatus.classList.remove("low-stock", "sold-out");

      if (!isAvailable) {
        stockStatus.classList.add("sold-out");
        stockStatusText.textContent = "Sold out";
      } else if (
        inventoryManagement &&
        inventoryPolicy !== "continue" &&
        inventoryQuantity > 0 &&
        inventoryQuantity <= lowStockLimit
      ) {
        stockStatus.classList.add("low-stock");
        stockStatusText.textContent = `Only ${inventoryQuantity} left in stock`;
      } else {
        stockStatusText.textContent = "In stock";
      }
    }
  });
});
mainImage?.addEventListener("click", () => {
  resetFullImageZoom();
  if (fullMainProductImage) {
    fullMainProductImage.src =
      mainImage.dataset.fullImageUrl || mainImage.currentSrc || mainImage.src;
    fullMainProductImage.alt = mainImage.alt;
  }

  fullImageDrawer?.classList.add("active");
});
function addBusinessDays(startDate, daysToAdd) {
  let date = new Date(startDate);
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1);

    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    if (day !== 0 && day !== 6) {
      addedDays++;
    }
  }

  return date;
}
const today = new Date();
const lowerDays = addBusinessDays(today, 5);
const upperDays = addBusinessDays(today, 7);
const lowerDate = lowerDays.toLocaleDateString("en-GB", {
  month: "short",
  day: "2-digit",
});
const upperDate = upperDays.toLocaleDateString("en-GB", {
  month: "short",
  day: "2-digit",
});

if (deliveryEstimate) {
  deliveryEstimate.textContent = `🚚 Estimated delivery: ${lowerDate} – ${upperDate}`;
}
document.addEventListener("keydown", (event) => {
  const isDrawerOpen = fullImageDrawer?.classList.contains("active");

  // Do not change images while typing in an input or textarea
  const activeElement = document.activeElement;
  const isTyping =
    activeElement?.tagName === "INPUT" ||
    activeElement?.tagName === "TEXTAREA" ||
    activeElement?.isContentEditable;

  if (isTyping) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();

    if (isDrawerOpen) {
      resetFullImageZoom();
    }

    const currentIndex = getCurrentImageIndex();
    selectProductImage(currentIndex + 1);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();

    if (isDrawerOpen) {
      resetFullImageZoom();
    }

    const currentIndex = getCurrentImageIndex();
    selectProductImage(currentIndex - 1);
  }

  if (event.key === "Escape" && isDrawerOpen) {
    event.preventDefault();

    if (isFullImageZoomed) {
      resetFullImageZoom();
    } else {
      fullImageDrawer?.classList.remove("active");
    }
  }
});
fullImageDrawer?.addEventListener("click", (event) => {
  const clickedImage = event.target === fullMainProductImage;
  const clickedNavigation = event.target.closest(
    ".inner-image-navigation-button",
  );

  if (!clickedImage && !clickedNavigation) {
    resetFullImageZoom();
    fullImageDrawer.classList.remove("active");
  }
});
let isFullImageZoomed = false;
let isDraggingZoomedImage = false;
let hasDraggedZoomedImage = false;

let zoomDragStartX = 0;
let zoomDragStartY = 0;

let zoomTranslateX = 0;
let zoomTranslateY = 0;

let zoomStartTranslateX = 0;
let zoomStartTranslateY = 0;

function resetFullImageZoom() {
  if (!fullMainProductImage) return;

  isFullImageZoomed = false;
  isDraggingZoomedImage = false;
  hasDraggedZoomedImage = false;

  zoomTranslateX = 0;
  zoomTranslateY = 0;
  zoomStartTranslateX = 0;
  zoomStartTranslateY = 0;

  fullMainProductImage.classList.remove("zoomed", "dragging");
  fullMainProductImage.style.transformOrigin = "center center";
  fullMainProductImage.style.removeProperty("--zoom-x");
  fullMainProductImage.style.removeProperty("--zoom-y");
}
function updateZoomedImagePosition() {
  if (!fullMainProductImage) return;

  fullMainProductImage.style.setProperty("--zoom-x", `${zoomTranslateX}px`);

  fullMainProductImage.style.setProperty("--zoom-y", `${zoomTranslateY}px`);
}

fullMainProductImage?.addEventListener("pointerdown", (event) => {
  if (!isFullImageZoomed) return;

  event.preventDefault();
  event.stopPropagation();

  isDraggingZoomedImage = true;
  hasDraggedZoomedImage = false;

  zoomDragStartX = event.clientX;
  zoomDragStartY = event.clientY;

  zoomStartTranslateX = zoomTranslateX;
  zoomStartTranslateY = zoomTranslateY;

  fullMainProductImage.classList.add("dragging");
  fullMainProductImage.setPointerCapture(event.pointerId);
});

fullMainProductImage?.addEventListener("pointermove", (event) => {
  if (!isDraggingZoomedImage || !isFullImageZoomed) return;

  event.preventDefault();

  const movedX = event.clientX - zoomDragStartX;
  const movedY = event.clientY - zoomDragStartY;

  if (Math.abs(movedX) > 4 || Math.abs(movedY) > 4) {
    hasDraggedZoomedImage = true;
  }

  zoomTranslateX = zoomStartTranslateX + movedX;
  zoomTranslateY = zoomStartTranslateY + movedY;

  updateZoomedImagePosition();
});

function stopZoomedImageDrag(event) {
  if (!isDraggingZoomedImage) return;

  isDraggingZoomedImage = false;
  fullMainProductImage?.classList.remove("dragging");

  if (
    event?.pointerId !== undefined &&
    fullMainProductImage?.hasPointerCapture(event.pointerId)
  ) {
    fullMainProductImage.releasePointerCapture(event.pointerId);
  }
}

fullMainProductImage?.addEventListener("pointerup", stopZoomedImageDrag);

fullMainProductImage?.addEventListener("pointercancel", stopZoomedImageDrag);

fullMainProductImage?.addEventListener(
  "lostpointercapture",
  stopZoomedImageDrag,
);

fullMainProductImage?.addEventListener("click", (event) => {
  event.stopPropagation();

  /*
   * Do not remove zoom after dragging.
   * Pointer dragging normally generates a click afterward.
   */
  if (hasDraggedZoomedImage) {
    hasDraggedZoomedImage = false;
    return;
  }

  if (isFullImageZoomed) {
    resetFullImageZoom();
    return;
  }

  const imageRect = fullMainProductImage.getBoundingClientRect();

  const cursorX = event.clientX - imageRect.left;
  const cursorY = event.clientY - imageRect.top;

  const originX = Math.max(0, Math.min(100, (cursorX / imageRect.width) * 100));

  const originY = Math.max(
    0,
    Math.min(100, (cursorY / imageRect.height) * 100),
  );

  zoomTranslateX = 0;
  zoomTranslateY = 0;

  fullMainProductImage.style.setProperty("--zoom-x", "0px");
  fullMainProductImage.style.setProperty("--zoom-y", "0px");
  fullMainProductImage.style.transformOrigin = `${originX}% ${originY}%`;
  fullMainProductImage.classList.add("zoomed");

  isFullImageZoomed = true;
});

innerCloseButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  resetFullImageZoom();
  fullImageDrawer?.classList.remove("active");
});

innerNextButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  resetFullImageZoom();

  const currentIndex = getCurrentImageIndex();
  selectProductImage(currentIndex + 1);
});

innerPreviousButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  resetFullImageZoom();

  const currentIndex = getCurrentImageIndex();
  selectProductImage(currentIndex - 1);
});
/* =========================================
   PRODUCT IMAGE SWIPE
   Enabled at 1024px and below
========================================= */
const swipeMediaQuery = window.matchMedia("(max-width: 1024px)");

let swipeStartX = 0;
let swipeStartY = 0;
let swipeEndX = 0;
let swipeEndY = 0;
let swipeInProgress = false;
let blockNextClick = false;

const minimumSwipeDistance = 50;

function startImageSwipe(event) {
  if (!swipeMediaQuery.matches || event.touches.length !== 1) return;

  const drawerIsOpen = fullImageDrawer?.classList.contains("active");

  /*
   * When the drawer image is zoomed, touch movement should drag
   * the zoomed image instead of changing product images.
   */
  if (drawerIsOpen && isFullImageZoomed) return;
  const touch = event.touches[0];

  swipeStartX = touch.clientX;
  swipeStartY = touch.clientY;
  swipeEndX = swipeStartX;
  swipeEndY = swipeStartY;
  swipeInProgress = true;
}

function moveImageSwipe(event) {
  const drawerIsOpen = fullImageDrawer?.classList.contains("active");

  if (
    !swipeMediaQuery.matches ||
    !swipeInProgress ||
    event.touches.length !== 1 ||
    (drawerIsOpen && isFullImageZoomed)
  ) {
    return;
  }

  const touch = event.touches[0];

  swipeEndX = touch.clientX;
  swipeEndY = touch.clientY;

  const horizontalDistance = Math.abs(swipeEndX - swipeStartX);
  const verticalDistance = Math.abs(swipeEndY - swipeStartY);

  /*
   * Stop the browser from moving horizontally while swiping images.
   * Vertical page scrolling will continue working normally.
   */
  if (horizontalDistance > verticalDistance) {
    event.preventDefault();
  }
}

function endImageSwipe() {
  const drawerIsOpen = fullImageDrawer?.classList.contains("active");

  if (drawerIsOpen && isFullImageZoomed) {
    swipeInProgress = false;
    return;
  }
  if (!swipeMediaQuery.matches || !swipeInProgress) return;

  swipeInProgress = false;

  const horizontalDistance = swipeEndX - swipeStartX;
  const verticalDistance = swipeEndY - swipeStartY;

  const isHorizontalSwipe =
    Math.abs(horizontalDistance) > Math.abs(verticalDistance);

  const passedMinimumDistance =
    Math.abs(horizontalDistance) >= minimumSwipeDistance;

  if (!isHorizontalSwipe || !passedMinimumDistance) return;

  blockNextClick = true;

  if (drawerIsOpen) {
    resetFullImageZoom();
  }

  const currentIndex = getCurrentImageIndex();

  if (horizontalDistance < 0) {
    // Swipe left: show next image
    selectProductImage(currentIndex + 1);
  } else {
    // Swipe right: show previous image
    selectProductImage(currentIndex - 1);
  }

  /*
   * A touch swipe may create a click immediately afterward.
   * Temporarily block it so the drawer does not open, close, or zoom.
   */
  window.setTimeout(() => {
    blockNextClick = false;
  }, 300);
}

function cancelImageSwipe() {
  swipeInProgress = false;
}

/* Main product image swipe */
mainImage?.addEventListener("touchstart", startImageSwipe, {
  passive: true,
});

mainImage?.addEventListener("touchmove", moveImageSwipe, {
  passive: false,
});

mainImage?.addEventListener("touchend", endImageSwipe);

mainImage?.addEventListener("touchcancel", cancelImageSwipe);

/* Fullscreen drawer swipe */
fullImageDrawer?.addEventListener("touchstart", startImageSwipe, {
  passive: true,
});

fullImageDrawer?.addEventListener("touchmove", moveImageSwipe, {
  passive: false,
});

fullImageDrawer?.addEventListener("touchend", endImageSwipe);

fullImageDrawer?.addEventListener("touchcancel", cancelImageSwipe);

/*
 * Block clicks created by a completed swipe.
 * Capture mode runs before your existing click handlers.
 */
mainImage?.addEventListener(
  "click",
  (event) => {
    if (!blockNextClick) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  },
  true,
);

fullImageDrawer?.addEventListener(
  "click",
  (event) => {
    if (!blockNextClick) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  },
  true,
);

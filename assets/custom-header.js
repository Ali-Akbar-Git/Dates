const searchBtn = document.querySelector(".search-button");
const searchDrawer = document.querySelector(".search-drawer");
const cartDrawer = document.querySelector(".cart-drawer");
const closeBtn = document.querySelector(".close-button");
const plusIcon = document.querySelector(".icon-plus").innerHTML;
const minusIcon = document.querySelector(".icon-minus").innerHTML;
const shippingIcon = document.querySelector(".icon-shipping").innerHTML;
const discountIcon = document.querySelector(".icon-discount").innerHTML;
const completeIcon = document.querySelector(".icon-complete").innerHTML;
const binIcon = document.querySelector(".icon-bin").innerHTML;
const cartWrapper = document.querySelector(".cart-wrapper");
const variables = document.querySelector(".variables");
const cartCounter = document.querySelector(".cart-counter");
const cartCounterInner = document.querySelector(".cart-counter-inner");
const menuOpenButton = document.querySelector(".menu-open-button");
const menuCloseButton = document.querySelector(".menu-close-button");
const menuBox = document.querySelector(".menu-box");
const customHeader = document.querySelector(".custom-header");
const cartPageWrapper = document.querySelector(".cart-page-wrapper");

const freeShipping = Number(variables.dataset.freeShipping);
const discountThreshold = Number(variables.dataset.discountThreshold);
const discountPercentage = Number(variables.dataset.discountPercentage);
const shippingPercentage = (freeShipping * 100) / discountThreshold;
searchBtn?.addEventListener("click", () => {
  searchDrawer?.classList.toggle("active");
});
function lockScroll() {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}
let cartHistoryActive = false;

function openCartDrawer() {
  searchDrawer?.classList.remove("active");
  cartDrawer?.classList.add("active");
  lockScroll();

  // Only add history state on mobile/tablet
  if (window.matchMedia("(max-width: 767px)").matches && !cartHistoryActive) {
    history.pushState({ cartDrawerOpen: true }, "");
    cartHistoryActive = true;
  }
}

function closeCartDrawer(fromPopState = false) {
  cartDrawer?.classList.remove("active");
  unlockScroll();

  if (cartHistoryActive) {
    cartHistoryActive = false;

    // If user clicked X / backdrop, remove our fake history entry.
    // If Back button caused this close, history has already moved back.
    if (!fromPopState) {
      history.back();
    }
  }
}
function updateCartCounter(cart) {
  if (cart.item_count > 0) {
    cartCounter.textContent = cart.item_count > 99 ? "99+" : cart.item_count;
    cartCounterInner.textContent =
      cart.item_count > 99 ? "99+" : cart.item_count;
  } else {
    cartCounter.textContent = "";
    cartCounterInner.textContent = "";
  }
}
document.querySelectorAll(".cart-button").forEach((button) => {
  button.addEventListener("click", () => {
    openCartDrawer();
  });
});

closeBtn?.addEventListener("click", () => {
  closeCartDrawer();
});
window.addEventListener("popstate", () => {
  if (cartDrawer?.classList.contains("active") && cartHistoryActive) {
    closeCartDrawer(true);
  }
});
document.querySelectorAll(".drawer").forEach((drawer) => {
  drawer.addEventListener("click", (e) => {
    if (e.target !== drawer) return;

    if (drawer === cartDrawer) {
      closeCartDrawer();
    } else {
      drawer.classList.remove("active");
      unlockScroll();
    }
  });
});
async function loadCart() {
  cartWrapper?.classList.add("loading");
  cartPageWrapper?.classList.add("loading");
  try {
    const response = await fetch("/cart.js");

    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }

    const cart = await response.json();

    updateCartCounter(cart);
    renderCart(cart);
  } catch (error) {
    console.error("Cart error:", error);
  } finally {
    cartWrapper?.classList.remove("loading");
    cartPageWrapper?.classList.remove("loading");
  }
}
loadCart();
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    loadCart();
  }
});
function formatMoney(cents) {
  const amount = cents / 100;

  return `Rs.${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
let oldProgress = 0;
function renderCart(cart) {
  if (cart.item_count === 0) {
    oldProgress = 0;

    const emptyHTML = `
    <div class="empty-cart">
      Your cart is currently empty.
    </div>
  `;

    if (cartWrapper) {
      cartWrapper.innerHTML = emptyHTML;
    }

    if (cartPageWrapper) {
      cartPageWrapper.innerHTML = emptyHTML;
    }

    return;
  }
  const subtotal = cart.items_subtotal_price / 100;
  const progressPercentage = (subtotal * 100) / discountThreshold;
  const displayedSubtotal =
    subtotal >= discountThreshold
      ? subtotal * (1 - discountPercentage / 100) * 100
      : subtotal * 100;
  let offerText = "";
  let ShippingIcon;
  let DiscountIcon;
  let shippingClass = "";
  let discountClass = "";
  if (subtotal >= discountThreshold) {
    offerText = `Congratulations! You have unlocked the ${discountPercentage}% discount!`;
    ShippingIcon = completeIcon;
    DiscountIcon = completeIcon;
    shippingClass = "complete";
    discountClass = "complete";
  } else if (subtotal >= freeShipping) {
    const remainingAmount = formatMoney((discountThreshold - subtotal) * 100);
    offerText = `Add ${remainingAmount} more to get a ${discountPercentage}% discount on this order`;
    ShippingIcon = completeIcon;
    DiscountIcon = discountIcon;
    shippingClass = "complete";
    discountClass = "";
  } else {
    const remainingAmount = formatMoney((freeShipping - subtotal) * 100);
    offerText = `Add ${remainingAmount} more to get Free Shipping on this order`;
    ShippingIcon = shippingIcon;
    DiscountIcon = discountIcon;
    shippingClass = "";
    discountClass = "";
  }
  const cartItems = cart.items
    .map((item, index) => {
      return `
       <div class="cart-item" data-line="${index + 1}">
          <a href="${item.url}">
          <img
            src="${item.image}"
            alt="${item.product_title}"
            class="item-image"
          >
          </a>
        <div class="item-info">
          <a href="${item.url}" class="item-title">
            ${item.product_title}
          </a>
          <div class="variant">
          <span>Weight: </span>
          ${item.variant_title}
          </div>
          <div class="item-price">
            ${formatMoney(item.final_line_price)}
          </div>
          <div class="item-quantity">
            <div class="quantity-box">
              <div class="button-box">            
                <button class="quantity-button minus">
                  ${minusIcon}
                </button>
              </div>
              <input
                class="quantity-input"
                type="text"
                inputmode="numeric"
                value="${item.quantity}"
              >
              <div class="button-box">
                <button class="quantity-button plus">
                  ${plusIcon}
                </button>
              </div>
            </div>
            <div class="remove-box">
              <span class="remove">${binIcon}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
  const cartHTML = `
  <div class="cart-content">
    <div class="cart-offer-box">
      <div class="current-offer">
        ${offerText}
      </div>
      <div class="progress-area">
        <div class="progress-track" style="--progress: ${oldProgress}%; --shipping: ${shippingPercentage}%;">
          <div class="progress-bar"></div>
          <div class="circle shipping-circle ${shippingClass}">
          ${ShippingIcon}
          </div>
          <div class="circle discount-circle ${discountClass}">
          ${DiscountIcon}
          </div>
          <span class="shipping-label">Free Shipping!</span>
          <span class="discount-label">${discountPercentage}% Off</span>
        </div>
      </div>
    </div>
    ${cartItems}
  </div>
  <div class="cart-footer">
    <div class="cart-total">
      <span class="sub-total-text"> Subtotal </span>
      <span class="sub-total">
        ${formatMoney(displayedSubtotal)}
      </span>
    </div>
    <div class="buttons">
      <a href="/checkout" class="checkout" >
      <button class="checkout-button">
        <span>Checkout</span> 
      </button>
      </a>
      <a href="/cart" class="view-cart"> View Cart </a>
    </div>
  </div>
  `;
  if (cartWrapper) {
    cartWrapper.innerHTML = cartHTML;
  }

  if (cartPageWrapper) {
    cartPageWrapper.innerHTML = cartHTML;
  }
  oldProgress = progressPercentage;
  const newProgressTracks = document.querySelectorAll(
    ".cart-wrapper .progress-track, .cart-page-wrapper .progress-track",
  );
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newProgressTracks.forEach((track) => {
        track.style.setProperty("--progress", `${progressPercentage}%`);
      });
    });
  });
}
async function handleCartClick(event) {
  const plusButton = event.target?.closest(".quantity-button.plus");
  const minusButton = event.target?.closest(".quantity-button.minus");
  const removeButton = event.target?.closest(".remove");

  if (!plusButton && !minusButton && !removeButton) return;

  const cartItem = event.target?.closest(".cart-item");
  if (!cartItem) return;

  const input = cartItem.querySelector(".quantity-input");
  const line = Number(cartItem.dataset.line);

  let quantity = Number(input.value);

  if (plusButton) {
    quantity++;
  }

  if (minusButton) {
    quantity--;

    if (quantity < 0) {
      quantity = 0;
    }
  }

  if (removeButton) {
    quantity = 0;
  }

  await changeCartQuantity(line, quantity);
}

cartWrapper?.addEventListener("click", handleCartClick);
cartPageWrapper?.addEventListener("click", handleCartClick);
async function changeCartQuantity(line, quantity) {
  cartWrapper?.classList.add("loading");
  cartPageWrapper?.classList.add("loading");
  try {
    const response = await fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        line: line,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update cart");
    }
    const cart = await response.json();
    renderCart(cart);
    updateCartCounter(cart);
  } catch (error) {
    console.error("Cart update error:", error);
  } finally {
    cartWrapper?.classList.remove("loading");
    cartPageWrapper?.classList.remove("loading");
  }
}
async function handleCartKeydown(event) {
  if (event.key !== "Enter") return;

  const input = event.target?.closest(".quantity-input");
  if (!input) return;

  event.preventDefault();

  const cartItem = input.closest(".cart-item");
  if (!cartItem) return;

  const line = Number(cartItem.dataset.line);

  let quantity = Number(input.value);

  if (!Number.isFinite(quantity) || quantity < 0) {
    quantity = 0;
  }

  quantity = Math.floor(quantity);

  await changeCartQuantity(line, quantity);
}

cartWrapper?.addEventListener("keydown", handleCartKeydown);
cartPageWrapper?.addEventListener("keydown", handleCartKeydown);
document.addEventListener("Added-to-cart", async (event) => {
  await loadCart();

  if (event.detail?.openDrawer) {
    openCartDrawer();
  }
});
menuOpenButton?.addEventListener("click", () => {
  menuBox?.classList.add("active");
  customHeader?.classList.add("menu-active");
  menuOpenButton?.setAttribute("aria-expanded", "true");
  lockScroll();
});
menuCloseButton?.addEventListener("click", () => {
  menuBox?.classList.remove("active");
  customHeader?.classList.remove("menu-active");
  menuOpenButton?.setAttribute("aria-expanded", "false");
  unlockScroll();
});

menuBox?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuBox?.classList.remove("active");
    customHeader?.classList.remove("menu-active");

    menuOpenButton?.setAttribute("aria-expanded", "false");
    unlockScroll();
  });
});
document.querySelectorAll(".submenu-toggle").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const menuItem = button.closest(".menu-item");
    if (!menuItem) return;

    const isOpen = menuItem.classList.contains("submenu-open");

    // Close other open submenus
    document.querySelectorAll(".menu-item.submenu-open").forEach((item) => {
      if (item !== menuItem) {
        item.classList.remove("submenu-open");

        const toggle = item.querySelector(".submenu-toggle");
        toggle?.setAttribute("aria-expanded", "false");
      }
    });

    menuItem.classList.toggle("submenu-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});
document.addEventListener("click", (event) => {
  if (
    menuBox?.classList.contains("active") &&
    !menuBox.contains(event.target) &&
    !menuOpenButton?.contains(event.target)
  ) {
    menuBox?.classList.remove("active");
    customHeader?.classList.remove("menu-active");
    menuOpenButton?.setAttribute("aria-expanded", "false");
    unlockScroll();
  }
});
let touchStartX = 0;
let touchEndX = 0;

menuBox?.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
});

menuBox?.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].clientX;

  const swipeDistance = touchStartX - touchEndX;

  // Swipe left (right → left)
  if (swipeDistance > 50) {
    menuBox?.classList.remove("active");
    customHeader?.classList.remove("menu-active");
    menuOpenButton?.setAttribute("aria-expanded", "false");
    unlockScroll();
  }
});

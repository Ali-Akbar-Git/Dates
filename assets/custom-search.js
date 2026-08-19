document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.querySelector("#SortBy");
  const sortWrapper = document.querySelector(".search-sort-wrapper");

  if (!sortSelect || !sortWrapper) return;

  // User selected an option
  sortSelect.addEventListener("change", () => {

    const url = new URL(window.location.href);

    url.searchParams.set("sort_by", sortSelect.value);
    url.searchParams.delete("page");

    window.location.href = url.toString();
  });
});
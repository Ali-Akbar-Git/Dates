document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.querySelector("#CollectionSortBy");

  if (!sortSelect) return;

  sortSelect.addEventListener("change", () => {
    const url = new URL(window.location.href);

    url.searchParams.set("sort_by", sortSelect.value);

    // Reset pagination when sorting changes
    url.searchParams.delete("page");

    window.location.href = url.toString();
  });
});
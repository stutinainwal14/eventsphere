function openModal() {
    document.getElementById("editModal").style.display = "flex";
  }
  
  function closeModal() {
    document.getElementById("editModal").style.display = "none";
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("editForm").addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Changes saved (placeholder)");
      closeModal();
    });
  });
  
  // Optional: Click outside to close
  window.addEventListener("click", function (e) {
    const modal = document.getElementById("editModal");
    if (e.target === modal) {
      closeModal();
    }
  });
  
// Open the modal (you'll call this when Edit is clicked)
function openModal() {
    document.getElementById("editModal").style.display = "flex";
  }
  
  // Close the modal
  function closeModal() {
    document.getElementById("editModal").style.display = "none";
  }
  
  // Hook into form submission (replace with backend logic later)
  document.getElementById("editForm").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Changes saved (not really, just a placeholder)!");
    closeModal();
  });
  
  window.addEventListener("click", function (e) {
    const modal = document.getElementById("editModal");
    if (e.target === modal) {
      closeModal();
    }
  });
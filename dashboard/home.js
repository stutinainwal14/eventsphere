// Redirect if not logged in
if (!localStorage.getItem("token")) {
    window.location.href = "../../auth/login/login.html";
  }
  
  // Logout button handler
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "../../public/homepage/index.html";
  });
  
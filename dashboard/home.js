
// Protect dashboard with token check
if (!localStorage.getItem("token")) {
  window.location.href = "../../auth/login/login.html";
}

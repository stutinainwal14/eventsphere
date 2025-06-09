document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page"); // 'insights', 'trending', etc.
    fetch("../sidebar.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("sidebar").innerHTML = data;
  
        // Set active class after DOM is inserted
        const links = document.querySelectorAll(".sidebar nav a");
        links.forEach(link => {
          if (link.dataset.page === page) {
            link.classList.add("active");
          }
        });
      })
      .catch(err => console.error("Sidebar load failed", err));
  });
  
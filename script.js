document.addEventListener("DOMContentLoaded", () => {
  // Get references to elements
  const burgerMenu = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu a");

  // Toggle the 'open' class when the burger menu is clicked
  burgerMenu.addEventListener("click", () => {
    burgerMenu.classList.toggle("open");
    navMenu.classList.toggle("open");
  });

  // Close the menu when a link is clicked and scroll to the section
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      // Only intercept internal section links (those that start with '#')
      if (href.startsWith("#")) {
        event.preventDefault();

        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        burgerMenu.classList.remove("open");
        navMenu.classList.remove("open");
      }
      // Else: allow normal behavior for external or separate-page links
    });
  });
});

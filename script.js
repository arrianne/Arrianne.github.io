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
      // Prevent default anchor link behavior
      event.preventDefault();

      // Get the target section from the href attribute
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      // Smooth scroll to the section
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      // Close the menu after clicking a link
      burgerMenu.classList.remove("open");
      navMenu.classList.remove("open");
    });
  });
});

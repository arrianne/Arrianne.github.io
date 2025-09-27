document.addEventListener("DOMContentLoaded", () => {
  // Get references safely
  const burgerMenu = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu a");
  const heading = document.getElementById("hero-title");
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  const isMobile = window.innerWidth < 768;

  // Add fade-in to heading if it exists
  if (heading) {
    heading.classList.add("fade-in");
  }

  // Only assign sliding directions if there are portfolio items and on mobile
  if (isMobile && portfolioItems.length > 0) {
    portfolioItems.forEach((item, index) => {
      item.classList.add(index % 2 === 0 ? "from-left" : "from-right");
    });
  }

  // Set up Intersection Observer only if portfolio items exist
  if (portfolioItems.length > 0) {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target;
            if (isMobile) {
              const index = Array.from(portfolioItems).indexOf(item);
              item.classList.add(
                index % 2 === 0 ? "fade-in-left" : "fade-in-right"
              );
            } else {
              item.classList.add("fade-in");
            }
            observer.unobserve(item); // Observe only once
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    portfolioItems.forEach((item) => observer.observe(item));
  }

  // Burger menu toggle
  if (burgerMenu && navMenu) {
    burgerMenu.addEventListener("click", () => {
      burgerMenu.classList.toggle("open");
      navMenu.classList.toggle("open");
    });
  }

  // Nav links smooth scroll & close menu on click for internal links
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

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

        if (burgerMenu && navMenu) {
          burgerMenu.classList.remove("open");
          navMenu.classList.remove("open");
        }
      }
    });
  });
});

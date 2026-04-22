document.addEventListener("DOMContentLoaded", () => {
  // Get references safely
  const header = document.getElementById("header");
  const burgerMenu = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu a, .hero-pill-nav a");
  const pillNav = document.getElementById("hero-pill-nav");
  const pillHost = document.getElementById("hero-pill-dock-host");
  const pillSpacer = document.getElementById("pill-nav-spacer");
  const pillLinks = pillNav
    ? pillNav.querySelectorAll(".hero-pill-nav__link[href^='#']")
    : [];
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

  function pillMinTopPx() {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--pill-min-top")
      .trim();
    return Number.parseFloat(raw) || 20;
  }

  /**
   * Eve Kayser–style: the fixed bar's top = the in-flow spacer's top, clamped to a safe min inset
   * once the spacer would scroll above that line. No mixing with the title (that caused mid-viewport glitches).
   */
  function syncPillToSpacer() {
    if (!pillHost || !pillNav || !pillSpacer) return;
    const h = Math.max(1, Math.round(pillNav.getBoundingClientRect().height));
    pillSpacer.style.height = `${h}px`;
    document.documentElement.style.setProperty("--pill-spacer-in-flow-h", `${h}px`);
    const minT = pillMinTopPx();
    const st = pillSpacer.getBoundingClientRect().top;
    const topPx = Math.max(minT, st);
    pillHost.style.top = `${topPx}px`;
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    syncPillToSpacer();
  });
  window.addEventListener("resize", syncPillToSpacer, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncPillToSpacer);
    window.visualViewport.addEventListener("scroll", syncPillToSpacer);
  }
  syncPillToSpacer();
  requestAnimationFrame(syncPillToSpacer);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncPillToSpacer);
  }
  if (typeof ResizeObserver !== "undefined" && pillNav) {
    const ro = new ResizeObserver(() => syncPillToSpacer());
    ro.observe(pillNav);
  }

  function scrollOffsetForAnchors() {
    const pillH = pillNav ? pillNav.getBoundingClientRect().height : 0;
    const headerH = header ? header.offsetHeight : 0;
    return Math.max(pillH + 20, headerH + 12, 72);
  }

  // Nav links smooth scroll & close menu on click for internal links
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        event.preventDefault();

        if (targetId === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const offset = scrollOffsetForAnchors();
          const elementPosition =
            targetSection.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - offset);

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }

        if (burgerMenu && navMenu) {
          burgerMenu.classList.remove("open");
          navMenu.classList.remove("open");
        }
      }
    });
  });

  /* Pill nav active state (in-view sections) */
  if (pillLinks.length) {
    const setActive = (target) => {
      pillLinks.forEach((a) => {
        const on = a.dataset.navTarget === target;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    };

    const sections = [
      { id: "home", el: document.getElementById("home") },
      { id: "about", el: document.getElementById("about") },
      { id: "portfolio", el: document.getElementById("portfolio") },
      { id: "contact", el: document.getElementById("contact") },
    ].filter((s) => s.el);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          const id = visible[0].target.id;
          const map = {
            home: "home",
            about: "about",
            portfolio: "portfolio",
            contact: "contact",
          };
          if (map[id]) setActive(map[id]);
        }
      },
      { root: null, rootMargin: "-22% 0px -38% 0px", threshold: [0, 0.08, 0.2] }
    );

    sections.forEach(({ el }) => observer.observe(el));

    const onScrollHome = () => {
      if (window.scrollY < 100) setActive("home");
    };
    window.addEventListener("scroll", onScrollHome, { passive: true });
    onScrollHome();
  }
});

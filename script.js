document.addEventListener("DOMContentLoaded", () => {
  // Get references safely
  const header = document.getElementById("header");
  const burgerMenu = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(
    ".header__wordmark, .nav-menu a, .hero-pill-nav a"
  );
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

  /* Lazy-load + politely autoplay portfolio preview videos */
  const lazyVideos = document.querySelectorAll("video[data-video-lazy]");
  if (lazyVideos.length > 0) {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      navigator.connection && navigator.connection.saveData === true;

    const loadVideo = (videoEl) => {
      if (!videoEl || videoEl.dataset.videoLoaded === "true") return;
      const source = videoEl.querySelector("source[data-src]");
      if (!source) return;
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      videoEl.load();
      videoEl.dataset.videoLoaded = "true";
    };

    const maybeAutoplay = async (videoEl) => {
      if (!videoEl) return;
      if (prefersReducedMotion || saveData) return;
      try {
        await videoEl.play();
      } catch (_) {
        // Autoplay can be blocked; that's fine (poster will show).
      }
    };

    if (typeof IntersectionObserver !== "undefined") {
      const videoObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const videoEl = entry.target;
            loadVideo(videoEl);
            maybeAutoplay(videoEl);
            obs.unobserve(videoEl);
          });
        },
        { rootMargin: "250px 0px", threshold: 0.01 }
      );

      lazyVideos.forEach((v) => videoObserver.observe(v));
    } else {
      // Fallback for older browsers: just load immediately.
      lazyVideos.forEach((v) => {
        loadVideo(v);
        maybeAutoplay(v);
      });
    }
  }

  let menuScrollY = 0;

  /** On narrow viewports, lock fixed chrome to measured width (incl. visualViewport on iOS). */
  function syncFixedShellWidth() {
    if (window.innerWidth >= 768) {
      document.documentElement.style.removeProperty("--layout-width");
      if (header) {
        header.style.removeProperty("width");
      }
      return;
    }
    const vv = window.visualViewport;
    const w = vv
      ? Math.max(0, Math.round(vv.width))
      : document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--layout-width", `${w}px`);
  }

  function setMenuOpen(open) {
    if (!burgerMenu || !navMenu) return;
    const wasOpen = navMenu.classList.contains("open");
    burgerMenu.classList.toggle("open", open);
    navMenu.classList.toggle("open", open);
    burgerMenu.setAttribute("aria-expanded", open ? "true" : "false");
    burgerMenu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in navMenu) {
      navMenu.inert = !open;
    }
    document.documentElement.classList.toggle("nav-menu-open", open);
    document.body.classList.toggle("nav-menu-open", open);

    if (open) {
      if (window.innerWidth < 768) {
        menuScrollY = window.scrollY || document.documentElement.scrollTop;
        document.body.style.position = "fixed";
        document.body.style.top = `-${menuScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
      }
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      if (wasOpen) {
        window.scrollTo(0, menuScrollY);
      }
    }

    requestAnimationFrame(() => {
      syncFixedShellWidth();
    });
  }

  if (burgerMenu && navMenu) {
    burgerMenu.addEventListener("click", () => {
      setMenuOpen(!navMenu.classList.contains("open"));
    });
  }

  if (navMenu) {
    navMenu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a && navMenu.contains(a)) {
        setMenuOpen(false);
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu && navMenu.classList.contains("open")) {
      setMenuOpen(false);
    }
  });


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
    if (navMenu && navMenu.classList.contains("open")) {
      return;
    }
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    syncPillToSpacer();
  });
  function onResizeOrViewport() {
    if (window.innerWidth >= 768) {
      setMenuOpen(false);
    }
    syncPillToSpacer();
    syncFixedShellWidth();
  }

  window.addEventListener("resize", onResizeOrViewport, { passive: true });
  window.addEventListener(
    "orientationchange",
    () => {
      setTimeout(() => {
        onResizeOrViewport();
      }, 200);
    },
    { passive: true }
  );
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onResizeOrViewport, {
      passive: true,
    });
    window.visualViewport.addEventListener("scroll", syncPillToSpacer, {
      passive: true,
    });
    window.visualViewport.addEventListener("scroll", syncFixedShellWidth, {
      passive: true,
    });
  }
  syncPillToSpacer();
  syncFixedShellWidth();
  requestAnimationFrame(() => {
    syncPillToSpacer();
    syncFixedShellWidth();
  });
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

        const doScroll = () => {
          if (targetId === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          const offset = scrollOffsetForAnchors();
          const elementPosition =
            targetSection.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - offset);
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        };

        // On mobile, close the menu FIRST (it restores scroll position) then scroll.
        if (navMenu && navMenu.classList.contains("open")) {
          setMenuOpen(false);
          requestAnimationFrame(() => {
            requestAnimationFrame(doScroll);
          });
        } else {
          doScroll();
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

  setMenuOpen(false);
});

/** Match curved badge text to real path length (textLength="100%" is inconsistent with textPath). */
function syncHeroBadgeTextLength() {
  const path = document.getElementById("hero-badge-text-path");
  const text = document.querySelector(".hero-rotating-badge__text");
  if (!path || !text || !text.querySelector("textPath")) return;
  try {
    const len = path.getTotalLength();
    if (len > 0) {
      text.setAttribute("textLength", len.toFixed(3));
      /* spacing only on all breakpoints — spacingAndGlyphs often leaves a gap on closed paths (desktop Chrome). */
      text.setAttribute("lengthAdjust", "spacing");
    }
  } catch (_) {
    /* ignore */
  }
}

function scheduleHeroBadgeTextSync() {
  syncHeroBadgeTextLength();
  requestAnimationFrame(() => {
    syncHeroBadgeTextLength();
    requestAnimationFrame(syncHeroBadgeTextLength);
  });
}

function wireHeroBadgeTextSync() {
  const run = () => scheduleHeroBadgeTextSync();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireHeroBadgeTextSync);
} else {
  wireHeroBadgeTextSync();
}

window.addEventListener("load", scheduleHeroBadgeTextSync);

/* Wide layouts sometimes lay out after first paint; one late sync helps close the ring */
setTimeout(scheduleHeroBadgeTextSync, 250);

let heroBadgeResizeRaf = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(heroBadgeResizeRaf);
  heroBadgeResizeRaf = requestAnimationFrame(scheduleHeroBadgeTextSync);
});

const heroTitle = document.getElementById("hero-title");
const fadeEnd = 200; // px
let fakeScroll = 0;
let animationDone = false;
const minOpacity = 0.5; // Minimum opacity value

window.addEventListener(
  "wheel",
  function (e) {
    if (!animationDone) {
      e.preventDefault();
      fakeScroll += e.deltaY;
      fakeScroll = Math.max(0, Math.min(fadeEnd, fakeScroll));

      // Animate hero title with minimum opacity
      let opacity = 1 - fakeScroll / fadeEnd;
      opacity = Math.max(minOpacity, Math.min(1, opacity));
      heroTitle.style.opacity = opacity;
      heroTitle.style.setProperty(
        "--hero-title-y",
        `${-fakeScroll / 3}px`
      );

      if (fakeScroll >= fadeEnd) {
        animationDone = true;
      }
    }
  },
  { passive: false }
);

window.addEventListener("scroll", function () {
  if (animationDone) {
    heroTitle.style.opacity = minOpacity;
    heroTitle.style.setProperty("--hero-title-y", `${-fadeEnd / 3}px`);
    if (window.scrollY === 0) {
      animationDone = false;
      fakeScroll = 0;
      heroTitle.style.opacity = 1;
      heroTitle.style.setProperty("--hero-title-y", "0px");
    }
  }
});

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
      heroTitle.style.transform = `translate(-50%, calc(-50% - ${
        fakeScroll / 3
      }px))`;

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
    heroTitle.style.transform = `translate(-50%, calc(-50% - ${
      fadeEnd / 3
    }px))`;
    if (window.scrollY === 0) {
      animationDone = false;
      fakeScroll = 0;
      heroTitle.style.opacity = 1;
      heroTitle.style.transform = `translate(-50%, -50%)`;
    }
  }
});

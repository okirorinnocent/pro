/* ANIMATION LAYER
   All visual effects are controlled from this one flag object.
*/
const FX = {
  hero: true,
  ticker: true,
  reveals: true,
  parallax: true,
  cursor: true,
  particles: true
};

(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  if (!window.gsap || !window.ScrollTrigger || reduced.matches) {
    document.documentElement.classList.remove("gsap-ready");
    return;
  }

  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  document.documentElement.classList.add("gsap-ready");
  if (FX.hero) document.documentElement.classList.add("fx-hero");

  gsap.config({ nullTargetWarn: false });
  window.ScrollTrigger.config({ ignoreMobileResize: true });

  const hero = document.querySelector("#home");

  function removeWillChange(elements) {
    elements.forEach(function (el) {
      if (el) el.style.willChange = "";
    });
  }

  gsap.matchMedia().add({
    "mobile": "(max-width:767px)",
    "desktop": "(min-width:768px)",
    "reduced": "(prefers-reduced-motion: reduce)"
  }, function (context) {
    if (context.conditions.reduced || !FX.hero) return;

    const mobile = context.conditions.mobile;
    const words = hero ? Array.from(hero.querySelectorAll(".hero-word")) : [];
    const eyebrow = hero ? hero.querySelector(".eyebrow") : null;
    const lead = hero ? hero.querySelector(".lead") : null;
    const chips = hero ? hero.querySelector(".chips") : null;
    const actions = hero ? hero.querySelector(".actions") : null;
    const stats = hero ? hero.querySelector(".stats") : null;
    const profile = hero ? hero.querySelector(".profile-card") : null;

    const entrance = [eyebrow, lead, chips, actions, stats].filter(Boolean);
    entrance.concat(words).forEach(function (el) {
      el.style.willChange = "transform, opacity";
    });

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
        duration: mobile ? 0.6 : 0.75
      },
      onComplete: function () {
        removeWillChange(entrance.concat(words));
      }
    });

    tl.fromTo(words,
      { opacity: 0, y: mobile ? 24 : 32 },
      { opacity: 1, y: 0, stagger: mobile ? 0.06 : 0.08 },
      0
    ).fromTo(eyebrow,
      { opacity: 0, y: mobile ? 18 : 24 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.32
    ).fromTo(lead,
      { opacity: 0, y: mobile ? 18 : 24 },
      { opacity: 1, y: 0, duration: 0.65 },
      0.44
    ).fromTo(chips,
      { opacity: 0, y: mobile ? 18 : 24 },
      { opacity: 1, y: 0, duration: 0.65 },
      0.58
    ).fromTo(actions,
      { opacity: 0, y: mobile ? 18 : 24 },
      { opacity: 1, y: 0, duration: 0.65 },
      0.68
    ).fromTo(stats,
      { opacity: 0, y: mobile ? 18 : 24 },
      { opacity: 1, y: 0, duration: 0.65 },
      0.78
    );

    if (profile) {
      profile.style.willChange = "transform";
      gsap.fromTo(profile,
        { y: mobile ? 8 : 12 },
        {
          y: 0,
          duration: mobile ? 0.6 : 0.8,
          ease: "power3.out",
          onComplete: function () {
            profile.style.willChange = "";
          }
        }
      );
    }
  });

  const heroBadges = hero ? hero.querySelector(".hero-badges") : null;
  if (heroBadges) {
    const badgeObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            heroBadges.classList.toggle("paused", !entry.isIntersecting);
          });
        }, { threshold: 0.05 })
      : null;
    if (badgeObserver) badgeObserver.observe(hero);
  }

  function updateVisibility() {
    if (heroBadges) heroBadges.classList.toggle("paused", document.hidden);
  }
  document.addEventListener("visibilitychange", updateVisibility);
  updateVisibility();

  window.addEventListener("load", function () {
    window.ScrollTrigger.refresh();
  });

  function disableForReducedMotion() {
    document.documentElement.classList.remove("gsap-ready");
    document.documentElement.classList.remove("fx-hero");
    if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach(function (trigger) {
      trigger.kill();
    });
    gsap.globalTimeline.clear();
    gsap.set(document.querySelectorAll("#home .hero-word, #home .eyebrow, #home .lead, #home .chips, #home .actions, #home .stats, #home .profile-card"), {
      clearProps: "all"
    });
  }

  const onReducedChange = function (event) {
    if (event.matches) disableForReducedMotion();
  };

  if (typeof reduced.addEventListener === "function") {
    reduced.addEventListener("change", onReducedChange);
  } else if (typeof reduced.addListener === "function") {
    reduced.addListener(onReducedChange);
  }
})();

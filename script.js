/* ============================================================
   RAPHAEL RIBOT — script.js
   Smooth scroll + scroll-reveal + gallery lightbox
   ============================================================ */

/* ── Apple-style ease-out scroll ── */
(function () {
    let scrollRafId = null;

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function cancelScrollAnimation() {
        if (scrollRafId !== null) {
            cancelAnimationFrame(scrollRafId);
            scrollRafId = null;
        }
    }

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    function scrollToYAnimated(targetY, reducedMotion) {
        cancelScrollAnimation();
        const root = document.documentElement;
        const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
        const endY = clamp(targetY, 0, maxScroll);

        if (reducedMotion) {
            window.scrollTo(0, endY);
            return;
        }

        const startY = window.scrollY;
        const delta  = endY - startY;
        if (Math.abs(delta) < 1) return;

        const distance = Math.abs(delta);
        const duration = clamp(distance * 0.55, 520, 1050);
        const t0 = performance.now();

        function step(now) {
            const elapsed = now - t0;
            const t       = clamp(elapsed / duration, 0, 1);
            const eased   = easeOutQuart(t);
            window.scrollTo(0, startY + delta * eased);
            if (t < 1) {
                scrollRafId = requestAnimationFrame(step);
            } else {
                scrollRafId = null;
            }
        }

        scrollRafId = requestAnimationFrame(step);
    }

    function scrollToElement(el) {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const paddingTop    = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const rect          = el.getBoundingClientRect();
        const y             = rect.top + window.scrollY - paddingTop;
        scrollToYAnimated(y, reducedMotion);
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const id     = this.getAttribute("href");
            if (!id || id === "#") return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            scrollToElement(target);
        });
    });
})();

/* ── Scroll-reveal (IntersectionObserver) ── */
(function () {
    const sections = document.querySelectorAll("section:not(#about)");
    sections.forEach(s => s.classList.add("reveal"));

    if (!("IntersectionObserver" in window)) {
        sections.forEach(s => s.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08 }
    );

    sections.forEach(s => observer.observe(s));
})();

/* ── Gallery Lightbox ── */
(function () {
    const lightbox  = document.createElement("div");
    lightbox.id     = "lightbox";

    const img       = document.createElement("img");
    img.id          = "lightbox-img";
    img.alt         = "";

    const closeHint = document.createElement("span");
    closeHint.className   = "lightbox-close";
    closeHint.textContent = "Click to close";

    lightbox.appendChild(img);
    lightbox.appendChild(closeHint);
    document.body.appendChild(lightbox);

    /* Open on gallery image click — exclude videos */
    document.querySelectorAll(".gallery-item img").forEach((galleryImg) => {
        galleryImg.style.cursor = "zoom-in";
        galleryImg.addEventListener("click", (e) => {
            e.stopPropagation();
            img.src = galleryImg.src;
            lightbox.classList.add("open");
            document.body.style.overflow = "hidden";
        });
    });

    /* Close on lightbox click */
    lightbox.addEventListener("click", () => {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
    });

    /* Close on Escape */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            lightbox.classList.remove("open");
            document.body.style.overflow = "";
        }
    });
})();

/* ============================================================
   RAPHAEL RIBOT — script.js
   Smooth scroll + scroll-reveal + gallery detail panel
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

        if (reducedMotion) { window.scrollTo(0, endY); return; }

        const startY = window.scrollY;
        const delta  = endY - startY;
        if (Math.abs(delta) < 1) return;

        const distance = Math.abs(delta);
        const duration = clamp(distance * 0.55, 520, 1050);
        const t0 = performance.now();

        function step(now) {
            const elapsed = now - t0;
            const t       = clamp(elapsed / duration, 0, 1);
            window.scrollTo(0, startY + delta * easeOutQuart(t));
            if (t < 1) { scrollRafId = requestAnimationFrame(step); }
            else { scrollRafId = null; }
        }
        scrollRafId = requestAnimationFrame(step);
    }

    function scrollToElement(el) {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const paddingTop = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const y = el.getBoundingClientRect().top + window.scrollY - paddingTop;
        scrollToYAnimated(y, reducedMotion);
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const id = this.getAttribute("href");
            if (!id || id === "#") return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            scrollToElement(target);
        });
    });
})();

/* ── Scroll-reveal ── */
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

/* ── Gallery Detail Panel ── */
(function () {
    const panel          = document.getElementById("detail-panel");
    const closeBtn       = document.getElementById("detail-close");
    const detailImg      = document.getElementById("detail-img");
    const detailVideo    = document.getElementById("detail-video");
    const detailVideoSrc = document.getElementById("detail-video-src");
    const detailCategory = document.getElementById("detail-category");
    const detailTitle    = document.getElementById("detail-title");
    const detailClient   = document.getElementById("detail-client");
    const detailYear     = document.getElementById("detail-year");
    const detailDesc     = document.getElementById("detail-description");

    if (!panel) return;

    function openPanel(item) {
        const isVideo = !!item.querySelector("video");
        const d = item.dataset;

        detailCategory.innerHTML  = d.category    || "";
        detailTitle.textContent   = d.title        || "";
        detailClient.innerHTML    = d.client        || "";
        detailYear.textContent    = d.year          || "";
        detailDesc.textContent    = d.description   || "";

        if (isVideo) {
            const source = item.querySelector("source");
            detailImg.style.display   = "none";
            detailVideo.style.display = "block";
            detailVideoSrc.src = source ? source.src : "";
            detailVideo.load();
            detailVideo.play();
        } else {
            const img = item.querySelector("img");
            detailVideo.style.display = "none";
            detailVideo.pause();
            detailImg.style.display = "block";
            detailImg.src = img ? img.src : "";
            detailImg.alt = img ? img.alt : "";
        }

        panel.classList.add("open");
        panel.scrollTop = 0;
        document.body.style.overflow = "hidden";
    }

    function closePanel() {
        panel.classList.remove("open");
        document.body.style.overflow = "";
        detailVideo.pause();
    }

    document.querySelectorAll(".gallery-item").forEach(item => {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => openPanel(item));
    });

    closeBtn.addEventListener("click", closePanel);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
    });
})();

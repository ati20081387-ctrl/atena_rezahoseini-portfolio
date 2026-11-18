/* ATENA'S NOTEBOOK — interactive motion & 3D atmosphere */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const progress = document.getElementById("scrollProgress");
  const year = document.getElementById("year");
  const typedRole = document.getElementById("typedRole");
  const canvas = document.getElementById("spaceCanvas");
  const ctx = canvas?.getContext("2d", { alpha: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  year.textContent = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  // Mobile navigation: open/close and close on outside click or Escape.
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "بستن منو" : "باز کردن منو");
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("click", event => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Toggle the color theme.
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    themeToggle.textContent = light ? "☾" : "☼";
    themeToggle.setAttribute("aria-label", light ? "فعال کردن حالت تیره" : "فعال کردن حالت روشن");
    localStorage.setItem("atena-theme", light ? "light" : "dark");
  });
  if (localStorage.getItem("atena-theme") === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☾";
  }

  // Typewriter text.
  const roles = ["علاقه‌مند به برنامه‌نویسی", "کنجکاو درباره دنیای تکنولوژی", "همیشه در حال یادگیری"];
  let roleIndex = 0, charIndex = roles[0].length, deleting = false;
  function typeRole() {
    const current = roles[roleIndex];
    charIndex += deleting ? -1 : 1;
    typedRole.textContent = current.slice(0, charIndex);
    if (!deleting && charIndex >= current.length) {
      deleting = true;
      setTimeout(typeRole, 1500);
      return;
    }
    if (deleting && charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
    setTimeout(typeRole, deleting ? 42 : 72);
  }
  if (!reduceMotion) setTimeout(typeRole, 1500);

  // Reveal content when it enters the screen.
  const revealTargets = document.querySelectorAll(
    ".section-heading, .glass-card, .interest-card, .language-item, .mood-card"
  );
  revealTargets.forEach(element => element.classList.add("reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(element => observer.observe(element));
  } else {
    revealTargets.forEach(element => element.classList.add("in-view"));
  }

  // Reading progress and back-to-top button.
  function updateScrollUI() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progress.style.width = `${percent}%`;
    backToTop.classList.toggle("visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // 3D tilt follows the pointer on larger screens.
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.querySelectorAll(".interest-card, .mood-card, .language-item").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - .5) * 9;
        const rotateX = (.5 - y) * 9;
        card.style.transform = `perspective(750px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty("--shine-x", `${x * 100}%`);
        card.style.setProperty("--shine-y", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    const portraitFrame = document.querySelector(".portrait-frame");
    const portraitWrap = document.querySelector(".portrait-wrap");
    portraitWrap?.addEventListener("pointermove", event => {
      const rect = portraitWrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      portraitFrame.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg) rotate(2deg)`;
    });
    portraitWrap?.addEventListener("pointerleave", () => portraitFrame.style.transform = "rotate(2deg)");
  }

  // Click ripple + tiny stars. Avoid text inputs and reduced-motion mode.
  if (!reduceMotion) {
    document.addEventListener("click", event => {
      if (event.target.closest("input, textarea, select")) return;
      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });

      for (let i = 0; i < 5; i++) {
        const spark = document.createElement("span");
        spark.className = "click-spark";
        spark.textContent = i % 2 ? "✦" : "✧";
        spark.style.left = `${event.clientX}px`;
        spark.style.top = `${event.clientY}px`;
        spark.style.setProperty("--dx", `${(Math.random() - .5) * 90}px`);
        spark.style.setProperty("--dy", `${(Math.random() - .5) * 90}px`);
        document.body.appendChild(spark);
        spark.addEventListener("animationend", () => spark.remove(), { once: true });
      }
    });
  }

  // Soft pointer glow.
  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", event => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    }, { passive: true });
  }

  // Canvas starfield: perspective depth, drifting particles and pointer parallax.
  if (ctx && !reduceMotion) {
    let width = 0, height = 0, stars = [], animationId = 0;
    const pointer = { x: 0, y: 0 };
    const starCount = window.innerWidth < 600 ? 65 : 115;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: starCount }, () => ({
        x: (Math.random() - .5) * width * 1.5,
        y: (Math.random() - .5) * height * 1.5,
        z: Math.random() * 1.2 + .2,
        radius: Math.random() * 1.25 + .25,
        phase: Math.random() * Math.PI * 2
      }));
    }
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", event => {
      pointer.x = (event.clientX / width - .5) * 2;
      pointer.y = (event.clientY / height - .5) * 2;
    }, { passive: true });
    function drawSpace(time) {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2 - pointer.x * 13;
      const centerY = height / 2 - pointer.y * 13;
      stars.forEach(star => {
        star.phase += .006;
        const depth = star.z;
        const x = centerX + star.x / depth;
        const y = centerY + star.y / depth;
        const alpha = .25 + (Math.sin(star.phase + time * .0004) + 1) * .22;
        const radius = star.radius / depth;
        if (x < -5 || x > width + 5 || y < -5 || y > height + 5) {
          star.x = (Math.random() - .5) * width * 1.5;
          star.y = (Math.random() - .5) * height * 1.5;
          star.z = Math.random() * 1.2 + .2;
          return;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(190, 195, 255, ${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(drawSpace);
    }
    resizeCanvas();
    animationId = requestAnimationFrame(drawSpace);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animationId);
      else animationId = requestAnimationFrame(drawSpace);
    });
  }
});

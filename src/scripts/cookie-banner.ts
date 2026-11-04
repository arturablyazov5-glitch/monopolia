const banner = document.querySelector<HTMLElement>("[data-cookie-banner]");
if (banner) {
  const key = "monopoly-cookie-choice-v1";
  const id = banner.dataset.counterId || "";
  const loadCounter = () => {
    if (!/^\d+$/.test(id)) return;
    type Counter = ((...args: unknown[]) => void) & {
      a?: unknown[][];
      l?: number;
    };
    const w = window as typeof window & {
      ym?: Counter;
    };
    if (w.ym) return;
    const ym: Counter = (...args) => {
      (ym.a ||= []).push(args);
    };
    ym.l = Date.now();
    w.ym = ym;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.append(script);
    ym(Number(id), "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  };
  let choice: string | null = null;
  try {
    choice = localStorage.getItem(key);
  } catch {
    /* Storage may be unavailable. */
  }
  if (choice === "accepted") loadCounter();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let closing = false;
  const updateBannerGeometry = () => {
    if (banner.hidden) return;
    const height = banner.getBoundingClientRect().height;
    document.documentElement.style.setProperty(
      "--cookie-banner-height",
      `${height}px`,
    );
    banner.setAttribute("data-cookie-ready", "");
  };
  if (choice !== "accepted" && choice !== "rejected") {
    const show = () => {
      banner.hidden = false;
      updateBannerGeometry();
      const observer = new ResizeObserver(updateBannerGeometry);
      observer.observe(banner);
      addEventListener("resize", updateBannerGeometry, { passive: true });
    };
    if (reducedMotion.matches) show();
    else setTimeout(show, 700);
  }
  banner.querySelector("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (closing) return;
    closing = true;
    const submitter = (event as SubmitEvent).submitter;
    const accepted = submitter === banner.querySelector("button:first-child");
    try {
      localStorage.setItem(key, accepted ? "accepted" : "rejected");
    } catch {
      /* Choice applies for this page only. */
    }
    if (accepted) loadCounter();
    const hide = () => {
      if (banner.hidden) return;
      banner.hidden = true;
      banner.inert = true;
    };
    if (reducedMotion.matches) hide();
    else {
      banner.addEventListener("animationend", (event) => {
        if (event.target === banner && event.animationName === "cookie-exit")
          hide();
      });
      banner.setAttribute("data-cookie-closing", "");
      setTimeout(hide, 350);
    }
  });
}

export {};

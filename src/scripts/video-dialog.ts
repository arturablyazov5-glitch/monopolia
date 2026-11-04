export {};

const dialog = document.querySelector<HTMLDialogElement>("#video-dialog");
if (dialog) {
  const video = dialog.querySelector<HTMLVideoElement>("video")!;
  const closeButton = dialog.querySelector<HTMLButtonElement>(
    ".video-dialog-close",
  )!;
  const title = dialog.querySelector<HTMLElement>("#video-dialog-title")!;
  let trigger: HTMLButtonElement | null = null;
  let scrollY = 0;
  let bodyStyle: string | null = null;
  let rootStyle: string | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let suspended = false;
  let resumeOnReturn = false;
  let savedTime = 0;
  let pendingAutoResume = false;
  let cancelPendingRestore: (() => void) | null = null;

  const unload = () => {
    cancelPendingRestore?.();
    cancelPendingRestore = null;
    pendingAutoResume = false;
    suspended = false;
    resumeOnReturn = false;
    savedTime = 0;
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("src");
    video.removeAttribute("poster");
    video.load();
  };
  const suspend = () => {
    if (!dialog.open || suspended || !video.getAttribute("src")) return;
    const wasResuming = pendingAutoResume;
    cancelPendingRestore?.();
    cancelPendingRestore = null;
    pendingAutoResume = false;
    suspended = true;
    resumeOnReturn = wasResuming || (!video.paused && !video.ended);
    savedTime = video.currentTime || savedTime;
    video.pause();
  };
  const restore = () => {
    if (!suspended || document.hidden || !dialog.open) return;
    suspended = false;
    const shouldResume = resumeOnReturn;
    resumeOnReturn = false;
    const source = video.getAttribute("src");
    const resumeAt = savedTime;
    pendingAutoResume = shouldResume;
    // Mobile Safari can discard the media pipeline while the tab is hidden.
    // Reload the existing source and seek to the previous position before resuming.
    const onMetadata = () => {
      cancelPendingRestore = null;
      pendingAutoResume = false;
      if (!dialog.open || document.hidden || video.getAttribute("src") !== source) return;
      if (resumeAt > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(resumeAt, Math.max(0, video.duration - 0.01));
      }
      if (shouldResume) {
        void video.play().catch(() => {
          // Native controls allow a user gesture if Safari blocks auto-resume.
        });
      }
    };
    video.addEventListener("loadedmetadata", onMetadata, { once: true });
    cancelPendingRestore = () => video.removeEventListener("loadedmetadata", onMetadata);
    video.load();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) suspend();
    else restore();
  });
  window.addEventListener("pagehide", suspend);
  window.addEventListener("pageshow", restore);
  const close = () => {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    unload();
    dialog.classList.add("is-closing");
    closeTimer = setTimeout(
      () => dialog.close(),
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
    );
  };
  dialog.addEventListener("close", () => {
    clearTimeout(closeTimer);
    unload();
    dialog.classList.remove("is-closing");
    if (bodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", bodyStyle);
    if (rootStyle === null) document.documentElement.removeAttribute("style");
    else document.documentElement.setAttribute("style", rootStyle);
    window.scrollTo({ top: scrollY, behavior: "instant" });
    trigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  closeButton.addEventListener("click", close);
  let backdropPress = false;
  dialog.addEventListener("pointerdown", (event) => {
    backdropPress = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (backdropPress && event.target === dialog) close();
    backdropPress = false;
  });
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (
      !(target instanceof Element) ||
      dialog.open ||
      dialog.classList.contains("is-closing")
    ) return;
    const card = target.closest(".review-card, .sell-week-video");
    const button =
      target.closest<HTMLButtonElement>("button[data-video]") ??
      (target.closest("a, button, input")
        ? null
        : card?.querySelector<HTMLButtonElement>("button[data-video]"));
    if (!button) return;
    const source = button.dataset.video;
    if (!source) {
      const wrapper = card ?? button.parentElement!;
      let status = wrapper.querySelector<HTMLElement>("[data-video-status]");
      if (!status) {
        status = document.createElement("p");
        status.dataset.videoStatus = "";
        status.setAttribute("role", "status");
        status.className = "caption";
        wrapper.append(status);
      }
      status.textContent = "Демонстрация плеера: видеофайл пока не подключён.";
      return;
    }
    trigger = button;
    const poster = card?.querySelector<HTMLImageElement>(
      ".review-photo > img, .sell-week-video-frame",
    );
    title.textContent = button.getAttribute("aria-label") || "Видеоотзыв";
    if (poster) video.poster = poster.currentSrc || poster.src;
    video.src = source;
    scrollY = window.scrollY;
    bodyStyle = document.body.getAttribute("style");
    rootStyle = document.documentElement.getAttribute("style");
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${scrollY}px`,
      width: "100%",
      overflow: "hidden",
    });
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
    // This call stays in the user's click handler for iOS gesture permission.
    void video.play().catch(() => {
      /* Native controls remain available. */
    });
  });
}

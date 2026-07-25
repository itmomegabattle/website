import { useEffect, useRef } from "react";

export default function useSeasonRail(seasons) {
  const railRef = useRef(null);
  const railSwipeStart = useRef(null);
  const railSwipeLock = useRef(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const rail = railRef.current;
      if (rail) {
        const rect = rail.getBoundingClientRect();
        const travel = Math.max(1, rail.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / travel));
        const track = rail.querySelector(".history-seasons__track");
        const trackLeft = track ? parseFloat(window.getComputedStyle(track).left) || 0 : 0;
        const horizontalTravel = Math.max(
          0,
          (track?.scrollWidth || 0) + trackLeft - window.innerWidth + window.innerWidth * 0.1,
        );
        rail.style.setProperty("--rail-progress", progress.toFixed(4));
        rail.style.setProperty("--rail-x", `${(-progress * horizontalTravel).toFixed(1)}px`);
      }
      document.documentElement.style.setProperty("--history-scroll", String(window.scrollY));
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [seasons.length]);

  const move = (direction) => {
    const rail = railRef.current;
    if (!rail || seasons.length < 2) return;
    const rect = rail.getBoundingClientRect();
    const travel = Math.max(1, rail.offsetHeight - window.innerHeight);
    const current = Math.min(1, Math.max(0, -rect.top / travel));
    const currentIndex = Math.round(current * (seasons.length - 1));
    const nextIndex = Math.min(seasons.length - 1, Math.max(0, currentIndex + direction));
    const sectionTop = rect.top + window.scrollY;
    window.scrollTo({
      top: sectionTop + (nextIndex / (seasons.length - 1)) * travel,
      behavior: "smooth",
    });
  };

  const startSwipe = (event) => {
    const point = event.touches?.[0] || event;
    railSwipeStart.current = { x: point.clientX, y: point.clientY };
  };

  const finishSwipe = (event) => {
    if (!railSwipeStart.current) return;
    const point = event.changedTouches?.[0] || event;
    const deltaX = point.clientX - railSwipeStart.current.x;
    const deltaY = point.clientY - railSwipeStart.current.y;
    railSwipeStart.current = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.1) return;
    move(deltaX < 0 ? 1 : -1);
  };

  const handleWheel = (event) => {
    if (
      railSwipeLock.current
      || Math.abs(event.deltaX) < 28
      || Math.abs(event.deltaX) < Math.abs(event.deltaY)
    ) return;
    event.preventDefault();
    railSwipeLock.current = true;
    move(event.deltaX > 0 ? 1 : -1);
    window.setTimeout(() => {
      railSwipeLock.current = false;
    }, 420);
  };

  return { railRef, startSwipe, finishSwipe, handleWheel };
}

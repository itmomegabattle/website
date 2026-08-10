import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import "../styles/dome-gallery.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const wrapAngleSigned = (degrees) => {
  const angle = (((degrees + 180) % 360) + 360) % 360;
  return angle - 180;
};

const DomeItem = memo(function DomeItem({ item, renderItem, onOpen, onActivate }) {
  return (
    <div
      className="sphere-item"
      style={{
        "--offset-x": item.x,
        "--offset-y": item.y,
        "--item-size-x": item.sizeX,
        "--item-size-y": item.sizeY,
      }}
    >
      <button
        className="sphere-item__image"
        type="button"
        aria-label={item.alt || "Открыть фотографию"}
        onClick={() => onOpen(item)}
        onFocus={() => onActivate(item)}
        onPointerEnter={() => onActivate(item)}
      >
        {renderItem ? renderItem(item) : (
          <img src={item.src} draggable="false" alt="" loading="lazy" decoding="async" />
        )}
      </button>
    </div>
  );
});

// Геометрия и раскладка из ReactBits Dome Gallery. Изображения повторяются
// по оболочке намеренно: так купол остаётся цельным при полном обороте.
function buildItems(pool, segments) {
  const columns = Array.from({ length: segments }, (_, index) => -37 + index * 2);
  const evenRows = [-4, -2, 0, 2, 4];
  const oddRows = [-3, -1, 1, 3, 5];
  const coordinates = columns.flatMap((x, column) => {
    const rows = column % 2 === 0 ? evenRows : oddRows;
    return rows.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  if (!pool.length) return [];
  const normalizedImages = pool.map((image) => (
    typeof image === "string" ? { src: image, alt: "" } : image
  ));
  const usedImages = Array.from(
    { length: coordinates.length },
    (_, index) => normalizedImages[index % normalizedImages.length],
  );

  for (let index = 1; index < usedImages.length; index += 1) {
    if (usedImages[index].src !== usedImages[index - 1].src) continue;
    const replacementIndex = usedImages.findIndex(
      (image, candidateIndex) => candidateIndex > index && image.src !== usedImages[index].src,
    );
    if (replacementIndex > index) {
      [usedImages[index], usedImages[replacementIndex]] = [usedImages[replacementIndex], usedImages[index]];
    }
  }

  return coordinates.map((coordinate, index) => ({
    ...coordinate,
    ...usedImages[index],
    itemKey: `${coordinate.x}-${coordinate.y}-${index}`,
  }));
}

export default function DomeGallery({
  images,
  renderItem,
  onItemSelect,
  className = "",
  idleLabel = "Плеяда Megabattle",
  idleDescription = "Нажми на фотографию, чтобы рассмотреть",
  fit = 0.78,
  fitBasis = "auto",
  minRadius = 440,
  maxRadius = 760,
  padFactor = 0.15,
  overlayBlurColor = "#02070f",
  maxVerticalRotationDeg = 8,
  dragSensitivity = 20,
  segments = 24,
  dragDampening = 0.72,
  imageBorderRadius = "18px",
  grayscale = false,
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const inertiaFrameRef = useRef(0);
  const rotationRef = useRef({ x: 0, y: 0 });
  const startingRotationRef = useRef({ x: 0, y: 0 });
  const startingPointerRef = useRef(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const [activeImage, setActiveImage] = useState(null);
  const [openedImage, setOpenedImage] = useState(null);
  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = useCallback((xDegrees, yDegrees) => {
    if (!sphereRef.current) return;
    sphereRef.current.style.transform = `rotateX(${xDegrees}deg) rotateY(${yDegrees}deg)`;
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current) cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = 0;
  }, []);

  const startInertia = useCallback((velocityX, velocityY) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const maximumVelocity = 1.4;
    let xSpeed = clamp(velocityX, -maximumVelocity, maximumVelocity) * 80;
    let ySpeed = clamp(velocityY, -maximumVelocity, maximumVelocity) * 80;
    let frames = 0;
    const dampening = clamp(dragDampening, 0, 1);
    const friction = 0.94 + 0.055 * dampening;
    const stopThreshold = 0.015 - 0.01 * dampening;
    const maximumFrames = Math.round(90 + 270 * dampening);

    const step = () => {
      xSpeed *= friction;
      ySpeed *= friction;
      frames += 1;
      if (
        frames > maximumFrames
        || (Math.abs(xSpeed) < stopThreshold && Math.abs(ySpeed) < stopThreshold)
      ) {
        inertiaFrameRef.current = 0;
        return;
      }
      const nextX = clamp(
        rotationRef.current.x - ySpeed / 200,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg,
      );
      const nextY = wrapAngleSigned(rotationRef.current.y + xSpeed / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaFrameRef.current = requestAnimationFrame(step);
    };

    stopInertia();
    inertiaFrameRef.current = requestAnimationFrame(step);
  }, [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia]);

  useGesture({
    onDragStart: ({ event }) => {
      stopInertia();
      draggingRef.current = true;
      movedRef.current = false;
      startingRotationRef.current = { ...rotationRef.current };
      startingPointerRef.current = { x: event.clientX, y: event.clientY };
      mainRef.current?.classList.add("is-dragging");
    },
    onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
      if (!draggingRef.current || !startingPointerRef.current) return;
      const deltaX = event.clientX - startingPointerRef.current.x;
      const deltaY = event.clientY - startingPointerRef.current.y;
      if (deltaX * deltaX + deltaY * deltaY > 16) movedRef.current = true;

      const nextX = clamp(
        startingRotationRef.current.x - deltaY / dragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg,
      );
      const nextY = wrapAngleSigned(startingRotationRef.current.y + deltaX / dragSensitivity);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);

      if (!last) return;
      draggingRef.current = false;
      mainRef.current?.classList.remove("is-dragging");
      let xVelocity = velocity[0] * direction[0];
      let yVelocity = velocity[1] * direction[1];
      if (Math.abs(xVelocity) < 0.001 && Math.abs(yVelocity) < 0.001) {
        xVelocity = clamp((movement[0] / dragSensitivity) * 0.02, -1.2, 1.2);
        yVelocity = clamp((movement[1] / dragSensitivity) * 0.02, -1.2, 1.2);
      }
      if (Math.abs(xVelocity) > 0.005 || Math.abs(yVelocity) > 0.005) {
        startInertia(xVelocity, yVelocity);
      }
      window.setTimeout(() => { movedRef.current = false; }, 90);
    },
  }, { target: mainRef, eventOptions: { passive: true } });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.max(1, entry.contentRect.width);
      const height = Math.max(1, entry.contentRect.height);
      const minimumDimension = Math.min(width, height);
      const maximumDimension = Math.max(width, height);
      let basis;
      if (fitBasis === "min") basis = minimumDimension;
      else if (fitBasis === "max") basis = maximumDimension;
      else if (fitBasis === "width") basis = width;
      else if (fitBasis === "height") basis = height;
      else basis = width / height >= 1.3 ? width : minimumDimension;
      const radius = clamp(Math.min(basis * fit, height * 1.35), minRadius, maxRadius);
      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${Math.max(8, Math.round(minimumDimension * padFactor))}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    resizeObserver.observe(root);
    return () => resizeObserver.disconnect();
  }, [applyTransform, fit, fitBasis, maxRadius, minRadius, padFactor]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      root.classList.toggle("is-in-view", entry.isIntersecting && entry.intersectionRatio > 0.08);
    }, { threshold: [0, 0.08] });
    visibilityObserver.observe(root);
    return () => visibilityObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!openedImage) return undefined;
    const close = (event) => {
      if (event.key === "Escape") setOpenedImage(null);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [openedImage]);

  useEffect(() => stopInertia, [stopInertia]);

  const openImage = useCallback((image) => {
    if (movedRef.current) return;
    if (onItemSelect) {
      onItemSelect(image);
      setActiveImage(image);
      return;
    }
    setOpenedImage(image);
  }, [onItemSelect]);
  const activateImage = useCallback((image) => {
    setActiveImage((current) => current?.itemKey === image.itemKey ? current : image);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`sphere-root${className ? ` ${className}` : ""}`}
      style={{
        "--segments-x": segments,
        "--segments-y": segments,
        "--overlay-blur-color": overlayBlurColor,
        "--tile-radius": imageBorderRadius,
        "--image-filter": grayscale ? "grayscale(1)" : "none",
      }}
    >
      <main ref={mainRef} className="sphere-main">
        <div className="sphere-stage">
          <div className="sphere-position">
            <div ref={sphereRef} className="sphere">
              <div className="sphere-auto-rotation">
                {items.map((item) => <DomeItem key={item.itemKey} item={item} renderItem={renderItem} onOpen={openImage} onActivate={activateImage} />)}
              </div>
            </div>
          </div>
        </div>
        <div className="sphere-overlay" aria-hidden="true" />
        <div className="sphere-overlay sphere-overlay--blur" aria-hidden="true" />
        <div className="sphere-edge-fade sphere-edge-fade--top" aria-hidden="true" />
        <div className="sphere-edge-fade sphere-edge-fade--bottom" aria-hidden="true" />
      </main>

      <div className="sphere-gallery-footer" aria-live="polite">
        <p><span aria-hidden="true">↔</span> Перетащи купол</p>
        <div className={activeImage ? "is-visible" : ""}>
          <strong>{activeImage?.name || idleLabel}</strong>
          <span>{activeImage?.role || activeImage?.description || idleDescription}</span>
        </div>
      </div>

      {openedImage && (
        <button className="sphere-viewer" type="button" aria-label="Закрыть фотографию" onClick={() => setOpenedImage(null)}>
          <span>
            <img src={openedImage.src} alt={openedImage.alt || openedImage.name || "Участник Megabattle"} />
            <small>{openedImage.role}</small>
            <strong>{openedImage.name}</strong>
          </span>
        </button>
      )}
    </div>
  );
}

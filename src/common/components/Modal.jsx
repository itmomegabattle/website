import { useEffect, useRef } from "react";
import ModalPortal from "../../components/ModalPortal";
import "./modal.css";

// Стек открытых модалов: Escape закрывает только верхний.
const modalStack = [];

// Общий модал проекта (дизайн — по модалу участника из секции «Люди»):
// затемненный фон с блюром, скругленная темная панель, круглая кнопка закрытия.
// Закрывается по Escape и клику по фону, блокирует скролл страницы,
// автофокус на кнопке закрытия. Доп. пропсы уходят на панель.
export default function Modal({ label, onClose, className = "", backdropClassName = "", children, ...panelProps }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Блокировкой скролла страницы занимается ModalPortal.
  useEffect(() => {
    const entry = {};
    modalStack.push(entry);
    const onKeyDown = (event) => {
      if (event.key === "Escape" && modalStack[modalStack.length - 1] === entry) onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      modalStack.splice(modalStack.indexOf(entry), 1);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <ModalPortal>
      <div
        className={backdropClassName ? `modal-backdrop ${backdropClassName}` : "modal-backdrop"}
        role="presentation"
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <article
          className={className ? `modal ${className}` : "modal"}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          {...panelProps}
        >
          <button ref={closeRef} className="modal__close" type="button" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
          {children}
        </article>
      </div>
    </ModalPortal>
  );
}

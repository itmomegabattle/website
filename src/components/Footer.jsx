import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVk,
  faTelegram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import ModalPortal from "./ModalPortal";

function FooterModal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const close = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return <ModalPortal><div className="footer-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`footer-modal${wide ? " footer-modal--wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Закрыть">×</button></header>{children}</section></div></ModalPortal>;
}

function PrivacyPolicy({ onClose, onSupport }) {
  return <FooterModal title="Политика конфиденциальности" onClose={onClose} wide><div className="footer-policy-copy">
    <p><strong>Дата редакции: 12 августа 2026 года.</strong> Эта политика относится к сайту проекта ITMO Megabattle и объясняет, какие данные мы получаем и зачем.</p>
    <h3>Какие данные обрабатываются</h3><p>Данные профиля, которые пользователь указывает самостоятельно; технические сведения, необходимые для работы авторизации и безопасности; контакт, текст сообщения и файл, добровольно отправленные через форму поддержки.</p>
    <h3>Цели и основания</h3><p>Мы используем данные для работы профиля и функций сайта, организации участия в проекте, ответа на обращения, устранения ошибок и защиты сервиса. Данные из формы поддержки обрабатываются на основании согласия, которое пользователь даёт перед отправкой.</p>
    <h3>Хранение и доступ</h3><p>Доступ получают только уполномоченные организаторы и технические администраторы. Вложения поддержки хранятся в закрытом хранилище и открываются по временной ссылке. Мы не публикуем и не продаём данные. Сведения хранятся не дольше, чем это необходимо для указанных целей и выполнения обязательных требований.</p>
    <h3>Права пользователя</h3><p>Можно запросить сведения об обработке, исправление или удаление данных, а также отозвать согласие. Для этого отправьте обращение через поддержку и укажите контакт, по которому можно подтвердить запрос.</p>
    <h3>Безопасность и обновления</h3><p>Мы применяем разграничение доступа, закрытое хранение вложений и защищённое соединение. Политика может обновляться при изменении сайта или требований; актуальная версия всегда доступна в подвале.</p>
    <div className="footer-policy-actions"><a className="footer-modal-primary" href="/itmo-megabattle-privacy-policy.pdf" target="_blank" rel="noreferrer">Открыть полную политику PDF</a><button className="footer-modal-primary" type="button" onClick={onSupport}>Связаться по вопросу данных</button></div>
  </div></FooterModal>;
}

function SupportForm({ onClose, onPolicy }) {
  return <FooterModal title="Поддержка" onClose={onClose}><div className="footer-support-form">
    <p>Напиши по любому вопросу: участие, мероприятия, предложения или проблемы с сайтом.</p>
    <a className="footer-modal-primary" href="https://t.me/itmomegabattle" target="_blank" rel="noreferrer">Написать в Telegram</a>
    <p className="footer-consent">Отправляя сообщение, ознакомься с <button type="button" onClick={onPolicy}>политикой конфиденциальности</button>.</p>
  </div></FooterModal>;
}

function FooterLogo() {
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/logo.svg")
      .then((response) => response.text())
      .then((svg) => {
        if (active) setMarkup(svg.replaceAll('fill="white"', 'fill="currentColor"'));
      })
      .catch(() => null);
    return () => { active = false; };
  }, []);

  if (!markup) return <img className="footer-logo" src="/logo.svg" width="130" height="88" alt="ITMO Megabattle" />;
  return <span className="footer-logo footer-logo--inline" role="img" aria-label="ITMO Megabattle" dangerouslySetInnerHTML={{ __html: markup }} />;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [modal, setModal] = useState(null);

  return (
    <footer className="footer">
      <div className="main-width">
        <div className="footer-content">
          <Link
            to="/"
            className="footer-brand"
            aria-label="На главную"
          >
            <span className="footer-logo-wrap">
              <FooterLogo />
            </span>
          </Link>

          <div className="footer-info">
            <p>
              <a
                href="https://itmo.ru/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Университет ИТМО
                <br />
                © 1993–{currentYear}
              </a>
            </p>

            <p>
              г. Санкт-Петербург
              <br />
              ул. Ломоносова, д. 9
            </p>
          </div>

          <nav
            className="footer-socials"
            aria-label="Социальные сети"
          >
            <a
              href="https://vk.com/itmomegabattle"
              target="_blank"
              rel="noopener noreferrer"
              title="ВКонтакте"
              aria-label="ВКонтакте"
            >
              <FontAwesomeIcon icon={faVk} />
            </a>

            <a
              href="https://t.me/itmomegabattle"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram"
              aria-label="Telegram"
            >
              <FontAwesomeIcon icon={faTelegram} />
            </a>

            <a
              href="https://www.tiktok.com/@itmo_megabattle"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
              aria-label="TikTok"
            >
              <FontAwesomeIcon icon={faTiktok} />
            </a>

            <a
              href="https://rutube.ru/channel/78402593/videos/"
              target="_blank"
              rel="noopener noreferrer"
              title="Rutube"
              aria-label="Rutube"
            >
              <FontAwesomeIcon icon={faCirclePlay} />
            </a>
          </nav>

          <div className="footer-actions">
            <div className="footer-policy">
              <span className="footer-section-label">Документы</span>
              <button type="button" onClick={() => setModal("privacy")}>
                Политика конфиденциальности
              </button>
            </div>

            <button
              className="footer-support"
              type="button"
              onClick={() => setModal("support")}
            >
              Поддержка
            </button>
          </div>
        </div>
      </div>
      {modal === "privacy" && <PrivacyPolicy onClose={() => setModal(null)} onSupport={() => setModal("support")} />}
      {modal === "support" && <SupportForm onClose={() => setModal(null)} onPolicy={() => setModal("privacy")} />}
    </footer>
  );
}

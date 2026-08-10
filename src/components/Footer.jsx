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
              <a
                href="https://www.youtube.com/watch?v=0H_69KHDcP0"
                target="_blank"
                rel="noopener noreferrer"
              >
                Политика конфиденциальности
              </a>
            </div>

            <button
              className="footer-support"
              type="button"
              title="Функция появится позже"
            >
              Поддержка
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import "../styles/footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVk,
  faTelegram,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="main-width">
        <div className="footer-content">
          <Link to="/">
            <img className="footer-logo" src="logo.svg" width="130" height="88" alt="ITMO Megabattle" decoding="async" />
          </Link>
          <div>
            <p>
              <a href="https://itmo.ru/" target="_blank">
                Университет ИТМО
                <br />© 1993-{new Date().getFullYear()}
              </a>
            </p>
            <p>
              г. Санкт-Петербург
              <br />
              ул. Ломоносова, д.9
            </p>
          </div>
          <div className="footer-socials">
            <p>
              <a
                href="https://vk.com/itmomegabattle"
                target="_blank"
                title="Группа в ВК"
              >
                <FontAwesomeIcon icon={faVk} />
                ВКонтакте
              </a>
            </p>
            <p>
              <a
                href="https://t.me/itmomegabattle"
                target="_blank"
                title="Группа в Telegram"
              >
                <FontAwesomeIcon icon={faTelegram} />
                Telegram
              </a>
            </p>
            <p>
              <a
                href="https://github.com/tuningt231/Megabattle-website"
                target="_blank"
                title="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} />
                GitHub
              </a>
            </p>
            <p>
              <a
                href="https://www.youtube.com/@itmomegabattle"
                target="_blank"
                title="YouTube"
              >
                <FontAwesomeIcon icon={faYoutube} />
                YouTube
              </a>
            </p>
          </div>
          <div className="footer-policy">
            <p>
              <a
                href="https://www.youtube.com/watch?v=0H_69KHDcP0"
                target="_blank"
              >
                Политика <br />
                конфиденциальности
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../common/components/Card";
import "../styles/footer.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVk,
  faTelegram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import RutubeIcon from "../common/components/RutubeIcon";
import ModalPortal from "./ModalPortal";
import { backendApi } from "../lib/backendApi";
import { supabase } from "../lib/supabase";

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
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setSending(true); setStatus("");
    try {
      let attachment = {};
      if (file) {
        if (file.size > 20 * 1024 * 1024) throw new Error("Файл должен быть не больше 20 МБ");
        if (!supabase) throw new Error("Загрузка файлов временно недоступна");
        const signed = await backendApi("/api/v1/support/upload", { method: "POST", body: JSON.stringify({ mimeType: file.type, sizeBytes: file.size }) });
        const { error } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
        if (error) throw error;
        attachment = { attachmentPath: signed.path, attachmentName: file.name, attachmentMime: file.type };
      }
      await backendApi("/api/v1/support", { method: "POST", body: JSON.stringify({ contact, message, consent, ...attachment }) });
      setStatus("Обращение отправлено. Мы свяжемся с тобой по указанному контакту."); setContact(""); setMessage(""); setFile(null); setConsent(false);
    } catch (error) { setStatus(error.message); } finally { setSending(false); }
  };
  return <FooterModal title="Поддержка" onClose={onClose}><form className="footer-support-form" onSubmit={submit}>
    <p>Напиши по любому вопросу: проблемы с сайтом, участие, данные профиля или предложения.</p>
    <label><span>Как с тобой связаться</span><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telegram, почта или телефон" minLength="3" maxLength="200" required /></label>
    <label><span>Что случилось</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Опиши вопрос и, если нужно, шаги до возникновения проблемы" minLength="10" maxLength="5000" rows="6" required /></label>
    <label className="footer-file"><span>Вложение <small>до 20 МБ</small></span><input type="file" accept="image/*,video/mp4,video/webm,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />{file && <em>{file.name}</em>}</label>
    <label className="footer-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>Согласен на обработку контакта и содержания обращения согласно <button type="button" onClick={onPolicy}>политике конфиденциальности</button>.</span></label>
    {status && <p className="footer-support-status" role="status">{status}</p>}
    <button className="footer-modal-primary" type="submit" disabled={sending}>{sending ? "Отправляем…" : "Отправить обращение"}</button>
  </form></FooterModal>;
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
        <Card className="footer-content">
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
              <RutubeIcon />
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
        </Card>
      </div>
      {modal === "privacy" && <PrivacyPolicy onClose={() => setModal(null)} onSupport={() => setModal("support")} />}
      {modal === "support" && <SupportForm onClose={() => setModal(null)} onPolicy={() => setModal("privacy")} />}
    </footer>
  );
}

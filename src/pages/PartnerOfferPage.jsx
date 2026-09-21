import "../styles/partner-offer.css";

const advantages = [
  "взаимодействие с активной аудиторией студентов",
  "встраивание бренда в эмоциональный контекст мероприятия",
  "знакомство аудитории с продуктом через механику мероприятий",
  "создание уникального контента совместно с проектом",
  "поддержка студенческих инициатив и становление частью жизни университета",
  "знакомство студентов с компанией",
];

const partnerTypes = [
  "бренды питания и напитков",
  "образовательные проекты",
  "сервисы и локальные компании",
  "развлекательные площадки",
  "технологические компании",
];

const events = [
  {
    title: "Мега Квест",
    text: "Игровое мероприятие по корпусам университета. Участники перемещаются между площадками, выполняют задания и соревнуются командами.",
    lead: "Возможности интеграции партнера:",
    groups: [
      ["Интеграции в механику мероприятия:", "партнерские задания", "посещение точки партнера", "поиск брендированных объектов", "дополнительные задания"],
      ["Оформление пространства", "баннеры", "плакаты", "брендированные элементы"],
      ["Активности", "розыгрыши призов", "интерактивы", "подарки участникам"],
    ],
  },
  {
    title: "Мега Квиз",
    text: "Интеллектуальная командная игра. Участники соревнуются в знаниях и скорости решения задач.",
    lead: "Возможности интеграции партнера:",
    groups: [["", "брендированный реквизит", "интеграция партнера в игровые элементы", "специальные вопросы или раунды", "фотозона", "розыгрыш призов", "брендированные подарки"]],
  },
  {
    title: "Мега Гейм",
    text: "Игровое мероприятие сезона. Формат с акцентом на игровые механики и взаимодействие участников.",
    lead: "Возможность интеграции:",
    groups: [["", "включение партнеры в игровые механики", "использование брендированного реквизита", "розыгрыш призов", "интеграция бренда в настольные игры и игровые активности, созданные под мероприятие"]],
  },
  {
    title: "Special и подготовка к концерту",
    text: "Месяц активного взаимодействия с командами. Период подготовки к финалу - это время максимального вовлечения участников. В этот период возможна интеграция продукта непосредственно в жизнь команд:",
    groups: [["", "розыгрыши", "челленджи", "бинго", "специальные активности", "тестирование продукта", "нативное взаимодействие с участниками"]],
    note: "Например: Длительная репетиция и подготовка команд создают естественные точки контакта для брендов питания, напитков, сервисов и других продуктов ежедневного использования.",
  },
  {
    title: "Гала-концерт",
    text: "Главное событие сезона. Финальное мероприятие проекта с максимальным количеством участников и зрителей.",
    lead: "Возможность для партнеров:",
    groups: [
      ["Оффлайн-присутствие:", "стойка партнера и размещение в фан-зоне", "оформленная фотозона", "размещение плакатов и баннеров", "брендированная инсталляция"],
      ["Контентная интеграция:", "показ видеороликов на экранах в фан-зоне", "упоминание партнера со сцены", "участие в пре-шоу"],
      ["Специальные форматы:", "собственная номинация партнера", "участие представителя компании в составе жюри", "вручение специального приза", "проведение розыгрыша"],
    ],
  },
];

const packages = [
  {
    title: "“Мне”",
    text: "для компаний, которые хотят присутствовать в рамках мероприятия",
    groups: [
      ["Digital:", "упоминание в посте со всеми партнерами в ВК + ТГК"],
      ["Интеграция в меро:", "пре-шоу", "озвучивание со сцены", "размещение своих баннеров"],
      ["Активности:", "проведение розыгрышей", "вручение призов"],
    ],
  },
  {
    title: "“Владу”",
    text: "для компаний, которые хотят встроиться в проект и стать его частью",
    groups: [
      ["Digital:", "отдельный пост в ВК + ТГК", "размещение на сайте проекта", "видеореклама", "TikTok-интеграции"],
      ["Создание совместного контента:", "разработка коллаборативного мерча", "брендированный контент"],
      ["Интеграция в меро:", "брендированная фотозона", "стойки партнеров", "интерактивные активности", "возможность создания инсталляции"],
      ["Главное событие сезона:", "участие представителя компании в роли жюри", "собственная номинация", "вручение специального приза"],
      ["Специальные интеграции:", "включение партнера в механику мероприятия (квиз, квест, гейм)"],
    ],
  },
];

function List({ items }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function Groups({ groups }) {
  return (
    <div className="partner-offer-event-groups">
      {groups.map(([title, ...items], index) => (
        <div key={`${title}-${index}`}>
          {title && <h4>{title}</h4>}
          <List items={items} />
        </div>
      ))}
    </div>
  );
}

export default function PartnerOfferPage() {
  return (
    <main className="partner-offer-page">
      <section className="partner-offer-hero main-width">
        <img className="partner-offer-logo" src="/history-logo.svg" alt="ITMO Megabattle" width="420" height="256" />
      </section>

      <section className="partner-offer-about main-width">
        <h2>О проекте</h2>
        <div className="partner-offer-about-panel">
          <div className="partner-offer-about-copy">
            <p><strong>ITMO Megabattle</strong> - масштабный студенческий проект Университета ИТМО, объединяющий студентов разных направлений в серии интеллектуальных, творческих, игровых и командных мероприятий.</p>
            <p>На протяжении сезона участники соревнуются за звание лучшего мегафакультета, проходят испытания, объединяются в команды и получают уникальный опыт взаимодействия с университетским сообществом.</p>
            <p>Финальной точкой сезона становится главное событие проекта - <strong>гала-концерт ITMO Megabattle</strong>, который объединяет участников, зрителей, представителей университета и партнёров проекта.</p>
            <p>Мы создаём не просто мероприятия, а пространство для взаимодействия студентов, брендов и университета.</p>
          </div>
          <div className="partner-offer-about-gallery" aria-label="Фотографии ITMO Megabattle">
            <img src="/images/events/event1.webp" alt="Выступление ITMO Megabattle" loading="lazy" />
            <img src="/images/history/archive/830.webp" alt="Танцевальное выступление ITMO Megabattle" loading="lazy" />
            <img src="/images/history/archive/807.webp" alt="Команда на сцене ITMO Megabattle" loading="lazy" />
            <img src="/images/history/archive/765.webp" alt="Участники ITMO Megabattle" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="partner-offer-benefits main-width">
        <h2>Почему ITMO Megabattle интересен партнерам</h2>
        <div className="partner-offer-benefit-grid">
          {advantages.map((item) => <article key={item}><p>{item}</p></article>)}
        </div>
      </section>

      <section className="partner-offer-proof main-width">
        <h2>Наши партнеры</h2>
        <div className="partner-offer-proof-panel">
          <p>За это время ITMO.Megabattle успел зарекомендовать себя как ответственный партнёр: мы сотрудничали с такими организациями, как «Достоевский», кинотеатр «Мираж», «Додо Пицца», «Севкабель Порт», Kimchi To Go и многими другими:</p>
          <List items={partnerTypes} />
          <p>Наши партнёры получают возможность напрямую взаимодействовать со студентами через мероприятия, цифровые площадки и специальные активности.</p>
        </div>
      </section>

      <section className="partner-offer-season main-width">
        <div className="partner-offer-section-head">
          <h2>
            Сезон ITMO Megabattle
            <span>В рамках сезона проходят несколько типов мероприятий, каждый из которых предоставляет уникальные возможности для интеграции партнёров.</span>
          </h2>
        </div>
        <div className="partner-offer-events">
          {events.map((event) => (
            <article className="partner-offer-event" key={event.title}>
              <div className="partner-offer-event-copy">
                <h3>{event.title}</h3>
                <p>{event.text}</p>
                {event.lead && <p className="partner-offer-event-lead">{event.lead}</p>}
              </div>
              <Groups groups={event.groups} />
              {event.note && <p className="partner-offer-event-note">{event.note}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="partner-offer-packages main-width">
        <div className="partner-offer-section-head"><h2>Пакетные предложения</h2></div>
        <div className="partner-offer-package-grid">
          {packages.map((item) => (
            <div className="partner-offer-package-wrap" key={item.title}>
              <h3>{item.title}</h3>
              <article>
                <p>{item.text}</p>
                <Groups groups={item.groups} />
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="partner-offer-jury-contact main-width">
        <h2>Контакты</h2>
        <div className="partner-offer-jury-contact-panel">
          <div className="partner-offer-jury-photo">
            <img src="/images/partners/anastasia-contact.jpeg" alt="Настюша" width="640" height="640" />
          </div>
          <div className="partner-offer-jury-copy">
            <strong>Настюша</strong>
            <p>Обращайтесь к Настюше по вопросам партнёрства и совместных проектов.</p>
            <div className="partner-offer-jury-actions">
              <a className="partner-offer-jury-button" href="https://t.me/annastationn" target="_blank" rel="noreferrer">Telegram</a>
              <a className="partner-offer-jury-button" href="mailto:megabattle@itmo.ru">Почта</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

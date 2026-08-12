export const ADMIN_TABS = [
  { id: "ratings", label: "Мегабаллы" },
  { id: "profiles", label: "Участники" },
  { id: "tags", label: "Метки" },
  { id: "passwords", label: "Пароли" },
  { id: "support", label: "Поддержка" },
  { id: "logs", label: "Логи" },
];

export const EMPTY_PASSWORD = {
  title: "",
  login: "",
  password_value: "",
  url: "",
  notes: "",
};

export const ACTION_LABELS = {
  "profile.update": "обновил профиль участника",
  "profile.delete": "удалил профиль участника",
  "profile.role.grant": "выдал права администратора",
  "profile.role.revoke": "отозвал права администратора",
  "password.create": "добавил доступ",
  "password.update": "обновил доступ",
  "password.delete": "удалил доступ",
  "event.create": "добавил мероприятие",
  "event.update": "обновил мероприятие",
  "event.delete": "удалил мероприятие",
  "tag.create": "создал NFC-метки",
  "tag.update": "обновил NFC-метку",
  "team_member.create": "добавил человека в команду",
  "team_member.update": "обновил карточку человека",
  "team_member.delete": "удалил человека из команды",
  "story.create": "добавил историю",
  "story.update": "изменил историю",
  "story.delete": "удалил историю",
  "story.review": "проверил историю участника",
  "rating.create": "добавил запись в рейтинг",
  "rating.update": "изменил рейтинг факультета",
  "rating.delete": "удалил запись из рейтинга",
  "vault.unlock": "открыл хранилище доступов",
  "auth.login": "вошёл в админку",
  "auth.logout": "вышел из админки",
};

export const ENTITY_LABELS = {
  profile: "участника",
  event: "мероприятие",
  tag: "NFC-метку",
  nfc_tag: "NFC-метку",
  password: "доступ",
  vault_entry: "доступ",
  team_member: "участника команды",
  story: "историю",
  rating: "запись рейтинга",
  partner: "партнёра",
};

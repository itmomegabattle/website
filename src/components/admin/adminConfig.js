export const ADMIN_TABS = [
  { id: "profiles", label: "Участники" },
  { id: "tags", label: "Метки" },
  { id: "passwords", label: "Пароли" },
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
  "profile.update": "Профиль обновлён",
  "profile.delete": "Профиль удалён",
  "password.create": "Пароль добавлен",
  "password.update": "Пароль обновлён",
  "password.delete": "Пароль удалён",
  "event.create": "Мероприятие добавлено",
  "event.update": "Мероприятие обновлено",
  "event.delete": "Мероприятие удалено",
  "tag.update": "Метка обновлена",
};

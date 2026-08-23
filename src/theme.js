// Работа с темой приложения

const THEME_STORAGE_KEY = "mb-theme";

// Получить тему при первой загрузке
function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let currentTheme = null;
let listeners = new Set();

// Общее API для переключения темы
export const Theme = {
  get() {
    if (currentTheme === null) this.set(getInitialTheme(), false);
    return currentTheme;
  },

  set(theme, transition=true) {
    if (theme !== "dark" && theme !== "light") return;
    if (currentTheme === theme) return;

    currentTheme = theme;

    if (transition) document.documentElement.classList.add("theme-transitioning");
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    listeners.forEach((cb) => cb(theme));

    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 400);
  },

  addListener(callback, invoke = true) {
    if (typeof callback !== "function") return;
    listeners.add(callback);
    if (invoke) callback(this.get());
  },

  removeListener(callback) {
    listeners.delete(callback);
  },
};

// синхронизация между вкладками
window.addEventListener("storage", (e) => {
  if (e.key === THEME_STORAGE_KEY) {
    Theme.set(e.newValue);
  }
});

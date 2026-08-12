import "../styles/gamification-widget.css";

const levels = [
  { level: 1, title: "Новичок IMB", minXp: 0 },
  { level: 2, title: "Участник движухи", minXp: 100 },
  { level: 3, title: "Завсегдатай", minXp: 250 },
  { level: 4, title: "Амбассадор", minXp: 450 },
  { level: 5, title: "Легенда сезона", minXp: 700 },
  { level: 6, title: "Мерч-хантер", minXp: 1000 },
  { level: 7, title: "Финальный босс", minXp: 1400 },
];

function getLevelProgress(value) {
  const xp = Math.max(0, Number(value) || 0);
  const current = [...levels].reverse().find((item) => xp >= item.minXp) || levels[0];
  const next = levels.find((item) => item.minXp > xp) || null;
  const progress = next
    ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100;

  return {
    xp,
    current,
    next,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

export default function GamificationWidget({
  profile,
  score = 0,
  socialCount = 0,
}) {
  const level = getLevelProgress(score);
  const badges = [...new Set([
    ...(profile?.achievements || []).map((item) => (Array.isArray(item.achievements) ? item.achievements[0]?.name : item.achievements?.name)).filter(Boolean),
    profile?.role_badge,
    profile?.is_best_actor ? "Лучший актёр" : null,
    profile?.is_admin ? "Организатор" : null,
  ].filter(Boolean))];

  return (
    <article className="pixel-glass-widget" aria-label="Личная геймификация участника">
      <div className="pixel-glass-widget__glow" aria-hidden="true" />
      <div className="pixel-glass-screen">
        <header className="pixel-glass-screen__topbar">
          <span className="pixel-status"><i /> player online</span>
          <span>MB://{String(profile?.id || "guest").slice(0, 4).toUpperCase()}</span>
        </header>

        <div className="pixel-glass-screen__hero">
          <div className="pixel-level-copy">
            <span>уровень {String(level.current.level).padStart(2, "0")}</span>
            <h2>{level.current.title}</h2>
          </div>
        </div>

        <div className="pixel-progress-block">
          <div className="pixel-progress-copy">
            <span>{level.xp} XP</span>
            <span>{level.next ? `${level.next.minXp} XP` : "MAX"}</span>
          </div>
          <div
            className="pixel-progress"
            role="progressbar"
            aria-label="Прогресс уровня"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={level.progress}
          >
            <span style={{ width: `${level.progress}%` }} />
          </div>
          <p>{level.next ? `До «${level.next.title}» — ${level.next.minXp - level.xp} XP` : "Максимальный уровень сезона"}</p>
        </div>

        <div className="pixel-stat-grid">
          <div>
            <span>соцсети</span>
            <strong>{socialCount}</strong>
          </div>
          <div>
            <span>ачивки</span>
            <strong>{badges.length}</strong>
          </div>
        </div>

        <div className="pixel-achievements">
          <span className="pixel-achievements__label">инвентарь</span>
          <div>
            {(badges.length ? badges : ["Первый вход"]).slice(0, 2).map((badge) => (
              <span className="pixel-chip" key={badge}>{badge}</span>
            ))}
          </div>
        </div>

        <footer className="pixel-glass-screen__footer">
          <span><i /> синхронизация</span>
          <span>season_09</span>
        </footer>
      </div>
      <div className="pixel-game-lock" aria-label="Геймификация откроется в 2027 году">
        <div className="pixel-game-lock__preview" aria-hidden="true"><span /><span /><span /></div>
        <time dateTime="2027">2027</time>
      </div>
    </article>
  );
}

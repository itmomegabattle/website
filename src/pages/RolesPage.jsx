import "../styles/roles.css";

const roles = [
  ["Координатор", "coordination"],
  ["Режиссёр", "director"],
  ["Помощник режиссёра", "assistant"],
  ["Продюсер", "producer"],
  ["Линейный продюсер", "schedule"],
  ["Аффилиат-менеджер", "partnership"],
  ["Жюри / наградка", "award"],
  ["Администратор", "admin"],
  ["Волонтёры", "volunteer"],
  ["Стейдж", "stage"],
  ["Реквизит", "props"],
  ["Бэкстейдж", "backstage"],
  ["Режиссёр трансляции", "broadcast"],
  ["Звукорежиссёр", "sound"],
  ["Технический директор", "technical"],
  ["Связующий техник", "connection"],
  ["Техник", "tools"],
  ["Светорежиссёр", "lighting"],
  ["Экранщик", "screen"],
  ["Программист", "code"],

  ["Сценарист", "script"],
  ["Режиссёр факультета", "director"],
  ["Костюмер", "costume"],
  ["Реквизитер", "props"],
  ["Художник-постановщик", "art"],
  ["Звукарь", "sound"],
  ["Световик", "lighting"],
  ["Постановщик", "blocking"],
  ["Актёр", "actor"],
  ["Актёр второго плана", "actor"],
  ["Массовка", "ensemble"],
  ["Вокалист", "vocal"],
  ["Хореограф", "choreo"],
  ["Танцор", "dance"],
  ["Экранщик факультета", "screen"],
  ["Писатель текстов визиток", "writing"],
  ["Гримёр-визажист", "makeup"],
  ["Креатор", "idea"],
  ["Дизайнер", "design"],
  ["Копирайтер", "copy"],
  ["Контент-мейкер", "content"],
  ["Фотограф", "photo"],
  ["Видеограф", "video"],
  ["Бренд-менеджер", "brand"],
  ["Монтажёр", "edit"],
  ["SMM-креатор", "social"],
  ["Моушен-дизайнер", "motion"],

  ["ОТВ", "radio"],
  ["МегаОТВ", "radio"],
  ["Хелпер", "volunteer"],

  ["Модельер", "fashion"],
  ["Швея", "sewing"],
  ["Сапожник", "shoe"],
  ["Ювелир", "jewelry"],
  ["Парикмахер", "hair"],
  ["Визажист-гримёр", "makeup"],
  ["Креатор партнёрки", "idea"],
  ["Фэшн-режиссёр", "fashion-director"],

  ["Волейболист", "volleyball"],
  ["Футболист", "football"],
  ["Баскетболист", "basketball"],
  ["Шутник", "joke"],
];

const shiftsX = [-26, 18, 34, -14, 8, -36, 25, 5, -20, 30, -8, 16];
const shiftsY = [18, -22, 32, 4, -34, 22, -8, 38, -16, 10, 26, -28];
const rotations = [-7, 4, 9, -3, 6, -9, 2, 8, -5, 3];
const scales = [0.9, 1.08, 0.98, 1.16, 0.86, 1.02, 0.94, 1.12];

function Art({ type }) {
  const common = {
    className: `role-attribute__svg role-attribute__svg--${type}`,
    viewBox: "0 0 180 140",
    role: "presentation",
    focusable: "false",
  };

  switch (type) {
    case "director":
      return <svg {...common}><path className="role-art-fill" d="M38 54h83v49H38z"/><path className="role-art-accent" d="M34 34h92v20H34z"/><path className="role-art-cut" d="m42 35 16 19m12-19 16 19m12-19 16 19"/><path className="role-art-line" d="M38 69h83M53 84h31"/><path className="role-art-soft" d="M132 49h13l16 12-16 12h-13z"/></svg>;
    case "assistant":
    case "schedule":
      return <svg {...common}><rect className="role-art-fill" x="45" y="24" width="76" height="94" rx="8"/><path className="role-art-accent" d="M68 18h30v15H68z"/><path className="role-art-line" d="M59 51h48M59 68h34M59 85h45M59 102h28"/><path className="role-art-soft" d="m132 42 12 12-28 28-16 4 4-16z"/></svg>;
    case "coordination":
    case "producer":
      return <svg {...common}><circle className="role-art-soft" cx="49" cy="44" r="17"/><circle className="role-art-soft" cx="132" cy="91" r="17"/><circle className="role-art-accent" cx="129" cy="37" r="13"/><path className="role-art-line role-art-line--wide" d="M64 48c32 0 44-8 53-14M58 56c16 26 35 31 57 34M128 50c0 13 1 21 2 27"/><path className="role-art-fill" d="M70 66h43v28H70z"/><path className="role-art-cut" d="M79 75h25M79 84h18"/></svg>;
    case "partnership":
      return <svg {...common}><path className="role-art-fill" d="m34 66 28-24 26 17-28 28zM146 66l-28-24-26 17 28 28z"/><path className="role-art-accent" d="m63 60 27 24 27-24 13 13-40 37-40-37z"/><path className="role-art-line role-art-line--wide" d="M81 51 96 64m-28 8 15 13m29-33L96 66"/></svg>;
    case "award":
      return <svg {...common}><path className="role-art-accent" d="m90 19 13 28 31 4-23 21 6 31-27-15-27 15 6-31-23-21 31-4z"/><path className="role-art-fill" d="M70 93h40v19H70zM60 112h60v12H60z"/><path className="role-art-line" d="M80 96v16m20-16v16"/></svg>;
    case "admin":
      return <svg {...common}><rect className="role-art-fill" x="30" y="34" width="120" height="76" rx="8"/><path className="role-art-accent" d="M30 34h120v20H30z"/><circle className="role-art-cut-fill" cx="43" cy="44" r="4"/><circle className="role-art-cut-fill" cx="56" cy="44" r="4"/><path className="role-art-line" d="M45 72h37M45 88h59M113 69h20v25h-20z"/></svg>;
    case "volunteer":
      return <svg {...common}><path className="role-art-accent" d="M90 112S42 84 42 51c0-19 23-28 48-2 25-26 48-17 48 2 0 33-48 61-48 61Z"/><path className="role-art-cut" d="M90 63v32M74 79h32"/><path className="role-art-soft" d="M28 94h25v15H28zM127 94h25v15h-25z"/></svg>;
    case "stage":
    case "backstage":
      return <svg {...common}><path className="role-art-fill" d="M28 33h124v75H28z"/><path className="role-art-accent" d="M28 33h21v75H28zm103 0h21v75h-21z"/><path className="role-art-line role-art-line--wide" d="M49 44c25 18 57 18 82 0M49 97c25-18 57-18 82 0"/><path className="role-art-soft" d="M61 55h58v41H61z"/></svg>;
    case "props":
      return <svg {...common}><path className="role-art-fill" d="M32 60h116v59H32z"/><path className="role-art-accent" d="m32 60 21-29h74l21 29z"/><path className="role-art-line" d="M90 31v88M53 31l18 29m56-29-18 29"/><path className="role-art-soft" d="M73 73h34v13H73z"/></svg>;
    case "broadcast":
      return <svg {...common}><rect className="role-art-fill" x="26" y="30" width="128" height="78" rx="7"/><path className="role-art-line" d="M68 108v15m44-15v15M54 123h72"/><circle className="role-art-accent" cx="58" cy="69" r="22"/><path className="role-art-cut" d="m51 57 20 12-20 12z"/><path className="role-art-soft" d="M91 49h44v9H91zm0 19h30v9H91zm0 19h38v9H91z"/></svg>;
    case "sound":
    case "radio":
      return <svg {...common}><path className="role-art-fill" d="M29 57h122v56H29z"/><path className="role-art-line" d="M45 73h90M45 91h90"/><circle className="role-art-accent" cx="58" cy="73" r="6"/><circle className="role-art-accent" cx="104" cy="91" r="6"/><path className="role-art-soft" d="M68 31c-20 0-31 14-31 31v17h13V61c0-11 7-19 18-19h44c11 0 18 8 18 19v18h13V62c0-17-11-31-31-31z"/><path className="role-art-accent" d="M35 73h18v30H35zm92 0h18v30h-18z"/></svg>;
    case "technical":
    case "tools":
      return <svg {...common}><path className="role-art-fill" d="m49 25 18 18-17 17 70 70 19-19-70-70 17-17-18-18z"/><path className="role-art-accent" d="M106 40a28 28 0 0 0 35 35l-20-7-6-17 11-18a28 28 0 0 0-20 7Z"/><circle className="role-art-cut-fill" cx="123" cy="113" r="5"/></svg>;
    case "connection":
      return <svg {...common}><path className="role-art-line role-art-line--wide" d="M36 91c12-45 96-45 108 0M54 91c10-26 62-26 72 0M74 91c6-10 26-10 32 0"/><circle className="role-art-accent" cx="90" cy="103" r="12"/><path className="role-art-fill" d="M20 88h28v24H20zm112 0h28v24h-28z"/></svg>;
    case "lighting":
      return <svg {...common}><path className="role-art-fill" d="M38 34h58l16 35-16 35H38z"/><circle className="role-art-accent" cx="72" cy="69" r="21"/><path className="role-art-beam" d="m104 48 58-26v94l-58-27z"/><path className="role-art-line" d="M60 104v20m24-20v20M50 124h44"/></svg>;
    case "screen":
      return <svg {...common}><rect className="role-art-fill" x="24" y="25" width="132" height="82" rx="5"/><path className="role-art-accent" d="m38 88 31-32 22 20 21-26 30 38z"/><circle className="role-art-soft" cx="61" cy="48" r="8"/><path className="role-art-line" d="M78 107v17m24-17v17M61 124h58"/></svg>;
    case "code":
      return <svg {...common}><path className="role-art-fill" d="M27 28h126v80H27z"/><path className="role-art-accent" d="M27 28h126v17H27z"/><path className="role-art-line role-art-line--wide" d="m66 62-18 14 18 14m48-28 18 14-18 14M99 55 82 96"/><path className="role-art-soft" d="M63 108h54l12 14H51z"/></svg>;
    case "script":
    case "writing":
    case "copy":
      return <svg {...common}><path className="role-art-fill" d="M38 22h82l22 22v78H38z"/><path className="role-art-accent" d="M120 22v24h22"/><path className="role-art-line" d="M55 61h69M55 78h52M55 95h61"/><path className="role-art-soft" d="m125 81 17 17-37 37-22 5 5-22z"/></svg>;
    case "costume":
    case "fashion":
      return <svg {...common}><path className="role-art-accent" d="M72 25h36l7 24 24 18-19 22-13-10 9 45H64l9-45-13 10-19-22 24-18z"/><path className="role-art-line" d="M72 25c4 15 32 15 36 0M73 79h34"/><path className="role-art-soft" d="M56 112h68v12H56z"/></svg>;
    case "art":
    case "design":
      return <svg {...common}><path className="role-art-fill" d="M30 28h120v86H30z"/><path className="role-art-accent" d="m43 101 31-38 21 23 17-17 25 32z"/><circle className="role-art-soft" cx="65" cy="50" r="11"/><path className="role-art-line" d="M22 121h136"/><path className="role-art-soft" d="m126 20 16 7-40 88-16-7z"/></svg>;
    case "blocking":
    case "choreo":
      return <svg {...common}><circle className="role-art-accent" cx="43" cy="95" r="13"/><circle className="role-art-accent" cx="91" cy="42" r="13"/><circle className="role-art-accent" cx="139" cy="96" r="13"/><path className="role-art-line role-art-line--wide" d="M53 87 80 53m22 0 27 34M56 101h70"/><path className="role-art-soft" d="m87 62 4-18 4 18 18 4-18 4-4 18-4-18-18-4z"/></svg>;
    case "actor":
    case "ensemble":
      return <svg {...common}><path className="role-art-fill" d="M29 40c22-13 43-10 61 6-4 34-21 55-45 61-14-18-19-40-16-67Z"/><path className="role-art-accent" d="M151 40c-22-13-43-10-61 6 4 34 21 55 45 61 14-18 19-40 16-67Z"/><path className="role-art-cut" d="M47 63h12m-5 22c10 4 17 2 23-4m44-18h12m-30 20c8-5 16-5 25 0"/></svg>;
    case "vocal":
      return <svg {...common}><path className="role-art-accent" d="M78 29h24v48a27 27 0 1 1-24 0z"/><path className="role-art-line" d="M90 104v20m-22 0h44"/><path className="role-art-soft" d="M123 36c20 8 28 25 22 44m-34-28c11 4 16 13 14 24"/></svg>;
    case "dance":
      return <svg {...common}><path className="role-art-accent" d="M63 22h47v24H82v28c0 28-12 46-35 46-17 0-27-10-27-23 0-15 13-26 30-26 6 0 10 1 13 3z"/><path className="role-art-soft" d="M110 34h43v24h-43z"/><path className="role-art-line" d="m119 41 10 10 16-20"/></svg>;
    case "makeup":
      return <svg {...common}><path className="role-art-fill" d="M34 83h81v33H34z"/><path className="role-art-accent" d="M45 48h14v35H45zm22-18h14v53H67zm22 11h14v42H89z"/><path className="role-art-soft" d="m126 28 13 6-34 78-13-6z"/><path className="role-art-accent" d="m130 23 19 9-10 18-19-9z"/></svg>;
    case "idea":
      return <svg {...common}><path className="role-art-accent" d="M90 18a40 40 0 0 0-24 72v18h48V90a40 40 0 0 0-24-72Z"/><path className="role-art-line" d="M71 108h38m-34 12h30M90 58v32m-17-24 17 17 17-17"/><path className="role-art-soft" d="M23 64h22m90 0h22M37 27l16 16m74-16-16 16"/></svg>;
    case "content":
    case "social":
      return <svg {...common}><rect className="role-art-fill" x="54" y="18" width="72" height="108" rx="12"/><path className="role-art-accent" d="M63 34h54v54H63z"/><path className="role-art-cut" d="m84 49 20 12-20 12z"/><circle className="role-art-soft" cx="73" cy="104" r="5"/><path className="role-art-line" d="M85 104h25"/></svg>;
    case "photo":
      return <svg {...common}><path className="role-art-fill" d="M28 48h124v70H28z"/><path className="role-art-accent" d="M55 35h40l10 13H45z"/><circle className="role-art-soft" cx="91" cy="83" r="25"/><circle className="role-art-accent" cx="91" cy="83" r="12"/><circle className="role-art-cut-fill" cx="133" cy="63" r="6"/></svg>;
    case "video":
      return <svg {...common}><path className="role-art-fill" d="M27 48h91v62H27z"/><path className="role-art-accent" d="m118 64 35-17v64l-35-17z"/><circle className="role-art-soft" cx="49" cy="35" r="18"/><circle className="role-art-soft" cx="90" cy="35" r="18"/><path className="role-art-line" d="M72 110v17m-24 0h48"/></svg>;
    case "brand":
      return <svg {...common}><path className="role-art-accent" d="m28 65 52-37 74 15-37 74-74-15z"/><circle className="role-art-cut-fill" cx="126" cy="55" r="7"/><path className="role-art-cut" d="M57 73h52M63 88h35"/><path className="role-art-soft" d="M80 28 54 14l-9 17"/></svg>;
    case "edit":
    case "motion":
      return <svg {...common}><rect className="role-art-fill" x="25" y="31" width="130" height="78" rx="5"/><path className="role-art-accent" d="m43 51 24 15-24 15zm47 0 24 15-24 15z"/><path className="role-art-line" d="M39 95h102M61 88v14m55-14v14"/><path className="role-art-soft" d="m126 18 12 12-51 51-18 4 4-18z"/></svg>;
    case "sewing":
      return <svg {...common}><circle className="role-art-fill" cx="69" cy="73" r="42"/><path className="role-art-accent" d="M69 31a42 42 0 0 1 0 84c-18-19-18-65 0-84Z"/><path className="role-art-line" d="M69 31c-17 18-17 65 0 84m-37-42h74"/><path className="role-art-soft" d="m119 22 8 3-31 99-8-3z"/><path className="role-art-line" d="M122 25c18 15 25 35 21 60"/></svg>;
    case "shoe":
      return <svg {...common}><path className="role-art-accent" d="M29 82c27 0 43-11 50-43l19 5c1 23 17 37 48 40l9 23H35z"/><path className="role-art-line" d="M75 61h27m-31 13h39M38 107h117"/><path className="role-art-soft" d="m117 28 16 5-10 31-16-5z"/></svg>;
    case "jewelry":
      return <svg {...common}><path className="role-art-accent" d="m90 20 31 27-31 73-31-73z"/><path className="role-art-cut" d="M59 47h62M75 47l15 73 15-73M75 47l15-27 15 27"/><path className="role-art-soft" d="M39 108h20m62 0h20"/></svg>;
    case "hair":
      return <svg {...common}><path className="role-art-fill" d="m31 106 80-80 18 18-80 80z"/><path className="role-art-accent" d="m111 26 31-13-13 31z"/><path className="role-art-soft" d="M32 27h22v95H32z"/><path className="role-art-line" d="M54 35h28M54 52h18M54 69h28M54 86h18"/></svg>;
    case "fashion-director":
      return <svg {...common}><path className="role-art-accent" d="M74 22h32l8 22 24 16-17 20-13-8 8 51H64l8-51-13 8-17-20 24-16z"/><path className="role-art-soft" d="M24 99h35v20H24zm97 0h35v20h-35z"/><path className="role-art-line" d="M41 99V75m98 24V75M31 75h20m78 0h20"/></svg>;
    case "volleyball":
      return <svg {...common}><circle className="role-art-fill" cx="90" cy="72" r="50"/><path className="role-art-accent" d="M90 22c18 17 24 32 18 46-7 17-25 24-54 21M42 46c23-2 40 5 50 21 11 16 10 34-2 54M137 48c-25 8-39 21-42 39"/></svg>;
    case "football":
      return <svg {...common}><circle className="role-art-fill" cx="90" cy="72" r="50"/><path className="role-art-accent" d="m90 43 18 13-7 21H79l-7-21z"/><path className="role-art-line" d="m90 22 0 21M42 48l30 8m66-8-30 8M54 110l25-33m47 33-25-33M47 91l7 19m79-19-7 19"/></svg>;
    case "basketball":
      return <svg {...common}><circle className="role-art-accent" cx="90" cy="72" r="50"/><path className="role-art-cut" d="M90 22v100M40 72h100M52 37c24 18 34 46 30 83m46-83c-24 18-34 46-30 83"/></svg>;
    case "joke":
      return <svg {...common}><path className="role-art-fill" d="M28 29h124v73H88l-28 24 5-24H28z"/><path className="role-art-accent" d="M57 62c9 24 57 24 66 0"/><circle className="role-art-soft" cx="66" cy="54" r="6"/><circle className="role-art-soft" cx="114" cy="54" r="6"/></svg>;
    default:
      return <svg {...common}><circle className="role-art-accent" cx="90" cy="70" r="42"/><path className="role-art-cut" d="M90 43v35m0 18v2"/></svg>;
  }
}

export default function RolesPage() {
  return (
    <main className="roles-attributes" aria-label="Роли проекта">
      {roles.map(([name, type], index) => (
        <figure
          className={`role-attribute role-attribute--${type}`}
          key={`${name}-${index}`}
          style={{
            "--x": `${shiftsX[index % shiftsX.length]}px`,
            "--y": `${shiftsY[(index * 5) % shiftsY.length]}px`,
            "--xm": `${shiftsX[index % shiftsX.length] * 0.35}px`,
            "--ym": `${shiftsY[(index * 5) % shiftsY.length] * 0.42}px`,
            "--r": `${rotations[(index * 3) % rotations.length]}deg`,
            "--rm": `${rotations[(index * 3) % rotations.length] * 0.65}deg`,
            "--caption-r": `${rotations[(index * 3) % rotations.length] * -0.35}deg`,
            "--s": scales[(index * 7) % scales.length],
            "--sh": scales[(index * 7) % scales.length] * 1.06,
            "--sm": scales[(index * 7) % scales.length] * 0.88,
            "--smh": scales[(index * 7) % scales.length] * 0.92,
          }}
        >
          <div className="role-attribute__art" aria-hidden="true">
            <Art type={type} />
          </div>
          <figcaption>{name}</figcaption>
        </figure>
      ))}
    </main>
  );
}
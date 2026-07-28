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
  ["Режиссёр факультета", "faculty-director"],
  ["Костюмер", "costume"],
  ["Реквизитер", "prop-master"],
  ["Художник-постановщик", "art"],
  ["Звукарь", "sound-operator"],
  ["Световик", "light-operator"],
  ["Постановщик", "blocking"],
  ["Актёр", "actor"],
  ["Актёр второго плана", "supporting-actor"],
  ["Массовка", "ensemble"],
  ["Вокалист", "vocal"],
  ["Хореограф", "choreo"],
  ["Танцор", "dance"],
  ["Экранщик факультета", "faculty-screen"],
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

  ["Модельер", "fashion"],
  ["Швея", "sewing"],
  ["Сапожник", "shoe"],
  ["Ювелир", "jewelry"],
  ["Парикмахер", "hair"],
  ["Визажист-гримёр", "fashion-makeup"],
  ["Креатор партнёрки", "partnership-creative"],
  ["Фэшн-режиссёр", "fashion-director"],

  ["Волейболист", "volleyball"],
  ["Футболист", "football"],
  ["Баскетболист", "basketball"],
  ["Шутник", "joke"],
];

const roleCopy = {
  coordination: "Связывает направления, людей и сроки в одну работающую систему.",
  director: "Собирает идею, драматургию и людей в цельное сценическое высказывание.",
  "faculty-director": "Ведёт творческую команду факультета от первой идеи до выхода на сцену.",
  assistant: "Держит план репетиций, правки и коммуникацию команды в порядке.",
  producer: "Превращает замысел в реальный проект: от ресурсов до финального показа.",
  schedule: "Следит за производственным графиком и помогает команде успевать главное.",
  partnership: "Находит точки соприкосновения проекта с партнёрами и новыми возможностями.",
  award: "Работает с жюри, номинациями, дипломами и главным моментом награждения.",
  admin: "Управляет пространством, потоками людей и десятками деталей мероприятия.",
  volunteer: "Помогает там, где особенно нужны скорость, внимание и человеческое участие.",
  stage: "Отвечает за то, чтобы сцена жила точно по таймингу и без лишних пауз.",
  backstage: "Управляет невидимой зрителю жизнью номера за кулисами.",
  props: "Создаёт и хранит предметный мир номера — от маленькой детали до декорации.",
  "prop-master": "Изготавливает, чинит и выпускает на сцену каждый предмет номера.",
  broadcast: "Собирает происходящее на сцене в живую экранную историю.",
  sound: "Делает так, чтобы голос, музыка и атмосфера прозвучали именно как задумано.",
  "sound-operator": "Ведёт звук конкретного номера во время репетиций и выступления.",
  technical: "Проектирует техническую сторону шоу и отвечает за её надёжность.",
  connection: "Соединяет площадку, оборудование и технические команды в одну сеть.",
  tools: "Настраивает, чинит и запускает оборудование в нужный момент.",
  lighting: "Рисует сцену светом, направляет внимание и меняет настроение пространства.",
  "light-operator": "Точно исполняет световую партитуру факультетского номера.",
  screen: "Управляет визуальным контентом на экранах и синхронизирует его со сценой.",
  "faculty-screen": "Готовит и запускает экранную графику факультетского выступления.",
  code: "Создаёт цифровые инструменты, которые помогают проекту работать и расти.",
  script: "Превращает идею в историю, реплики, сцены и точный ход номера.",
  costume: "Собирает образ героя через форму, ткань, цвет и детали.",
  art: "Создаёт визуальный мир номера и следит за его цельностью.",
  blocking: "Выстраивает движение людей и объектов в сценическом пространстве.",
  actor: "Передаёт историю зрителю через действие, характер и живое присутствие.",
  "supporting-actor": "Создаёт убедительный второй план и поддерживает главную линию сцены.",
  ensemble: "Создаёт масштаб сцены и помогает главным героям быть убедительнее.",
  vocal: "Работает с голосом как с главным музыкальным инструментом сцены.",
  choreo: "Придумывает язык движения и собирает танец в выразительную композицию.",
  dance: "Рассказывает историю телом, ритмом и точностью движения.",
  writing: "Находит слова, которые быстро объясняют идею и остаются в памяти.",
  makeup: "Меняет внешность героя и доводит образ до сценической выразительности.",
  "fashion-makeup": "Собирает макияж показа так, чтобы он работал с одеждой и светом.",
  idea: "Придумывает неожиданный ход, из которого может вырасти целый проект.",
  "partnership-creative": "Придумывает совместные форматы, в которых партнёр становится частью события.",
  design: "Переводит смысл в форму, композицию, типографику и визуальную систему.",
  copy: "Пишет понятные и живые тексты для аудитории проекта.",
  content: "Создаёт материалы, через которые проект видят до и после события.",
  photo: "Ловит моменты, из которых потом складывается визуальная память сезона.",
  video: "Снимает движение, эмоции и масштаб проекта в живом кадре.",
  brand: "Следит за характером проекта и тем, как он звучит во всех точках контакта.",
  edit: "Собирает отснятый материал в ритм, историю и законченное видео.",
  social: "Придумывает, как проект будет разговаривать с аудиторией в соцсетях.",
  motion: "Оживляет графику и добавляет визуалу время, темп и движение.",
  radio: "Держит связь между факультетом и общей системой проекта.",
  fashion: "Придумывает одежду как самостоятельное художественное высказывание.",
  sewing: "Превращает эскиз и ткань в вещь, готовую выйти на подиум или сцену.",
  shoe: "Создаёт и адаптирует обувь под образ, движение и сценическую нагрузку.",
  jewelry: "Делает акцентные детали, которые завершают образ.",
  hair: "Строит силуэт и характер образа через причёску.",
  "fashion-director": "Собирает коллекцию, моделей, музыку и движение в единый показ.",
  volleyball: "Играет за команду и факультет на волейбольной площадке.",
  football: "Работает с командой, мячом и тактикой на футбольном поле.",
  basketball: "Создаёт темп игры и результат баскетбольной команды.",
  joke: "Находит смешное в знакомом и превращает его в точный сценический момент.",
};

const roleItems = roles.map(([name, type], index) => ({
  id: `${type}-${index}`,
  name,
  type,
  description: roleCopy[type] || "Важная роль внутри большой команды Megabattle.",
}));

const scatterPattern = [
  [2, 2, -3, -8], [1, 2, 2, 8], [1, 1, -1, -4], [2, 2, 3, 5],
  [1, 2, -2, 10], [1, 1, 1, -7], [2, 2, -1, 3], [1, 2, 3, -2],
  [1, 1, -3, 8], [2, 2, 2, -6], [1, 2, -1, 5], [1, 1, 2, -9],
  [2, 2, -2, 6], [1, 2, 1, -5], [1, 1, -3, 9], [2, 2, 3, -3],
];

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
    case "faculty-director":
      return <svg {...common}><path className="role-art-fill" d="M50 51h80v47H50z"/><path className="role-art-accent" d="M60 36h60v18H60zM42 98h96v16H42z"/><path className="role-art-line" d="M58 114v12m64-12v12M90 51v47"/><path className="role-art-soft" d="m30 38 12-9 26 34-12 9z"/><circle className="role-art-accent" cx="34" cy="31" r="10"/></svg>;
    case "assistant":
      return <svg {...common}><rect className="role-art-fill" x="45" y="24" width="76" height="94" rx="8"/><path className="role-art-accent" d="M68 18h30v15H68z"/><path className="role-art-line" d="M59 51h48M59 68h34M59 85h45M59 102h28"/><path className="role-art-soft" d="m132 42 12 12-28 28-16 4 4-16z"/></svg>;
    case "schedule":
      return <svg {...common}><rect className="role-art-fill" x="29" y="29" width="122" height="94" rx="8"/><path className="role-art-accent" d="M29 29h122v25H29z"/><path className="role-art-cut" d="M57 20v20m66-20v20"/><path className="role-art-line" d="M47 70h18m13 0h18m13 0h18M47 88h18m13 0h18m13 0h18M47 106h18m13 0h18"/><path className="role-art-soft" d="m113 101 8 8 18-23"/></svg>;
    case "coordination":
      return <svg {...common}><circle className="role-art-soft" cx="49" cy="44" r="17"/><circle className="role-art-soft" cx="132" cy="91" r="17"/><circle className="role-art-accent" cx="129" cy="37" r="13"/><path className="role-art-line role-art-line--wide" d="M64 48c32 0 44-8 53-14M58 56c16 26 35 31 57 34M128 50c0 13 1 21 2 27"/><path className="role-art-fill" d="M70 66h43v28H70z"/><path className="role-art-cut" d="M79 75h25M79 84h18"/></svg>;
    case "producer":
      return <svg {...common}><path className="role-art-accent" d="M29 56h39l69-30v82L68 79H29z"/><path className="role-art-fill" d="M42 79h25l11 47H52z"/><path className="role-art-line role-art-line--wide" d="M137 48c15 7 15 31 0 38M151 35c29 19 29 47 0 66"/><path className="role-art-cut" d="M68 56v23"/></svg>;
    case "partnership":
return <svg {...common}><circle className="role-art-soft" cx="50" cy="44" r="15"/><circle className="role-art-soft" cx="130" cy="44" r="15"/><path className="role-art-fill" d="M25 108c1-22 10-34 25-34s24 12 25 34zm80 0c1-22 10-34 25-34s24 12 25 34z"/><path className="role-art-line role-art-line--wide" d="M68 72h44"/><circle className="role-art-accent" cx="90" cy="72" r="14"/><path className="role-art-cut" d="m82 72 5 5 11-11"/></svg>;      return <svg {...common}><path className="role-art-accent" d="m90 19 13 28 31 4-23 21 6 31-27-15-27 15 6-31-23-21 31-4z"/><path className="role-art-fill" d="M70 93h40v19H70zM60 112h60v12H60z"/><path className="role-art-line" d="M80 96v16m20-16v16"/></svg>;
    case "admin":
      return <svg {...common}><rect className="role-art-fill" x="30" y="34" width="120" height="76" rx="8"/><path className="role-art-accent" d="M30 34h120v20H30z"/><circle className="role-art-cut-fill" cx="43" cy="44" r="4"/><circle className="role-art-cut-fill" cx="56" cy="44" r="4"/><path className="role-art-line" d="M45 72h37M45 88h59M113 69h20v25h-20z"/></svg>;
    case "volunteer":
      return <svg {...common}><path className="role-art-accent" d="M90 112S42 84 42 51c0-19 23-28 48-2 25-26 48-17 48 2 0 33-48 61-48 61Z"/><path className="role-art-cut" d="M90 63v32M74 79h32"/><path className="role-art-soft" d="M28 94h25v15H28zM127 94h25v15h-25z"/></svg>;
    case "stage":
      return <svg {...common}>
        <path className="role-art-fill" d="M22 24h136v96H22z"/>
        <path className="role-art-accent" d="M22 24h136v15H22z"/>
        <path className="role-art-soft" d="M29 39h30v69H29zm92 0h30v69h-30z"/>
        <path className="role-art-line role-art-line--wide" d="M31 41c8 14 17 23 28 28m90-28c-8 14-17 23-28 28"/>
        <path className="role-art-line" d="M29 54h30M29 70h30M29 86h30m62-32h30m-30 16h30m-30 16h30"/>
        <path className="role-art-fill" d="M59 39h62v69H59z"/>
        <path className="role-art-accent" d="m70 96 20-14 20 14v12H70z"/>
        <path className="role-art-line" d="M48 120h84M70 48h40M76 55h28"/>
        <circle className="role-art-accent" cx="48" cy="31" r="5"/>
        <circle className="role-art-accent" cx="90" cy="31" r="5"/>
        <circle className="role-art-accent" cx="132" cy="31" r="5"/>
      </svg>;
    case "backstage":
      return <svg {...common}>
        <path className="role-art-fill" d="M24 49h105v65H24z"/>
        <path className="role-art-accent" d="M24 49h105v17H24z"/>
        <path className="role-art-line" d="M43 49V34h67v15M37 81h79M48 66v48m57-48v48"/>
        <circle className="role-art-soft" cx="42" cy="119" r="8"/>
        <circle className="role-art-soft" cx="112" cy="119" r="8"/>
        <path className="role-art-soft" d="M139 34c14 5 20 16 18 30l-10-1c1-8-2-14-11-18z"/>
        <path className="role-art-accent" d="M130 30h15v31h-15z"/>
        <path className="role-art-line role-art-line--wide" d="M143 64c0 24-12 34-31 35"/>
        <path className="role-art-accent" d="M102 94h19v11h-19z"/>
      </svg>;
    case "props":
      return <svg {...common}><path className="role-art-fill" d="M32 60h116v59H32z"/><path className="role-art-accent" d="m32 60 21-29h74l21 29z"/><path className="role-art-line" d="M90 31v88M53 31l18 29m56-29-18 29"/><path className="role-art-soft" d="M73 73h34v13H73z"/></svg>;
    case "prop-master":
      return <svg {...common}><path className="role-art-fill" d="M31 72h118v47H31z"/><path className="role-art-accent" d="M45 59h90v20H45z"/><path className="role-art-line" d="M55 72V49h70v23M54 93h72"/><path className="role-art-soft" d="m43 31 13-12 37 39-13 12zM109 24h28v14h-28z"/><path className="role-art-line role-art-line--wide" d="m116 38-22 27"/></svg>;
    case "broadcast":
      return <svg {...common}><rect className="role-art-fill" x="26" y="30" width="128" height="78" rx="7"/><path className="role-art-line" d="M68 108v15m44-15v15M54 123h72"/><circle className="role-art-accent" cx="58" cy="69" r="22"/><path className="role-art-cut" d="m51 57 20 12-20 12z"/><path className="role-art-soft" d="M91 49h44v9H91zm0 19h30v9H91zm0 19h38v9H91z"/></svg>;
    case "sound":
      return <svg {...common}><path className="role-art-fill" d="M29 57h122v56H29z"/><path className="role-art-line" d="M45 73h90M45 91h90"/><circle className="role-art-accent" cx="58" cy="73" r="6"/><circle className="role-art-accent" cx="104" cy="91" r="6"/><path className="role-art-soft" d="M68 31c-20 0-31 14-31 31v17h13V61c0-11 7-19 18-19h44c11 0 18 8 18 19v18h13V62c0-17-11-31-31-31z"/><path className="role-art-accent" d="M35 73h18v30H35zm92 0h18v30h-18z"/></svg>;
    case "sound-operator":
      return <svg {...common}><rect className="role-art-fill" x="24" y="32" width="132" height="84" rx="7"/><path className="role-art-line" d="M45 48v53m30-53v53m30-53v53m30-53v53"/><path className="role-art-accent" d="M36 60h18v14H36zm30 21h18v14H66zm30-35h18v14H96zm30 27h18v14h-18z"/><path className="role-art-soft" d="M38 110h104v10H38z"/></svg>;
    case "technical":
      return <svg {...common}><path className="role-art-fill" d="M27 25h126v94H27z"/><path className="role-art-line" d="M42 45h96M42 62h49M42 79h31m23-8 29 29m0-29-29 29"/><circle className="role-art-accent" cx="125" cy="86" r="28"/><path className="role-art-cut" d="M125 65v42m-21-21h42"/></svg>;
    case "tools":
      return <svg {...common}><path className="role-art-fill" d="m49 25 18 18-17 17 70 70 19-19-70-70 17-17-18-18z"/><path className="role-art-accent" d="M106 40a28 28 0 0 0 35 35l-20-7-6-17 11-18a28 28 0 0 0-20 7Z"/><circle className="role-art-cut-fill" cx="123" cy="113" r="5"/></svg>;
    case "connection":
      return <svg {...common}><path className="role-art-line role-art-line--wide" d="M36 91c12-45 96-45 108 0M54 91c10-26 62-26 72 0M74 91c6-10 26-10 32 0"/><circle className="role-art-accent" cx="90" cy="103" r="12"/><path className="role-art-fill" d="M20 88h28v24H20zm112 0h28v24h-28z"/></svg>;
    case "lighting":
      return <svg {...common}><path className="role-art-fill" d="M38 34h58l16 35-16 35H38z"/><circle className="role-art-accent" cx="72" cy="69" r="21"/><path className="role-art-beam" d="m104 48 58-26v94l-58-27z"/><path className="role-art-line" d="M60 104v20m24-20v20M50 124h44"/></svg>;
    case "light-operator":
      return <svg {...common}><path className="role-art-fill" d="M25 43h130v75H25z"/><path className="role-art-line" d="M42 59h96M42 78h96M42 97h96"/><circle className="role-art-accent" cx="55" cy="59" r="6"/><circle className="role-art-accent" cx="105" cy="78" r="6"/><circle className="role-art-accent" cx="79" cy="97" r="6"/><path className="role-art-soft" d="m77 18 13 19 13-19 9 8-22 30-22-30z"/></svg>;
    case "screen":
      return <svg {...common}><rect className="role-art-fill" x="24" y="25" width="132" height="82" rx="5"/><path className="role-art-accent" d="m38 88 31-32 22 20 21-26 30 38z"/><circle className="role-art-soft" cx="61" cy="48" r="8"/><path className="role-art-line" d="M78 107v17m24-17v17M61 124h58"/></svg>;
    case "faculty-screen":
      return <svg {...common}><path className="role-art-fill" d="M35 31h110v69H35z"/><path className="role-art-accent" d="m72 48 34 18-34 18z"/><path className="role-art-line" d="M55 100h70l15 20H40z"/><path className="role-art-soft" d="M48 112h84v8H48z"/></svg>;
    case "code":
      return <svg {...common}><path className="role-art-fill" d="M27 28h126v80H27z"/><path className="role-art-accent" d="M27 28h126v17H27z"/><path className="role-art-line role-art-line--wide" d="m66 62-18 14 18 14m48-28 18 14-18 14M99 55 82 96"/><path className="role-art-soft" d="M63 108h54l12 14H51z"/></svg>;
    case "script":
      return <svg {...common}><path className="role-art-fill" d="M38 22h82l22 22v78H38z"/><path className="role-art-accent" d="M120 22v24h22"/><path className="role-art-line" d="M55 61h69M55 78h52M55 95h61"/><path className="role-art-soft" d="m125 81 17 17-37 37-22 5 5-22z"/></svg>;
    case "writing":
      return <svg {...common}><path className="role-art-fill" d="M31 37h95v80H31z"/><path className="role-art-line" d="M46 57h62M46 75h51M46 93h58"/><path className="role-art-accent" d="m130 24 22 21-54 58-29 8 8-29z"/><path className="role-art-cut" d="m77 82 21 21"/></svg>;
    case "copy":
      return <svg {...common}><path className="role-art-fill" d="M26 35h128v78H26z"/><path className="role-art-accent" d="M45 54h31v28H58v18H43V77c0-12 1-17 2-23Zm58 0h31v28h-18v18h-15V77c0-12 1-17 2-23Z"/><path className="role-art-line" d="M42 113h96"/></svg>;
    case "costume":
      return <svg {...common}><path className="role-art-accent" d="M72 25h36l7 24 24 18-19 22-13-10 9 45H64l9-45-13 10-19-22 24-18z"/><path className="role-art-line" d="M72 25c4 15 32 15 36 0M73 79h34"/><path className="role-art-soft" d="M56 112h68v12H56z"/></svg>;
    case "fashion":
      return <svg {...common}><circle className="role-art-soft" cx="90" cy="27" r="13"/><path className="role-art-fill" d="M69 42h42l12 78H57z"/><path className="role-art-accent" d="m69 49-29 33 14 13 24-29m33-17 29 33-14 13-24-29"/><path className="role-art-line" d="M90 40v84M72 62h36"/></svg>;
    case "art":
      return <svg {...common}><path className="role-art-fill" d="M30 28h120v86H30z"/><path className="role-art-accent" d="m43 101 31-38 21 23 17-17 25 32z"/><circle className="role-art-soft" cx="65" cy="50" r="11"/><path className="role-art-line" d="M22 121h136"/><path className="role-art-soft" d="m126 20 16 7-40 88-16-7z"/></svg>;
    case "design":
      return <svg {...common}><path className="role-art-fill" d="M28 25h124v95H28z"/><path className="role-art-line" d="M49 25v95m28-95v95m28-95v95m28-95v95M28 49h124M28 76h124M28 101h124"/><path className="role-art-accent" d="m42 105 62-66 33 31-62 38z"/><path className="role-art-cut" d="m92 52 32 30"/></svg>;
    case "blocking":
      return <svg {...common}><circle className="role-art-accent" cx="43" cy="95" r="13"/><circle className="role-art-accent" cx="91" cy="42" r="13"/><circle className="role-art-accent" cx="139" cy="96" r="13"/><path className="role-art-line role-art-line--wide" d="M53 87 80 53m22 0 27 34M56 101h70"/><path className="role-art-soft" d="m87 62 4-18 4 18 18 4-18 4-4 18-4-18-18-4z"/></svg>;
    case "choreo":
      return <svg {...common}><circle className="role-art-accent" cx="92" cy="28" r="13"/><path className="role-art-line role-art-line--wide" d="M91 42 75 73l-31 17m31-17 29 15m-13-46 27 22 25-13M75 73l-7 45m36-30 26 29"/><path className="role-art-soft" d="m32 87 16-13 10 17-16 13zm89 28 17-11 9 16-17 11z"/></svg>;
    case "actor":
      return <svg {...common}><path className="role-art-fill" d="M29 40c22-13 43-10 61 6-4 34-21 55-45 61-14-18-19-40-16-67Z"/><path className="role-art-accent" d="M151 40c-22-13-43-10-61 6 4 34 21 55 45 61 14-18 19-40 16-67Z"/><path className="role-art-cut" d="M47 63h12m-5 22c10 4 17 2 23-4m44-18h12m-30 20c8-5 16-5 25 0"/></svg>;
    case "supporting-actor":
      return <svg {...common}><circle className="role-art-accent" cx="90" cy="51" r="25"/><path className="role-art-fill" d="M45 122c4-35 20-52 45-52s41 17 45 52z"/><path className="role-art-line" d="M28 28 58 48m94-20-30 20M20 17h28m84 0h28"/><circle className="role-art-soft" cx="90" cy="51" r="8"/></svg>;
    case "ensemble":
      return <svg {...common}><circle className="role-art-soft" cx="48" cy="54" r="19"/><circle className="role-art-accent" cx="90" cy="39" r="22"/><circle className="role-art-soft" cx="132" cy="54" r="19"/><path className="role-art-fill" d="M20 119c3-28 14-43 31-43 14 0 24 10 29 29 4-28 16-43 35-43 24 0 39 19 43 57z"/></svg>;
    case "vocal":
      return <svg {...common}><path className="role-art-accent" d="M78 29h24v48a27 27 0 1 1-24 0z"/><path className="role-art-line" d="M90 104v20m-22 0h44"/><path className="role-art-soft" d="M123 36c20 8 28 25 22 44m-34-28c11 4 16 13 14 24"/></svg>;
    case "dance":
      return <svg {...common}><path className="role-art-accent" d="M63 22h47v24H82v28c0 28-12 46-35 46-17 0-27-10-27-23 0-15 13-26 30-26 6 0 10 1 13 3z"/><path className="role-art-soft" d="M110 34h43v24h-43z"/><path className="role-art-line" d="m119 41 10 10 16-20"/></svg>;
    case "makeup":
      return <svg {...common}><path className="role-art-fill" d="M34 83h81v33H34z"/><path className="role-art-accent" d="M45 48h14v35H45zm22-18h14v53H67zm22 11h14v42H89z"/><path className="role-art-soft" d="m126 28 13 6-34 78-13-6z"/><path className="role-art-accent" d="m130 23 19 9-10 18-19-9z"/></svg>;
    case "fashion-makeup":
      return <svg {...common}><circle className="role-art-fill" cx="76" cy="69" r="46"/><circle className="role-art-soft" cx="76" cy="69" r="31"/><path className="role-art-line" d="M42 100 28 119m62-9 12 17"/><path className="role-art-accent" d="m118 31 16 6-32 83-16-6z"/><path className="role-art-cut" d="m119 33 14 6"/></svg>;
    case "idea":
      return <svg {...common}><path className="role-art-accent" d="M90 18a40 40 0 0 0-24 72v18h48V90a40 40 0 0 0-24-72Z"/><path className="role-art-line" d="M71 108h38m-34 12h30M90 58v32m-17-24 17 17 17-17"/><path className="role-art-soft" d="M23 64h22m90 0h22M37 27l16 16m74-16-16 16"/></svg>;
    case "partnership-creative":
      return <svg {...common}><path className="role-art-fill" d="M28 38h54v48H28zM98 55h54v48H98z"/><path className="role-art-accent" d="M71 61h38v18H71z"/><path className="role-art-line role-art-line--wide" d="m45 105 22 17 25-31 22 17 25-30"/><circle className="role-art-soft" cx="45" cy="105" r="8"/><circle className="role-art-soft" cx="139" cy="78" r="8"/></svg>;
    case "content":
      return <svg {...common}><rect className="role-art-fill" x="54" y="18" width="72" height="108" rx="12"/><path className="role-art-accent" d="M63 34h54v54H63z"/><path className="role-art-cut" d="m84 49 20 12-20 12z"/><circle className="role-art-soft" cx="73" cy="104" r="5"/><path className="role-art-line" d="M85 104h25"/></svg>;
    case "social":
      return <svg {...common}><path className="role-art-fill" d="M35 28h75v89H35z"/><path className="role-art-line" d="M48 47h49M48 64h39M48 81h45"/><path className="role-art-accent" d="M101 58h46v39h-21l-15 14 3-14h-13z"/><path className="role-art-cut" d="M116 73h18m-9-9v18"/></svg>;
    case "photo":
      return <svg {...common}><path className="role-art-fill" d="M28 48h124v70H28z"/><path className="role-art-accent" d="M55 35h40l10 13H45z"/><circle className="role-art-soft" cx="91" cy="83" r="25"/><circle className="role-art-accent" cx="91" cy="83" r="12"/><circle className="role-art-cut-fill" cx="133" cy="63" r="6"/></svg>;
    case "video":
      return <svg {...common}><path className="role-art-fill" d="M27 48h91v62H27z"/><path className="role-art-accent" d="m118 64 35-17v64l-35-17z"/><circle className="role-art-soft" cx="49" cy="35" r="18"/><circle className="role-art-soft" cx="90" cy="35" r="18"/><path className="role-art-line" d="M72 110v17m-24 0h48"/></svg>;
    case "brand":
      return <svg {...common}><path className="role-art-accent" d="m28 65 52-37 74 15-37 74-74-15z"/><circle className="role-art-cut-fill" cx="126" cy="55" r="7"/><path className="role-art-cut" d="M57 73h52M63 88h35"/><path className="role-art-soft" d="M80 28 54 14l-9 17"/></svg>;
    case "edit":
      return <svg {...common}><rect className="role-art-fill" x="25" y="31" width="130" height="78" rx="5"/><path className="role-art-accent" d="m43 51 24 15-24 15zm47 0 24 15-24 15z"/><path className="role-art-line" d="M39 95h102M61 88v14m55-14v14"/><path className="role-art-soft" d="m126 18 12 12-51 51-18 4 4-18z"/></svg>;
    case "motion":
      return <svg {...common}><path className="role-art-fill" d="M26 34h128v76H26z"/><circle className="role-art-accent" cx="54" cy="72" r="15"/><rect className="role-art-soft" x="84" y="56" width="31" height="31"/><path className="role-art-accent" d="m132 50 17 22-17 22-17-22z"/><path className="role-art-line" d="M54 45v-15m78 13V28M54 99v15m78-13v15M40 72H22m145 0h-18"/></svg>;
    case "sewing":
      return <svg {...common}><path className="role-art-fill" d="M30 35h120v72H30z"/><path className="role-art-line role-art-line--wide" d="M43 35v88m94-88v88M25 123h31m68 0h31M43 48h94M43 95h94"/><path className="role-art-soft" d="M55 48h70v47H55z"/><path className="role-art-line" d="M59 53v37m10-37v37m10-37v37m10-37v37m10-37v37m10-37v37m10-37v37M55 60h70M55 72h70M55 84h70"/><path className="role-art-accent" d="m55 58 70 27v10H55z"/><circle className="role-art-fill" cx="90" cy="24" r="13"/><path className="role-art-line" d="M90 37v11"/></svg>;
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
    <main className="roles-page main-width" aria-labelledby="roles-title">
      <header className="roles-hero">
        <p className="roles-eyebrow">В MEGABATTLE НЕТ ЛИШНИХ ЛЮДЕЙ</p>
        <h1 id="roles-title">РОЛИ</h1>
        <p className="roles-intro">
          Один проект — десятки способов быть внутри. Наводи на предметы,
          исследуй их и находи своё место в большой команде.
        </p>
      </header>

      <section className="roles-universe" aria-label="Роли в проекте">
        <div className="roles-universe__count" aria-hidden="true">
          <strong>{roleItems.length}</strong>
          <span>точки входа</span>
        </div>
        <p className="roles-universe__whisper roles-universe__whisper--one" aria-hidden="true">
          СЦЕНА / МЕДИА / ТЕХНИКА / МОДА / СПОРТ
        </p>
        <p className="roles-universe__whisper roles-universe__whisper--two" aria-hidden="true">
          ВЫБИРАЙ НЕ ДОЛЖНОСТЬ — ВЫБИРАЙ, ЧТО ХОЧЕТСЯ СОЗДАТЬ
        </p>

        <div className="roles-scatter">
          {roleItems.map((role, index) => {
            const [span, row, rotation, shift] = scatterPattern[index % scatterPattern.length];
            return (
            <button
              className={`role-object role-object--${role.type}`}
              type="button"
              key={role.id}
              aria-label={`${role.name}. ${role.description}`}
              style={{
                "--span": span,
                "--row": row,
                "--r": `${rotation}deg`,
                "--shift": `${shift}%`,
                "--delay": `${(index % 9) * -0.37}s`,
              }}
            >
              <span className="role-object__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="role-object__art" aria-hidden="true">
                <Art type={role.type} />
              </span>
              <span className="role-object__label">
                <strong>{role.name}</strong>
                <small>{role.description}</small>
              </span>
            </button>
            );
          })}
        </div>
      </section>

      <aside className="roles-note">
        <span>Не нашёл точное название?</span>
        <p>В Megabattle роли появляются вместе с идеями. Можно прийти со своим навыком и придумать новую.</p>
      </aside>
    </main>
  );
}

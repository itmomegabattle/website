import "./faculty-logo.css";

// Логотипы лежат в public и подобраны под тему: файл *_light — для тёмной
// темы, *_dark — для светлой. Одиночные версии показываются как есть.
const LOGOS = {
  ktu: {
    onDark: "/images/faculties/logos/KTU_light.svg",
    onLight: "/images/faculties/logos/KTU_dark.svg",
  },
  ftmi: {
    onDark: "/images/faculties/logos/FTMI_light.svg",
    onLight: "/images/faculties/logos/FTMI_dark.svg",
  },
  nozh: {
    onDark: "/images/faculties/logos/NOZH_light.png",
    onLight: "/images/faculties/logos/NOZH_dark.png",
  },
  tint: { any: "/images/faculties/logos/TINT.svg" },
  ftmf: { any: "/images/faculties/logos/FTMF.svg" },
};

export default function FacultyLogo({ faculty }) {
  const logo = LOGOS[faculty.id];
  if (!logo) return null;

  const alt = `Логотип ${faculty.name}`;

  if (logo.any) {
    return <img className="faculty-logo" src={logo.any} alt={alt} />;
  }

  return (
    <>
      <img className="faculty-logo faculty-logo--on-dark" src={logo.onDark} alt={alt} />
      <img className="faculty-logo faculty-logo--on-light" src={logo.onLight} alt={alt} />
    </>
  );
}

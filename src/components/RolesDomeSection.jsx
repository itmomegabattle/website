import { useMemo } from "react";
import { roleItems } from "./roles/roleData";
import DomeGallery from "./DomeGallery";
import RoleIcon from "./roles/RoleIcon";

export default function RolesDomeSection() {
  const domeRoles = useMemo(() => roleItems.map((role) => ({
    ...role,
    src: role.type,
    alt: `${role.name}. ${role.description}`,
    role: role.description,
  })), []);

  return (
    <section id="roles" className="participants-roles" aria-labelledby="participants-roles-title">
      <header className="participants-roles__heading">
        <p className="eyebrow">Точки входа</p>
        <h2 id="participants-roles-title">РОЛИ</h2>
        <p>
          Один проект — десятки способов быть внутри. Вращай купол и выбирай,
          что тебе хочется создавать.
        </p>
      </header>

      <DomeGallery
        images={domeRoles}
        className="roles-dome"
        fit={0.82}
        minRadius={560}
        maxRadius={980}
        maxVerticalRotationDeg={0}
        dragSensitivity={20}
        segments={30}
        dragDampening={0.8}
        imageBorderRadius="18px"
        idleLabel={`${roleItems.length} ролей`}
        idleDescription="Наведи или нажми на иконку"
        onItemSelect={() => undefined}
        renderItem={(role) => (
          <span className="roles-dome__tile" aria-hidden="true">
            <span className="roles-dome__icon"><RoleIcon type={role.type} /></span>
            <strong>{role.name}</strong>
          </span>
        )}
      />
    </section>
  );
}

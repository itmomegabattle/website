import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Api } from "../api";
import "../styles/member-list.css";
import ExternalLink from "./ExternalLink";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import {
  deleteTeamMember,
  getAdminTeamMembers,
  importStaticTeamMembers,
  uploadTeamMemberImage,
  upsertTeamMember,
} from "../services/teamService";

const emptyMember = {
  section: "organizers",
  status: "published",
  source_key: "",
  name: "",
  activity: "",
  role: "",
  description: "",
  links: [],
  small_image_url: "",
  big_image_url: "",
  sort_order: 100,
};

function linksToText(links = []) {
  return links.map((item) => `${item.text || ""} | ${item.link || ""}`).join("\n");
}

function textToLinks(value) {
  return value
    .split("\n")
    .map((row) => {
      const [text, link] = row.split("|").map((part) => part?.trim());
      if (!text && !link) return null;
      return { text: text || link, link: link || text };
    })
    .filter(Boolean);
}

function TeamAdminEditor({ section, fallbackMembers }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState(() => ({ ...emptyMember, section }));
  const [linksText, setLinksText] = useState("");
  const [status, setStatus] = useState("");

  const queryKey = ["admin-team-members", section];
  const { data = [], error } = useQuery({
    queryKey,
    queryFn: () => getAdminTeamMembers(section),
    enabled: isOpen,
  });

  const refreshPublicLists = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["organizers"] }),
    queryClient.invalidateQueries({ queryKey: ["responsible"] }),
    queryClient.invalidateQueries({ queryKey }),
  ]);

  const saveMutation = useMutation({
    mutationFn: (payload) => upsertTeamMember(payload, profile),
    onSuccess: () => {
      setStatus("Сохранено");
      setSelectedMember(null);
      setForm({ ...emptyMember, section });
      setLinksText("");
      refreshPublicLists();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTeamMember(id, profile),
    onSuccess: async (_, deletedId) => {
      if (selectedMember?.id === deletedId) setSelectedMember(null);
      setStatus("Человек удалён");
      await refreshPublicLists();
    },
  });

  const importMutation = useMutation({
    mutationFn: () => importStaticTeamMembers(section, fallbackMembers, profile),
    onSuccess: (items) => {
      setStatus(`Импортировано: ${items.length}`);
      refreshPublicLists();
    },
  });

  useEffect(() => {
    if (!selectedMember) {
      setForm({ ...emptyMember, section });
      setLinksText("");
      return;
    }

    setForm({
      ...emptyMember,
      ...selectedMember,
      section,
      links: selectedMember.links || [],
    });
    setLinksText(linksToText(selectedMember.links));
  }, [selectedMember, section]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImage = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем фото…");
    const imageUrl = await uploadTeamMemberImage(file);
    setForm((current) => ({ ...current, [field]: imageUrl }));
    setStatus("Фото загружено");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...form,
      section,
      source_key: form.source_key || `${section}-${Date.now()}`,
      links: textToLinks(linksText),
    });
  };

  const requestDelete = (member) => {
    if (!window.confirm(`Удалить «${member.name}» из раздела? Это действие нельзя отменить.`)) return;
    setStatus("");
    deleteMutation.mutate(member.id);
  };

  return (
    <div className="team-admin">
      <button className="team-admin-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть редактор" : "Режим редактора"}
      </button>

      {isOpen && (
        <div className="team-admin-panel">
          <div className="team-admin-head">
            <div>
              <p className="card-kicker">Inline admin</p>
              <h2>{section === "organizers" ? "Организаторы" : "Ответственные"}</h2>
            </div>
            <button type="button" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Импортируем…" : "Импортировать JSON"}
            </button>
          </div>

          <div className="team-admin-grid">
            <form className="team-admin-form" onSubmit={handleSubmit}>
              <div className="team-admin-form-grid">
                <label className="form-field">
                  <span>Имя</span>
                  <input name="name" value={form.name} onChange={updateField} required />
                </label>
                <label className="form-field">
                  <span>Статус</span>
                  <select name="status" value={form.status} onChange={updateField}>
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликовано</option>
                    <option value="archived">Архив</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Короткая роль</span>
                  <input name="activity" value={form.activity || ""} onChange={updateField} />
                </label>
                <label className="form-field">
                  <span>Роль в карточке</span>
                  <input name="role" value={form.role || ""} onChange={updateField} />
                </label>
              </div>

              <label className="form-field">
                <span>Описание</span>
                <textarea name="description" value={form.description || ""} onChange={updateField} rows="4" />
              </label>

              <label className="form-field">
                <span>Ссылки: текст | ссылка</span>
                <textarea value={linksText} onChange={(event) => setLinksText(event.target.value)} rows="3" />
              </label>

              <div className="team-admin-form-grid">
                <label className="form-field">
                  <span>Маленькое фото</span>
                  <input type="file" accept="image/*" onChange={(event) => handleImage(event, "small_image_url")} />
                </label>
                <label className="form-field">
                  <span>Большое фото</span>
                  <input type="file" accept="image/*" onChange={(event) => handleImage(event, "big_image_url")} />
                </label>
              </div>

              {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
              {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
              {error && <p className="form-error">{error.message}</p>}
              {status && <p className="form-status">{status}</p>}

              <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Сохраняем…" : selectedMember ? "Сохранить изменения" : "Добавить человека"}
              </button>
            </form>

            <div className="team-admin-list">
              {data.map((member) => (
                <div className="team-admin-row" key={member.id}>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.status} · {member.activity || "роль не указана"}</span>
                  </div>
                  <div>
                    <button type="button" onClick={() => setSelectedMember(member)}>Изменить</button>
                    <button type="button" onClick={() => requestDelete(member)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending && deleteMutation.variables === member.id ? "Удаляем…" : "Удалить"}
                    </button>
                  </div>
                </div>
              ))}
              {!data.length && <p>В БД пока пусто. Нажми “Импортировать JSON”, чтобы перенести текущий список.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberListInternal({ members }) {
  const [activeMember, setActiveMember] = useState(null);

  useEffect(() => {
    setActiveMember(null);
  }, [members]);

  useEffect(() => {
    if (!activeMember) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveMember(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMember]);

  return (
    <>
      <div className="people-roster">
        {members.map((member, index) => (
          <button
            key={member.key ?? `${member.name}-${member.activity}`}
            className={`people-person-card people-person-card--${(index % 7) + 1}`}
            type="button"
            onClick={() => setActiveMember(member)}
            style={{
              "--person-index": String(index + 1).padStart(2, "0"),
              "--person-tilt": `${((index * 11) % 5 - 2) * 0.22}deg`,
              "--person-shift": `${[0, 1.7, 0.55, 2.25, 0.9][index % 5]}rem`,
            }}
          >
            <span className="people-person-card__media">
              <img
                src={Api.normalizeURL(member.bigImage || member.smallImage || "/images/people/member-full.jpg")}
                alt={member.name}
                width="900"
                height="1200"
                loading="lazy"
              />
            </span>
            <span className="people-person-card__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="people-person-card__copy">
              <small>{member.activity || "Команда Megabattle"}</small>
              <strong>{member.name}</strong>
              <em>Открыть профиль ↗</em>
            </span>
          </button>
        ))}
      </div>

      {activeMember && (
        <div
          className="people-member-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveMember(null);
          }}
        >
          <article className="people-member-modal" role="dialog" aria-modal="true" aria-label={activeMember.name}>
            <button
              className="people-member-modal__close"
              type="button"
              aria-label="Закрыть"
              onClick={() => setActiveMember(null)}
            >
              ×
            </button>
            <div className="people-member-modal__image">
              <img
                src={Api.normalizeURL(activeMember.bigImage || activeMember.smallImage || "/images/people/member-full.jpg")}
                alt={activeMember.name}
                width="1000"
                height="1200"
              />
            </div>
            <div className="people-member-modal__copy">
              <p className="people-member-modal__kicker">{activeMember.activity || "Команда Megabattle"}</p>
              <h3>{activeMember.name}</h3>
              {activeMember.role && <p className="people-member-modal__role">{activeMember.role}</p>}
              {activeMember.description && (
                <p className="people-member-modal__description">{activeMember.description}</p>
              )}
              {activeMember.links?.length > 0 && (
                <div className="people-member-modal__links">
                  {activeMember.links.map((item, i) => (
                    <ExternalLink key={i} href={item.link} text={item.text} />
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}

export default function MemberList() {
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState("organizers");
  const canEdit = isAdminProfile(profile);

  // получить данные с API (или из кэша)
  const organizers = useQuery({
    queryKey: ["organizers"],
    queryFn: Api.getOrganizers,
    initialData: [],
  }).data;

  const responsible = useQuery({
    queryKey: ["responsible"],
    queryFn: Api.getResponsible,
    initialData: [],
  }).data;

  return (
    <>
      <div className="team-filters">
        <div
          className="team-toggle"
          data-filter={activeFilter}
        >
          <div className="toggle-slider" />
          <button
            className={`toggle-btn${activeFilter === "organizers" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveFilter("organizers")}
          >
            Организаторы
          </button>
          <button
            className={`toggle-btn${activeFilter === "responsible" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveFilter("responsible")}
          >
            Ответственные
          </button>
        </div>
      </div>

      {canEdit && (
        <TeamAdminEditor
          section={activeFilter}
          fallbackMembers={activeFilter === "organizers" ? organizers : responsible}
        />
      )}
      <MemberListInternal members={activeFilter === "organizers" ? organizers : responsible} />
    </>
  );
}

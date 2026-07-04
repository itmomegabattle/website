import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Api } from "../api";
import "../styles/member-list.css";
import VisibleScroll from "./VisibleScroll";
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

  const refreshPublicLists = () => {
    queryClient.invalidateQueries({ queryKey: ["organizers"] });
    queryClient.invalidateQueries({ queryKey: ["responsible"] });
    queryClient.invalidateQueries({ queryKey });
  };

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
    onSuccess: refreshPublicLists,
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
                    <button type="button" onClick={() => deleteMutation.mutate(member.id)}>Удалить</button>
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

function MemberListInternal({ members, autoScroll = false }) {
  const [activeMember, setActiveMember] = useState(null);

  // колбэк на выбор нового просматриваемого участника
  const handleMemberClick = (member) => {
    if (activeMember === member) {
      setActiveMember(null);
      return;
    }
    setActiveMember(member);
  };

  useEffect(() => {
    setActiveMember(members[0] || null);
  }, [members]);

  return (
    <>
      <VisibleScroll autoScroll={autoScroll} showArrows={!autoScroll}>
        {members.map((member) => {
          const isActive = activeMember === member;
          return (
            <div
              key={member.key ?? `${member.name}-${member.activity}`}
              className={`team-member${isActive ? " active" : ""}`}
              onClick={() => handleMemberClick(member)}
            >
              <div className="member-image">
                <img
                  src={Api.normalizeURL(member.smallImage)}
                  alt={member.name}
                />
              </div>
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.activity}</p>
            </div>
          );
        })}
      </VisibleScroll>

      <div className="main-width">
        {activeMember && (
          <div className="member-info-expanded">
            <div className="member-expanded-image">
              <img
                src={Api.normalizeURL(activeMember.bigImage)}
                alt={activeMember.name}
              />
            </div>
            <div className="member-expanded-info">
              <h3>{activeMember.name}</h3>
              <p>
                <span className="member-expanded-role">
                  {activeMember.role}
                </span>
              </p>
              <p className="member-expanded-description">
                {activeMember.description}
              </p>
              {activeMember.links?.length > 0 && (
                <div className="member-expanded-links">
                  {activeMember.links.map((item, i) => (
                    <ExternalLink key={i} href={item.link} text={item.text} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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

      <div hidden={activeFilter !== "organizers"}>
        {canEdit && <TeamAdminEditor section="organizers" fallbackMembers={organizers} />}
        <MemberListInternal members={organizers} autoScroll />
      </div>

      {/* todo: У нас на экране по ширине помещается примерно 4 человека,
      то есть последний пятый мегаответственный - ЛОХ так как почти всегда будет
      за границей экрана  */}
      <div hidden={activeFilter !== "responsible"}>
        {canEdit && <TeamAdminEditor section="responsible" fallbackMembers={responsible} />}
        <MemberListInternal members={responsible} />
      </div>
    </>
  );
}

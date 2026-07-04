import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import {
  deletePartner,
  getAdminPartners,
  importStaticPartners,
  uploadContentImage,
  upsertPartner,
} from "../services/contentService";
import "../styles/partners-bento.css";

const emptyPartner = {
  status: "published",
  source_key: "",
  name: "",
  description: "",
  logo_url: "",
  link: "",
  sort_order: 100,
};

function uniquePartners(partners) {
  return Array.from(
    new Map(partners.map((partner) => [partner.sourceKey || partner.partnerKey || partner.link || partner.name, partner])).values(),
  );
}

function PartnerEditor({ fallbackPartners }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [form, setForm] = useState(emptyPartner);
  const [status, setStatus] = useState("");

  const { data = [], error } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: getAdminPartners,
    enabled: isOpen,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["partners"] });
    queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => upsertPartner(payload, profile),
    onSuccess: () => {
      setStatus("Партнёр сохранён");
      setSelectedPartner(null);
      setForm(emptyPartner);
      refresh();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (id) => deletePartner(id, profile), onSuccess: refresh });
  const importMutation = useMutation({
    mutationFn: () => importStaticPartners(fallbackPartners, profile),
    onSuccess: (items) => {
      setStatus(`Импортировано партнёров: ${items.length}`);
      refresh();
    },
  });

  useEffect(() => {
    setForm(selectedPartner ? { ...emptyPartner, ...selectedPartner } : emptyPartner);
  }, [selectedPartner]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем логотип…");
    const imageUrl = await uploadContentImage(file, "partners");
    setForm((current) => ({ ...current, logo_url: imageUrl }));
    setStatus("Логотип загружен");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate({ ...form, source_key: form.source_key || `${form.name}-${Date.now()}` });
  };

  return (
    <div className="partners-admin">
      <button className="partners-admin-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть редактор партнёров" : "Редактировать партнёров"}
      </button>
      {isOpen && (
        <div className="partners-admin-panel">
          <div className="partners-admin-head">
            <div>
              <p className="card-kicker">Inline admin</p>
              <h2>Партнёры</h2>
            </div>
            <button type="button" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Импортируем…" : "Импортировать JSON"}
            </button>
          </div>

          <div className="partners-admin-grid">
            <form className="partners-admin-form" onSubmit={handleSubmit}>
              <div className="partners-admin-form-grid">
                <label className="form-field"><span>Название</span><input name="name" value={form.name} onChange={updateField} required /></label>
                <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="published">Опубликовано</option><option value="archived">Архив</option></select></label>
              </div>
              <label className="form-field"><span>Описание</span><textarea name="description" value={form.description || ""} onChange={updateField} rows="3" /></label>
              <label className="form-field"><span>Ссылка</span><input name="link" value={form.link || ""} onChange={updateField} /></label>
              <div className="partners-admin-form-grid">
                <label className="form-field"><span>Логотип</span><input type="file" accept="image/*" onChange={handleImage} /></label>
              </div>
              {error && <p className="form-error">{error.message}</p>}
              {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
              {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
              {status && <p className="form-status">{status}</p>}
              <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Сохраняем…" : selectedPartner ? "Сохранить изменения" : "Добавить партнёра"}
              </button>
            </form>

            <div className="partners-admin-list">
              {data.map((partner) => (
                <div className="partners-admin-row" key={partner.id}>
                  <div>
                    <strong>{partner.name}</strong>
                    <span>{partner.status} · {partner.description || "без описания"}</span>
                  </div>
                  <div>
                    <button type="button" onClick={() => setSelectedPartner(partner)}>Изменить</button>
                    <button type="button" onClick={() => deleteMutation.mutate(partner.id)}>Удалить</button>
                  </div>
                </div>
              ))}
              {!data.length && <p>В БД пока пусто. Нажми “Импортировать JSON”, чтобы перенести текущих партнёров.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnersBento() {
  const { profile } = useAuth();
  const canEdit = isAdminProfile(profile);
  const partners = useQuery({ queryKey: ["partners"], queryFn: Api.getPartners, initialData: [] }).data;
  const visiblePartners = useMemo(() => uniquePartners(partners), [partners]);

  return (
    <div className="partners-bento-section">
      {canEdit && <PartnerEditor fallbackPartners={partners} />}
      <div className="partners-bento">
        {visiblePartners.map((partner, index) => (
          <a
            key={partner.id || partner.sourceKey || partner.partnerKey || `${partner.name}-${index}`}
            className={`partner-bento-card partner-bento-card--${index % 5}`}
            href={partner.link || undefined}
            target={partner.link ? "_blank" : undefined}
            rel={partner.link ? "noreferrer" : undefined}
            aria-label={partner.name}
          >
            <div className="partner-bento-logo">
              <img src={Api.normalizeURL(partner.logo)} alt={partner.name} />
            </div>
            <div className="partner-bento-info">
              <p className="card-kicker">Партнёр</p>
              <h3>{partner.name}</h3>
              <p>{partner.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

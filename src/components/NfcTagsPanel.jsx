import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getProfileTags } from "../services/profileService";

export default function NfcTagsPanel({ profileId }) {
  const tags = useQuery({
    queryKey: ["profile-tags", profileId],
    queryFn: () => getProfileTags(profileId),
    enabled: Boolean(profileId),
    initialData: [],
  }).data;

  return (
    <article className="info-card nfc-tags-panel">
      <p className="card-kicker">NFC-метки</p>
      <h2>Привязанные носители</h2>
      <p>
        К одному профилю можно привязать брелок, карту, ремувку, стикер и другие
        носители.
      </p>

      {tags.length > 0 ? (
        <div className="nfc-tag-list">
          {tags.map((tag) => (
            <Link className="nfc-tag-item" to={`/nfc/${tag.code}`} key={tag.id}>
              <strong>{tag.label || tag.code}</strong>
              <span>{tag.tag_type || "other"}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="form-status">
          Пока нет привязанных меток. Открой `/nfc/любой-код`, чтобы привязать
          первую тестовую метку.
        </p>
      )}
    </article>
  );
}

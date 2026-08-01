import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import { deleteAdminEvent, getAdminEvents, isAdminProfile } from "../services/adminService";
import EventCard from "./EventCard";
import { eventGroups, getEventSortTime } from "./events/eventConfig";
import InlineEventEditor from "./events/InlineEventEditor";

export default function EventSections() {
  const { profile } = useAuth();
  const canEdit = isAdminProfile(profile);
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState("megabattle");
  const [adminStatus, setAdminStatus] = useState("");
  const events = useQuery({ queryKey: ["events"], queryFn: Api.getEvents, placeholderData: [] }).data;
  const { data: adminEvents = [] } = useQuery({ queryKey: ["admin-events-inline"], queryFn: getAdminEvents, enabled: canEdit });
  const deleteMutation = useMutation({
    mutationFn: (eventId) => deleteAdminEvent(eventId, profile),
    onSuccess: async (_result, deletedId) => {
      if (editor?.event?.id === deletedId) setEditor(null);
      setAdminStatus("Мероприятие удалено");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-events-inline"] }),
      ]);
    },
  });
  const requestDelete = (event) => {
    if (!window.confirm(`Удалить мероприятие «${event.name}»? Связанные регистрации также будут удалены.`)) return;
    setAdminStatus("");
    deleteMutation.mutate(event.id);
  };

  const activeGroup = eventGroups.find((group) => group.id === activeGroupId) || eventGroups[0];
  const isHiddenGame = (event) => /^(game|megagame|мегагейм)$/i.test(String(event.slug || event.id || event.name || "").trim());
  const groupEvents = events
    .filter((event) => event.group === activeGroup.id && !isHiddenGame(event))
    .sort((a, b) => getEventSortTime(a) - getEventSortTime(b));
  const groupAdminEvents = adminEvents.filter((event) => event.group_key === activeGroup.id && !isHiddenGame(event));

  const openEditor = (event = null) => {
    setAdminStatus("");
    setEditor({ groupId: activeGroup.id, event });
  };

  return (
    <section className="main-width events-section events-hub" id="events">
      <h1>МЕРОПРИЯТИЯ</h1>
      <div className="event-group-tabs" role="tablist" aria-label="Тип мероприятий">
        {eventGroups.map((group) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeGroup.id === group.id}
            className={activeGroup.id === group.id ? "is-active" : ""}
            key={group.id}
            onClick={() => {
              setActiveGroupId(group.id);
              setEditor(null);
              setAdminStatus("");
            }}
          >
            {group.title}
          </button>
        ))}
      </div>

      {canEdit && (
        <div className="event-admin-strip">
          <button type="button" onClick={() => openEditor()}>Добавить мероприятие</button>
          {deleteMutation.error && <span className="event-admin-error">{deleteMutation.error.message}</span>}
          {adminStatus && <span className="event-admin-status">{adminStatus}</span>}
          {groupAdminEvents.map((event) => (
            <span className="event-admin-chip" key={event.id}>
              {event.name} · {event.status}
              <button type="button" onClick={() => openEditor(event)}>изменить</button>
              <button className="event-admin-delete" type="button" onClick={() => requestDelete(event)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && deleteMutation.variables === event.id ? "удаляем…" : "удалить"}
              </button>
            </span>
          ))}
        </div>
      )}

      {editor && (
        <InlineEventEditor
          key={editor.event?.id || `new-${editor.groupId}`}
          groupId={editor.groupId}
          selectedEvent={editor.event}
          onClose={() => setEditor(null)}
        />
      )}

      <div className="event-showcase-list" role="tabpanel">
        {groupEvents.map((event) => <EventCard event={event} key={event.id} />)}
        {groupEvents.length === 0 && <p className="event-group-empty">События этой категории скоро появятся.</p>}
      </div>
    </section>
  );
}

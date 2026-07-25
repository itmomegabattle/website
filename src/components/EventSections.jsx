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

  return eventGroups.map((group) => {
    const groupEvents = events.filter((event) => event.group === group.id).sort((a, b) => getEventSortTime(a) - getEventSortTime(b));
    const groupAdminEvents = adminEvents.filter((event) => event.group_key === group.id);
    return (
      <section className="main-width events-section" id={`events-${group.id}`} key={group.id}>
        <h1>{group.title}</h1>
        {canEdit && (
          <div className="event-admin-strip">
            <button type="button" onClick={() => setEditor({ groupId: group.id, event: null })}>Добавить мероприятие</button>
            {deleteMutation.error && <span className="event-admin-error">{deleteMutation.error.message}</span>}
            {adminStatus && <span className="event-admin-status">{adminStatus}</span>}
            {groupAdminEvents.map((event) => (
              <span className="event-admin-chip" key={event.id}>
                {event.name} · {event.status}
                <button type="button" onClick={() => setEditor({ groupId: group.id, event })}>изменить</button>
                <button className="event-admin-delete" type="button" onClick={() => requestDelete(event)} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending && deleteMutation.variables === event.id ? "удаляем…" : "удалить"}
                </button>
              </span>
            ))}
          </div>
        )}
        {editor?.groupId === group.id && <InlineEventEditor groupId={group.id} selectedEvent={editor.event} onClose={() => setEditor(null)} />}
        <div className="event-showcase-list">{groupEvents.map((event) => <EventCard event={event} key={event.id} />)}</div>
      </section>
    );
  });
}

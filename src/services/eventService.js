import { Api } from "../api";

export async function getPublishedEvents() {
  return Api.getStaticEvents();
}

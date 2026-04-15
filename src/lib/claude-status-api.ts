export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved"
  | "postmortem";

export type Incident = {
  id: string;
  name: string;
  shortlink: string;
  status: IncidentStatus;
  startedAt: Date;
};

type RawIncident = {
  id: string;
  name: string;
  shortlink: string;
  status: IncidentStatus;
  started_at: string;
};

type RawIncidentsResponse = {
  incidents: RawIncident[];
};

export class ClaudeStatusAPI {
  private static readonly url =
    "https://status.claude.com/api/v2/incidents.json";

  async latestIncident(): Promise<Incident | null> {
    const response = await fetch(ClaudeStatusAPI.url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Claude status: ${response.status} ${response.statusText}`,
      );
    }

    const data: RawIncidentsResponse = await response.json();
    const raw = data.incidents[0];
    if (!raw) return null;

    return {
      id: raw.id,
      name: raw.name,
      shortlink: raw.shortlink,
      status: raw.status,
      startedAt: new Date(raw.started_at),
    };
  }
}

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
};

type IncidentsResponse = {
  incidents: Incident[];
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

    const data: IncidentsResponse = await response.json();
    return data.incidents[0] ?? null;
  }
}

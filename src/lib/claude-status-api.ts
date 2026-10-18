import { z } from "zod";

const incidentStatusSchema = z.enum([
  "investigating",
  "identified",
  "monitoring",
  "resolved",
  "postmortem",
]);

export type IncidentStatus = z.infer<typeof incidentStatusSchema>;

export type Incident = {
  id: string;
  name: string;
  shortlink: string;
  status: IncidentStatus;
  startedAt: Date;
};

const incidentsResponseSchema = z.object({
  incidents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    shortlink: z.string(),
    status: incidentStatusSchema,
    started_at: z.string(),
  })),
});

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

    const data = incidentsResponseSchema.parse(await response.json());
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

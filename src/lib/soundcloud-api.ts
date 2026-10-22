import { z } from "zod";

const soundCloudTrackSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    permalink: z.string(),
    permalink_url: z.string(),
  })
  .passthrough();

export type SoundCloudTrack = z.infer<typeof soundCloudTrackSchema>;

const soundCloudResponseSchema = z.object({
  collection: z.array(soundCloudTrackSchema),
});

export class SoundCloudAPI {
  private readonly baseUrl = "https://api-v2.soundcloud.com";

  constructor(
    private readonly userId: string,
    private readonly clientId: string,
  ) {}

  async fetchTracks(): Promise<SoundCloudTrack[]> {
    const url = `${this.baseUrl}/users/${this.userId}/tracks?limit=9999&client_id=${this.clientId}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Failed to fetch SoundCloud tracks: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = soundCloudResponseSchema.parse(await response.json());
    return data.collection;
  }
}

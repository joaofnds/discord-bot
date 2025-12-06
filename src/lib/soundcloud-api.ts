export interface SoundCloudTrack {
  id: number;
  title: string;
  permalink: string;
  permalink_url: string;
}

interface SoundCloudResponse {
  collection: SoundCloudTrack[];
}

export class SoundCloudAPI {
  private readonly baseUrl = "https://api-v2.soundcloud.com";

  constructor(
    private readonly userId: string,
    private readonly clientId: string,
  ) {}

  async fetchTracks(): Promise<SoundCloudTrack[]> {
    const url =
      `${this.baseUrl}/users/${this.userId}/tracks?limit=9999&client_id=${this.clientId}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Failed to fetch SoundCloud tracks: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data: SoundCloudResponse = await response.json();
    return data.collection;
  }
}

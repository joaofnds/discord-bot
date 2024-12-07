export interface Bot {
  send(content: string): Promise<void>;
}

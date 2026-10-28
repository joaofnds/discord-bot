export interface SpeechGenerator {
  generate(text: string, voiceId: string): Promise<Uint8Array>;
}

export interface DownloadOptions {
  timeout?: number;
  maxFileSize?: number;
}

export type DownloadResult =
  | { ok: true; filePath: string; fileName: string; fileSize: number }
  | { ok: false; error: string };

type Executor = (
  args: string[],
) => Promise<{ code: number; stdout: string; stderr: string }>;

export async function downloadTrack(
  url: string,
  options: DownloadOptions = {},
  executor?: Executor,
): Promise<DownloadResult> {
  const timeout = options.timeout ?? 30_000;
  const tempDir = await Deno.makeTempDir({ prefix: "soundcloud_" });
  const outputPath = `${tempDir}/%(title)s.%(ext)s`;
  const args = [
    "yt-dlp",
    "-x",
    "--audio-format",
    "mp3",
    "--no-playlist",
    "-o",
    outputPath,
    url,
  ];

  const defaultExecutor: Executor = async (commandArgs: string[]) => {
    const cmd = new Deno.Command(commandArgs[0], {
      args: commandArgs.slice(1),
      signal: AbortSignal.timeout(timeout),
      stdout: "piped",
      stderr: "piped",
    });
    const output = await cmd.output();
    return {
      code: output.code,
      stdout: new TextDecoder().decode(output.stdout),
      stderr: new TextDecoder().decode(output.stderr),
    };
  };

  const selectedExecutor = executor ?? defaultExecutor;

  try {
    const { code, stdout, stderr } = await selectedExecutor(args);
    if (code !== 0) {
      await Deno.remove(tempDir, { recursive: true }).catch(() => {});
      return {
        ok: false,
        error: stderr || stdout || `yt-dlp failed (${code})`,
      };
    }

    let fileName: string | undefined;
    for await (const entry of Deno.readDir(tempDir)) {
      if (entry.isFile && entry.name.endsWith(".mp3")) {
        fileName = entry.name;
        break;
      }
    }

    if (!fileName) {
      await Deno.remove(tempDir, { recursive: true }).catch(() => {});
      return { ok: false, error: "No mp3 file found" };
    }

    const filePath = `${tempDir}/${fileName}`;
    const fileStat = await Deno.stat(filePath);
    const fileSize = fileStat.size;

    if (options.maxFileSize !== undefined && fileSize > options.maxFileSize) {
      await cleanupDownload(filePath);
      return { ok: false, error: "File exceeds maxFileSize" };
    }

    return { ok: true, filePath, fileName, fileSize };
  } catch (error) {
    await Deno.remove(tempDir, { recursive: true }).catch(() => {});
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

export async function cleanupDownload(filePath: string): Promise<void> {
  const lastSlashIndex = filePath.lastIndexOf("/");
  const parentDir = lastSlashIndex > -1
    ? filePath.slice(0, lastSlashIndex)
    : "";
  await Deno.remove(filePath).catch(() => {});
  if (parentDir) {
    await Deno.remove(parentDir).catch(() => {});
  }
}

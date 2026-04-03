import { cleanupDownload, downloadTrack } from "./soundcloud-downloader.ts";

const deno = (globalThis as unknown as { Deno: any }).Deno;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals<T>(actual: T, expected: T, message = "Values are not equal"): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
  }
}

async function assertRejects(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
    throw new Error("Expected promise to reject");
  } catch {
    return;
  }
}

deno.test("returns downloaded file metadata on success", async () => {
  const executor = async (args: string[]) => {
    const outputTemplate = args[args.indexOf("-o") + 1];
    const filePath = outputTemplate.replace("%(title)s.%(ext)s", "test-track.mp3");
    await deno.writeTextFile(filePath, "mp3 data");
    return { code: 0, stdout: "ok", stderr: "" };
  };

  const result = await downloadTrack("https://soundcloud.com/foo/bar", {}, executor);

  assert(result.ok, "Expected successful download");
  if (result.ok) {
    assertEquals(result.fileName, "test-track.mp3");
    assertEquals(result.fileSize, 8);
    await cleanupDownload(result.filePath);
  }
});

deno.test("returns error when executor exits non-zero", async () => {
  const executor = async () => ({
    code: 1,
    stdout: "",
    stderr: "yt-dlp failed",
  });

  const result = await downloadTrack("https://soundcloud.com/foo/bar", {}, executor);

  assertEquals(result, { ok: false, error: "yt-dlp failed" });
});

deno.test("returns error and cleans up when maxFileSize is exceeded", async () => {
  let createdPath = "";
  const executor = async (args: string[]) => {
    const outputTemplate = args[args.indexOf("-o") + 1];
    createdPath = outputTemplate.replace("%(title)s.%(ext)s", "too-large.mp3");
    await deno.writeFile(createdPath, new Uint8Array(32));
    return { code: 0, stdout: "ok", stderr: "" };
  };

  const result = await downloadTrack(
    "https://soundcloud.com/foo/bar",
    { maxFileSize: 8 },
    executor,
  );

  assertEquals(result, { ok: false, error: "File exceeds maxFileSize" });
  const parentDir = createdPath.slice(0, createdPath.lastIndexOf("/"));
  await assertRejects(() => deno.stat(createdPath));
  await assertRejects(() => deno.stat(parentDir));
});

deno.test("returns error when executor throws", async () => {
  const executor = async () => {
    throw new Error("spawn failed");
  };

  const result = await downloadTrack("https://soundcloud.com/foo/bar", {}, executor);

  assertEquals(result, { ok: false, error: "spawn failed" });
});

deno.test("cleanupDownload removes file and parent directory", async () => {
  const tempDir = await deno.makeTempDir({ prefix: "soundcloud_" });
  const filePath = `${tempDir}/track.mp3`;
  await deno.writeTextFile(filePath, "data");

  await cleanupDownload(filePath);

  await assertRejects(() => deno.stat(filePath));
  await assertRejects(() => deno.stat(tempDir));
});

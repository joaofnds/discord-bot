import { assert } from "@std/assert";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { GitHubIssue } from "./github-issue.ts";
import { linkChain } from "./link-chain.ts";

describe(GitHubIssue.name, () => {
  const baseURL = "https://github.com/joaofnds/dotfiles/issues";
  const channelIDs = [new MessageMock("").channel.id, "1"];
  const githubIssue = new GitHubIssue(baseURL, channelIDs);

  const testCases = [
    ["#123", `${baseURL}/123`],
    ["#456", `${baseURL}/456`],
    ["#123 #456", `${baseURL}/123\n${baseURL}/456`],

    ["here's the issues #123 #456", `${baseURL}/123\n${baseURL}/456`],
    ["#123 #456 are the ones", `${baseURL}/123\n${baseURL}/456`],
    ["#123 and #456", `${baseURL}/123\n${baseURL}/456`],
    [
      "you should look at #123, #456, and #789 for reference",
      `${baseURL}/123\n${baseURL}/456\n${baseURL}/789`,
    ],
  ];

  for (const [input, expected] of testCases) {
    it(`for '${input}' replies '${expected}'`, async () => {
      const message = new MessageMock(input);

      await githubIssue.handle(message);

      expect(message.channel.messages).toEqual([expected]);
    });
  }

  for (const channelID in channelIDs) {
    it(`replies to channel ${channelID}`, async () => {
      const message = new MessageMock("#123");
      message.channel.id = channelID;

      await githubIssue.handle(message);

      expect(message.channel.messages).toEqual([`${baseURL}/123`]);
    });
  }

  it("does not call next when channel and message matches", async () => {
    const remember = new RememberWhenCalled();
    const message = new MessageMock("#123");

    await linkChain(githubIssue, remember).handle(message);

    expect(message.channel.messages).toEqual([`${baseURL}/123`]);
    assert(!remember.called);
  });

  it("calls next when channel does not match", async () => {
    const remember = new RememberWhenCalled();
    const message = new MessageMock("#123");
    message.channel.id = "other id";

    await linkChain(githubIssue, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    assert(remember.called);
  });

  it("calls next when message does not match", async () => {
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(githubIssue, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    assert(remember.called);
  });
});

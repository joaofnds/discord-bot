import assert from "node:assert";
import { test } from "node:test";
import { MessageMock } from "../test/message-mock.mjs";
import { RememberWhenCalled } from "../test/remember-when-called.mjs";
import { stupid } from "./emojis.mjs";
import { ReplyStupid } from "./reply-stupid.mjs";
import { linkChain } from "./util.mjs";

test(ReplyStupid.name, async (t) => {
  await t.test("when string is non-stupid", async (t) => {
    await t.test("does not reply", async (t) => {
      const sut = new ReplyStupid();
      const message = new MessageMock("JSON HTTP API");

      await sut.handle(message);

      assert.deepEqual(message.replies, []);
    });

    await t.test("calls next", async (t) => {
      const sut = new ReplyStupid();
      const nextInChain = new RememberWhenCalled();
      const message = new MessageMock("JSON HTTP API");

      await linkChain(sut, nextInChain).handle(message);

      assert.ok(nextInChain.called);
    });
  });

  await t.test("replies when string is stupid", async (t) => {
    const sut = new ReplyStupid();
    const message = new MessageMock("Json Http Api");

    await sut.handle(message);

    assert.deepEqual(message.replies, [`ApI, HtTp, JsOn ${stupid}`]);
  });

  await t.test("ignores non-stupid words", async (t) => {
    const sut = new ReplyStupid();
    const message = new MessageMock("Json HTTP Api");

    await sut.handle(message);

    assert.deepEqual(message.replies, [`ApI, JsOn ${stupid}`]);
  });

  await t.test("stupid words", async (t) => {
    const testCases = [
      ["padrao", "PaDrAo " + stupid],
      ["PADRAO", "PaDrAo " + stupid],

      ["padroes", "PaDrOeS " + stupid],
      ["PADROES", "PaDrOeS " + stupid],

      ["padronização", "PaDrOnIzAcAo " + stupid],
      ["PADRONIZAÇÃO", "PaDrOnIzAcAo " + stupid],

      ["pattern", "PaTtErN " + stupid],
      ["PATTERN", "PaTtErN " + stupid],

      ["firebase", "FiReBaSe " + stupid],
      ["FIREBASE", "FiReBaSe " + stupid],

      ["simples", "SiMpLeS " + stupid],
      ["SIMPLES", "SiMpLeS " + stupid],

      ["Json", "JsOn " + stupid],
      ["Http", "HtTp " + stupid],
      ["Api", "ApI " + stupid],
      ["Dto", "DtO " + stupid],
      ["Url", "UrL " + stupid],
      ["Uuid", "UuId " + stupid],

      ["light mode", "LiGhT MoDe " + stupid],
      ["LIGHT MODE", "LiGhT MoDe " + stupid],

      ["decorator", "DeCoRaToR " + stupid],
      ["DECORATOR", "DeCoRaToR " + stupid],

      ["deadline", "DeAdLiNe " + stupid],
      ["DEADLINE", "DeAdLiNe " + stupid],

      ["legado", "LeGaDo " + stupid],
      ["lEgAdO", "LeGaDo " + stupid],
      ["LEGADO", "LeGaDo " + stupid],

      ["mapear", "MaPeAr " + stupid],
      ["MAPEAR", "MaPeAr " + stupid],
      ["mapeamento", "MaPeAmEnTo " + stupid],
      ["MAPEAMENTO", "MaPeAmEnTo " + stupid],
      ["mapeado", "MaPeAdO " + stupid],
      ["MAPEADO", "MaPeAdO " + stupid],
      ["mapeio", "MaPeIo " + stupid],
      ["MAPEIO", "MaPeIo " + stupid],

      ["Http Dto Api", "ApI, DtO, HtTp " + stupid],
    ];

    for (const [input, expected] of testCases) {
      await t.test(`for '${input}' returns '${expected}'`, async () => {
        const message = new MessageMock(input);

        await new ReplyStupid().handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });

  await t.test("does not reply non-stupid words", async (t) => {
    const testCases = ["simplesmente"];

    for (const input of testCases) {
      await t.test(`for '${input}', does not reply`, async () => {
        const message = new MessageMock(input);

        await new ReplyStupid().handle(message);

        assert(message.replies.length === 0);
      });
    }
  });
});

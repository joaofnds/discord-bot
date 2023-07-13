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
      ["padrao", "PaDrAo"],
      ["PADRAO", "PaDrAo"],

      ["padroes", "PaDrOeS"],
      ["PADROES", "PaDrOeS"],

      ["padronização", "PaDrOnIzAcAo"],
      ["PADRONIZAÇÃO", "PaDrOnIzAcAo"],

      ["pattern", "PaTtErN"],
      ["PATTERN", "PaTtErN"],

      ["firebase", "FiReBaSe"],
      ["FIREBASE", "FiReBaSe"],

      ["simples", "SiMpLeS"],
      ["SIMPLES", "SiMpLeS"],

      ["Json", "JsOn"],
      ["Http", "HtTp"],
      ["Api", "ApI"],
      ["Dto", "DtO"],
      ["Url", "UrL"],
      ["Uuid", "UuId"],

      ["light mode", "LiGhT MoDe"],
      ["LIGHT MODE", "LiGhT MoDe"],

      ["decorator", "DeCoRaToR"],
      ["DECORATOR", "DeCoRaToR"],

      ["deadline", "DeAdLiNe"],
      ["DEADLINE", "DeAdLiNe"],

      ["legado", "LeGaDo"],
      ["lEgAdO", "LeGaDo"],
      ["LEGADO", "LeGaDo"],

      ["seguranca", "SeGuRaNcA"],
      ["SEGURANCA", "SeGuRaNcA"],

      ["mapear", "MaPeAr"],
      ["MAPEAR", "MaPeAr"],
      ["mapeamento", "MaPeAmEnTo"],
      ["MAPEAMENTO", "MaPeAmEnTo"],
      ["mapeado", "MaPeAdO"],
      ["MAPEADO", "MaPeAdO"],
      ["mapeio", "MaPeIo"],
      ["MAPEIO", "MaPeIo"],

      ["Http Dto Api", "ApI, DtO, HtTp"],
    ];

    for (const [input, expected] of testCases) {
      await t.test(`for '${input}' returns '${expected} ${stupid}'`, async () => {
        const message = new MessageMock(input);

        await new ReplyStupid().handle(message);

        assert.deepEqual(message.replies, [`${expected} ${stupid}`]);
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

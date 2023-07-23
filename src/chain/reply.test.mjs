import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { devops, linux, stupid } from "../const.mjs";
import { linkChain } from "./link-chain.mjs";
import { Reply } from "./reply.mjs";

describe(Reply.name, async () => {
  let sut;
  const randomFolk = "chuck tesla!";

  beforeEach(() => {
    sut = new Reply(randomFolk);
  });

  describe("when matches", async () => {
    const testCases = [
      ["bolsonaro", "e o PT hein? e o lula?"],
      ["Bolsonaro", "e o PT hein? e o lula?"],
      ["BOLSONARO", "e o PT hein? e o lula?"],

      ["citando aleatoriamente", randomFolk],
      ["CiTaNdO AlEaToRiAmEnTe", randomFolk],
      ["CITANDO ALEATORIAMENTE", randomFolk],

      ["fulano é devops", devops],
      ["FuLaNo É DeVoPs", devops],
      ["FULANO É DEVOPS", devops],

      ["estão contratando devops", devops],
      ["contrataram DevOps", devops],
      ["contratar dEVoPS", devops],
    ];

    for (const [input, expected] of testCases) {
      it(`for '${input}' returns '${expected}'`, async () => {
        const message = new MessageMock(input);

        await sut.handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });

  describe("stupid responses", async () => {
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

      ["entregar valor", "EnTrEgAr vAlOr"],
      ["eNtReGaR VaLoR", "EnTrEgAr vAlOr"],
      ["ENTREGAR VALOR", "EnTrEgAr vAlOr"],

      ["Http Dto Api", "ApI, DtO, HtTp"],
    ];

    for (const [input, expectedTransformation] of testCases) {
      const expected = `${expectedTransformation} ${stupid}`;

      it(`for '${input}' replies with '${expected}'`, async () => {
        const message = new MessageMock(input);

        await sut.handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });

  describe("probable responses", async () => {
    const testCases = [
      ["linux", linux],
      ["LiNuX", linux],
      ["LINUX", linux],
    ];

    for (const [input, expected] of testCases) {
      it(`does not always reply: ${input}`, async () => {
        const message = new MessageMock(input);

        let previousLength = message.replies.length;
        while (true) {
          await sut.handle(message);
          if (message.replies.length === previousLength) break;
          previousLength = message.replies.length;
        }
      });

      it(`for '${input}', eventually replies '${expected}'`, async () => {
        const message = new MessageMock(input);

        while (message.replies.length === 0) {
          await sut.handle(message);
        }

        assert.deepEqual(message.replies, [expected]);
      });
    }

    const negativeTestCases = ["gnu/linux", "GNU/Linux", "GNU/LINUX"];
    const attempts = 100;

    for (const input of negativeTestCases) {
      it(`does not reply ${input} in ${attempts} attempts`, async () => {
        const message = new MessageMock(input);

        for (let i = 0; i < attempts; i++) await sut.handle(message);

        assert.deepEqual(message.replies, []);
      });
    }
  });

  describe("when does not match", async () => {
    const testCases = ["foo", "the devops movement"];

    for (const input of testCases) {
      it(`does not reply: ${input}`, async () => {
        const reply = sut;
        const remember = new RememberWhenCalled();
        const message = new MessageMock(input);

        await linkChain(reply, remember).handle(message);

        assert.deepEqual(message.replies, []);
        assert(remember.called);
      });
    }
  });
});

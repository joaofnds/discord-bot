import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { WebhookBotMock } from "../../test/webhook-bot-mock.ts";
import {
  anonymous,
  bun,
  cLigaMeu,
  devops,
  eopt,
  feijoada,
  firebase,
  jose,
  linus,
  linux,
  nani,
  neverSaidThis,
  nothingStill,
  pqPraCuba,
  rules,
  stupid,
  thomasMP3,
  yourCodeIsGarbageIMG,
} from "../const.ts";
import { linkChain } from "./link-chain.ts";
import { Reply } from "./reply.ts";

describe(Reply.name, () => {
  let sut: Reply;
  const random = { chance: () => false };
  const randomFolk = "chuck testa!";
  const bunBot = new WebhookBotMock("bun bot");

  beforeEach(() => {
    bunBot.reset();
    sut = new Reply({ random, randomFolk, bunBot });
  });

  describe("when matches", () => {
    const testCases = [
      ["bolsonaro", eopt],
      ["Bolsonaro", eopt],
      ["BOLSONARO", eopt],

      ["citando aleatoriamente", randomFolk],
      ["CiTaNdO AlEaToRiAmEnTe", randomFolk],
      ["CITANDO ALEATORIAMENTE", randomFolk],

      ["fulano é devops", devops],
      ["FuLaNo É DeVoPs", devops],
      ["FULANO É DEVOPS", devops],

      ["eu sou devops", devops],
      ["eU SoU DeVoPs", devops],
      ["EU SOU DEVOPS", devops],

      ["sou os devops", devops],
      ["sOu oS DeVoPs", devops],
      ["SOU OS DEVOPS", devops],

      ["estão contratando devops", devops],
      ["contrataram DevOps", devops],
      ["contratar dEVoPS", devops],

      ["anonymous", anonymous],
      ["AnOnYmOuS", anonymous],
      ["ANONYMOUS", anonymous],

      ["anonimo", anonymous],
      ["AnOnImO", anonymous],
      ["ANONIMO", anonymous],

      ["e o pedro", "Barros!"],
      ["E o PeDrO", "Barros!"],
      ["E O PEDRO", "Barros!"],
      ["mas e o pedro hein", "Barros!"],

      ["e o pt hein", eopt],
      ["e o pt hein", eopt],
      ["e a dilma hein", eopt],
      ["e o lula e a dilma hein", eopt],

      ["???", nani],

      ["feijao", feijoada],
      ["feijoada", feijoada],
      ["FeIjOaDa", feijoada],
      ["FEIJOADA", feijoada],
      ["feijão", feijoada],
      ["FeIjÃo", feijoada],
      ["FEIJÃO", feijoada],
      ["nada acontece", feijoada],
      ["nada acontece feijão", feijoada],
      ["nada acontece feijoada", feijoada],

      [
        "por-favor-me-ajuda.mp3",
        "https://soundcloud.com/joaofnds/por-favor-me-ajuda",
      ],
      ["belezaaa.mp3", "https://soundcloud.com/joaofnds/belezaaa"],
      ["e-o-pix.mp3", "https://soundcloud.com/joaofnds/e-o-pix"],

      ["c liga meu", cLigaMeu],
      ["C LiGa MeU", cLigaMeu],
      ["C LIGA MEU", cLigaMeu],

      ["agencia do nubank", cLigaMeu],
      ["aGeNcIa dO nUbAnK", cLigaMeu],
      ["AGENCIA DO NUBANK", cLigaMeu],

      ["jose", jose],
      ["JoSe", jose],
      ["JOSE", jose],

      ["firebase", firebase],
      ["FiReBaSe", firebase],
      ["FIREBASE", firebase],

      ["por que pra cuba cara?!", pqPraCuba],
      ["pq pra cuba cara?!", pqPraCuba],
      ["pq no objeto cara?!", pqPraCuba],
      ["por que no objeto cara?!", pqPraCuba],
      ["cuba", pqPraCuba],
      ["CuBa", pqPraCuba],
      ["CUBA", pqPraCuba],

      ["e o pix", nothingStill],
      ["e-o-pix", nothingStill],
      ["e_o_pix", nothingStill],
      ["foo e o pix bar", nothingStill],
      ["foo e-o-pix bar", nothingStill],

      ["olavo", "💀"],
      ["OlAvO", "💀"],
      ["OLAVO", "💀"],

      ["release-train", thomasMP3],
      ["rElEaSe-TrAiN", thomasMP3],
      ["RELEASE-TRAIN", thomasMP3],
      ["release train", thomasMP3],
      ["rElEaSe TrAiN", thomasMP3],
      ["RELEASE TRAIN", thomasMP3],

      ["!regras", rules],

      ["!linus", linus],

      ["code garbage", yourCodeIsGarbageIMG],
      ["your code is garbage", yourCodeIsGarbageIMG],
      ["code garbage", yourCodeIsGarbageIMG],
      ["garbage code", yourCodeIsGarbageIMG],
      ["this is garbage code", yourCodeIsGarbageIMG],

      ["nunca disse", neverSaidThis],
      ["NUNCA DISSE", neverSaidThis],
      ["nunca falei", neverSaidThis],
      ["NUNCA FALEI", neverSaidThis],
      ["eu nunca disse isso", neverSaidThis],
      ["eu nunca falei isso", neverSaidThis],
    ];

    for (const [input, expected] of testCases) {
      it(`for '${input}' replies with '${expected}'`, async () => {
        const message = new MessageMock(input);

        await sut.handle(message);

        expect(message.replies).toEqual([expected]);
      });
    }
  });

  describe("stupid responses", () => {
    const testCases = [
      ["padronização", "PaDrOnIzAcAo"],
      ["PADRONIZAÇÃO", "PaDrOnIzAcAo"],

      ["padronizar", "PaDrOnIzAr"],
      ["PADRONIZAR", "PaDrOnIzAr"],

      ["Json", "JsOn"],
      ["Http", "HtTp"],
      ["Api", "ApI"],
      ["Dto", "DtO"],
      ["Url", "UrL"],
      ["Uuid", "UuId"],

      ["light mode", "LiGhT MoDe"],
      ["LIGHT MODE", "LiGhT MoDe"],

      ["deadline", "DeAdLiNe"],
      ["DEADLINE", "DeAdLiNe"],

      ["legado", "LeGaDo"],
      ["lEgAdO", "LeGaDo"],
      ["LEGADO", "LeGaDo"],

      ["seguranca", "SeGuRaNcA"],
      ["SEGURANCA", "SeGuRaNcA"],

      ["entregar valor", "EnTrEgAr vAlOr"],
      ["eNtReGaR VaLoR", "EnTrEgAr vAlOr"],
      ["ENTREGAR VALOR", "EnTrEgAr vAlOr"],

      ["Http Dto Api", "ApI, DtO, HtTp"],

      ["estimar", "EsTiMaR"],
      ["ESTIMAR", "EsTiMaR"],
      ["estimativa", "EsTiMaTiVa"],
      ["ESTIMATIVA", "EsTiMaTiVa"],

      ["Uspsa", "UsPsA"],
      ["Idpa", "IdPa"],

      ["code freeze", "CoDe fReEzE"],
      ["CODE FREEZE", "CoDe fReEzE"],
    ];

    for (const [input, expectedTransformation] of testCases) {
      const expected = `${expectedTransformation} ${stupid}`;

      it(`for '${input}' replies with '${expected}'`, async () => {
        const message = new MessageMock(input);

        await sut.handle(message);

        expect(message.replies).toEqual([expected]);
      });
    }
  });

  describe("probable responses", () => {
    const testCases = [
      ["linux", linux],
      ["LiNuX", linux],
      ["LINUX", linux],

      ["something firebase", firebase],
      ["something FiReBaSe", firebase],
      ["something FIREBASE", firebase],
    ];

    for (const [input, expected] of testCases) {
      describe("when chance returns false", () => {
        const alwaysFalseSUT = new Reply({
          random: { chance: () => false },
          randomFolk,
          bunBot,
        });

        it(`does not reply: ${input}`, async () => {
          const message = new MessageMock(input);

          await alwaysFalseSUT.handle(message);

          expect(message.replies).toEqual([]);
        });
      });

      describe("when chance returns true", () => {
        const alwaysTrueSUT = new Reply({
          random: { chance: () => true },
          randomFolk,
          bunBot,
        });

        it(`replies '${expected}'`, async () => {
          const message = new MessageMock(input);

          await alwaysTrueSUT.handle(message);

          expect(message.replies).toEqual([expected]);
        });

        const negativeTestCases = ["gnu/linux", "GNU/Linux", "GNU/LINUX"];
        for (const input of negativeTestCases) {
          it(`does not reply ${input}`, async () => {
            const message = new MessageMock(input);

            await alwaysTrueSUT.handle(message);

            expect(message.replies).toEqual([]);
          });
        }
      });
    }
  });

  describe("webhook bot responses", () => {
    const testCases = [
      ["bun", bun, bunBot],
      ["bUn", bun, bunBot],
      ["BUN", bun, bunBot],
    ] as const;

    for (const [message, reply, bot] of testCases) {
      it(`replies '${reply}' to '${message}' on ${bot.name}`, async () => {
        await sut.handle(new MessageMock(message));

        expect(bot.messages).toEqual([reply]);
      });
    }

    const falseTestCases = [
      ["wbun", bunBot],
      ["bunw", bunBot],
      ["wbunw", bunBot],
    ] as const;

    for (const [message, bot] of falseTestCases) {
      it(`does not reply to '${message}' on ${bot.name}`, async () => {
        await sut.handle(new MessageMock(message));
        expect(bot.messages).toEqual([]);
      });
    }
  });

  describe("when does not match", () => {
    const testCases = [
      "foo",
      "simples",
      "the devops movement",
      "xjosex",
      "something firebase something",
      " firebase ",
      "USPSA",
      "IDPA",
      "e something o something pix",
      "!REGRAS",
      "!ReGrAs",
      "!LINUS",
      "!LiNuS",
    ];

    for (const input of testCases) {
      it(`does not reply: ${input}`, async () => {
        const reply = sut;
        const remember = new RememberWhenCalled();
        const message = new MessageMock(input);

        await linkChain(reply, remember).handle(message);

        expect(message.replies).toEqual([]);
        expect(remember.called).toEqual(true);
      });
    }
  });
});

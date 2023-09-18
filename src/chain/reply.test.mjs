import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { WebhookBotMock } from "../../test/webhook-bot-mock.mjs";
import {
	anonymous,
	bun,
	devops,
	eopt,
	feijoada,
	firebase,
	linux,
	nani,
	stupid,
} from "../const.mjs";
import { linkChain } from "./link-chain.mjs";
import { Reply } from "./reply.mjs";

describe(Reply.name, async () => {
	let sut;
	const randomFolk = "chuck testa!";
	const bunBot = new WebhookBotMock("bun bot");

	beforeEach(() => {
		bunBot.reset();
		sut = new Reply({ randomFolk, bunBot });
	});

	describe("when matches", async () => {
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

			["Mas e o pt hein", eopt],
			["mas e o pt hein", eopt],
			["mas e a dilma hein", eopt],
			["Mas e o lula e a dilma hein", eopt],

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
		];

		for (const [input, expected] of testCases) {
			it(`for '${input}' replies with '${expected}'`, async () => {
				const message = new MessageMock(input);

				await sut.handle(message);

				assert.deepEqual(message.replies, [expected]);
			});
		}
	});

	describe("stupid responses", async () => {
		const testCases = [
			["padronização", "PaDrOnIzAcAo"],
			["PADRONIZAÇÃO", "PaDrOnIzAcAo"],

			["padronizar", "PaDrOnIzAr"],
			["PADRONIZAR", "PaDrOnIzAr"],

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

			["firebase", firebase],
			["FiReBaSe", firebase],
			["FIREBASE", firebase],
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

	describe("webhook bot responses", async () => {
		const testCases = [
			["bun", bun, bunBot],
			["bUn", bun, bunBot],
			["BUN", bun, bunBot],
		];

		for (const [message, reply, bot] of testCases) {
			it(`replies '${reply}' to '${message}' on ${bot.name}`, async () => {
				await sut.handle(new MessageMock(message));

				assert.deepEqual(bot.messages, [reply]);
			});
		}

		const falseTestCases = [
			["wbun", bunBot],
			["bunw", bunBot],
			["wbunw", bunBot],
		];

		for (const [message, bot] of falseTestCases) {
			it(`does not reply to '${message}' on ${bot.name}`, async () => {
				await sut.handle(new MessageMock(message));
				assert.deepEqual(bot.messages, []);
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

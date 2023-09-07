import { neuralizer } from "../const.mjs";
import { Chain } from "./chain.mjs";

export class DeleteReply extends Chain {
  async handle(message) {
    await message.channel.send(`<@${message.author.id}>\n${neuralizer}`);
  }
}

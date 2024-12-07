import { neuralizer } from "../const.ts";
import { Msg } from "../discord/types.ts";
import { Chain } from "./chain.ts";

export class DeleteReply extends Chain {
  override async handle(message: Msg) {
    await message.channel.send(`<@${message.author.id}>\n${neuralizer}`);
  }
}

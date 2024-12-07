import { MsgAuthor } from "../src/discord/types.ts";

export class AuthorMock implements MsgAuthor {
  id = "0";
  bot = false;
}

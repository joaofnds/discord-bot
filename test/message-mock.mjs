export class MessageMock {
  replies = [];
  author = { bot: false };

  constructor(content) {
    this.content = content;
  }

  reply(message) {
    this.replies.push(message);
  }
}

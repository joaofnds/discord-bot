export class MessageMock {
  replies = [];
  reacts = [];
  author = { bot: false };

  constructor(content) {
    this.content = content;
  }

  reply(message) {
    this.replies.push(message);
  }

  react(message) {
    this.reacts.push(message);
  }
}

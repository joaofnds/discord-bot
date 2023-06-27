export class MessageMock {
  replies = [];

  constructor(content) {
    this.content = content;
  }

  reply(message) {
    this.replies.push(message);
  }
}

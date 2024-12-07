export const normalize = (content: string) =>
  content.normalize("NFD").replace(/[^\p{ASCII}]/gu, "");

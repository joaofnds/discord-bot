export const normalize = (content) =>
  content.normalize("NFD").replace(/[^\p{ASCII}]/gu, "");

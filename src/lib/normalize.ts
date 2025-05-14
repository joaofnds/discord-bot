export const normalize = (content: string) =>
  content.normalize("NFD").replaceAll(/[^\p{ASCII}]/gu, "");

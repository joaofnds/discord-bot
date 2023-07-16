export function linkChain(...links) {
  links.reduce((previous, current) => {
    previous.setNext(current);
    return current;
  });
  return links[0];
}

import { Chain } from "./chain.ts";

export function linkChain(...links: Chain[]) {
  links.reduce((previous, current) => {
    previous.setNext(current);
    return current;
  });
  return links[0];
}

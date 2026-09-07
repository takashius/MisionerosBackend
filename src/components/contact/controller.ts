import { createMessage } from "./store";

export async function create(body: any) {
  return createMessage(body);
}

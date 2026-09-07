import {
  listPublic,
  listManage,
  createItem,
  updateItem,
  deleteItem,
} from "./store";

export async function publicList(fecha?: string) {
  return listPublic(fecha);
}

export async function manageList(fecha?: string) {
  return listManage(fecha);
}

export async function create(body: any) {
  return createItem(body);
}

export async function update(id: string, body: any) {
  return updateItem(id, body);
}

export async function remove(id: string) {
  return deleteItem(id);
}

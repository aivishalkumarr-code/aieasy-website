import type { Contact } from "@/types";

declare global {
  var __aieasyDemoContacts: Contact[] | undefined;
}

const byNewest = (left: Contact, right: Contact) =>
  new Date(right.created_at).getTime() - new Date(left.created_at).getTime();

const getStore = () => {
  if (!globalThis.__aieasyDemoContacts) {
    globalThis.__aieasyDemoContacts = [];
  }

  return globalThis.__aieasyDemoContacts;
};

export const addDemoContact = (contact: Contact) => {
  const store = getStore();
  store.unshift({ ...contact });
  store.sort(byNewest);
  return { ...contact };
};

export const getDemoContacts = () => getStore().map((contact) => ({ ...contact }));

export const mergeDemoContacts = (contacts: Contact[]) =>
  [...getDemoContacts(), ...contacts].sort(byNewest);

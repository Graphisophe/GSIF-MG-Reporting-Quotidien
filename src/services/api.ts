import { Contact } from '../types';

const STORAGE_KEY = 'contacts_v2';

const getStoredContacts = (): Contact[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStoredContacts = (contacts: Contact[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
};

export const fetchContacts = async (filters: any): Promise<Contact[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let contacts = getStoredContacts();

  if (filters.date) {
    contacts = contacts.filter(c => c.date === filters.date);
  }
  if (filters.source) {
    contacts = contacts.filter(c => c.source === filters.source);
  }
  if (filters.channel) {
    contacts = contacts.filter(c => c.channel === filters.channel);
  }
  if (filters.interestLevel) {
    contacts = contacts.filter(c => c.interestLevel === filters.interestLevel);
  }
  if (filters.status) {
    contacts = contacts.filter(c => c.status === filters.status);
  }
  if (filters.requestedLevel) {
    contacts = contacts.filter(c => c.children.some(child => child.requestedLevel.includes(filters.requestedLevel)));
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    contacts = contacts.filter(c => 
      c.lastName.toLowerCase().includes(search) ||
      (c.fatherPhone && c.fatherPhone.includes(search)) ||
      (c.motherPhone && c.motherPhone.includes(search)) ||
      c.children.some(child => child.firstName.toLowerCase().includes(search))
    );
  }

  // Sort by date DESC, then by id DESC (simulating createdAt DESC)
  contacts.sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  return contacts;
};

export const saveContact = async (contact: Contact): Promise<Contact> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const contacts = getStoredContacts();
  
  if (contact.id) {
    const index = contacts.findIndex(c => c.id === contact.id);
    if (index !== -1) {
      contacts[index] = { ...contact, updatedAt: new Date().toISOString() };
    }
  } else {
    const newContact = { 
      ...contact, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    contacts.push(newContact);
    saveStoredContacts(contacts);
    return newContact;
  }
  
  saveStoredContacts(contacts);
  return contact;
};

export const deleteContact = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let contacts = getStoredContacts();
  contacts = contacts.filter(c => c.id !== id);
  saveStoredContacts(contacts);
};

export const consolidateContact = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const contacts = getStoredContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], status: 'confirmé', updatedAt: new Date().toISOString() };
    saveStoredContacts(contacts);
  }
};

export const resetDatabase = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  localStorage.removeItem(STORAGE_KEY);
};

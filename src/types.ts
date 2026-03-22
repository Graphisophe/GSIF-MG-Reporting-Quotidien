export interface Child {
  firstName: string;
  birthDate: string;
  requestedLevel: string;
}

export interface Contact {
  id?: string;
  date: string;
  lastName: string;
  fatherPhone: string;
  motherPhone: string;
  children: Child[];
  source: string;
  channel: string;
  interestLevel: string;
  toDo: string;
  appointmentDate: string | null;
  status: string;
  internalNotes?: string;
  sensitivePoints?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SOURCES = [
  '___',
  'Facebook',
  'Instagram',
  'Radio',
  'Mall of Sousse',
  'Parrainage',
  'Site web',
  'Affichage',
  'JPO'
];

export const CHANNELS = [
  '___',
  'téléphone',
  'message',
  'rencontre'
];

export const INTEREST_LEVELS = [
  '___',
  'information simple',
  'visite souhaitée',
  'très motivé',
  'inscription probable'
];

export const TO_DOS = [
  '___',
  'A relancer',
  'A rencontrer',
  'A finaliser'
];

export const STATUSES = [
  '___',
  'Prospect',
  'Converti',
  'Non-converti'
];

export const LEVELS = [
  '___',
  'PS (Petite Section)',
  'MS (Moyenne Section)',
  'GS (Grande Section)',
  'CP (Classe Préparatoire)',
  'CE1 (Classe Elémentaire 1)',
  'CE2 (Classe Elémentaire 2)',
  'CM1',
  'CM2'
];

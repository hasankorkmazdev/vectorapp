export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export type UpdateTagData = CreateTagData;

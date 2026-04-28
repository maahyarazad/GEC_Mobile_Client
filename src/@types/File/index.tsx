export interface FileType {
  id: string;
  mime: string;
  name: string;
  url: string;
  size: number;
  date_created: string;
  date_updated: string;
}

export interface File {
  name: string;
}

export interface IPostNewsletter {
  id: number;
  token?: string;
  ids: string;
  status?: number;
  status_name?: string;
  transmit?: number;
  starttime?: Date;
  starttime_name? : string;
  endtime?: Date;
  time?: Date;
  adminId?: number;
  recipients?: number;
  have_read?: number;
  preview?: number;
}

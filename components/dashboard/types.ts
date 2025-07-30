export interface CalendarItem {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  responsavel?: string;
  status: string;
  prazo: string;
  data: string;
  rawData: any[];
}

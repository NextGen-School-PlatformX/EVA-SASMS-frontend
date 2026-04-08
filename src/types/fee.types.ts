export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface FeeSummary {
  total: number;
  paid: number;
  remaining: number;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
}

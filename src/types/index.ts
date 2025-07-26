export type TransactionStatus = 'Pending' | 'Executing' | 'Completed' | 'Failed';

export type Transaction = {
  id: string;
  asset: string;
  amount: number;
  status: TransactionStatus;
  timestamp: Date;
};

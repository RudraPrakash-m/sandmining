// src/features/payment-settlement/types/payment-settlement.types.ts

export interface PaymentSettlementItem {
  id: string | number;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface PaymentSettlementFormData {
  name: string;
  code: string;
  status: string;
  description?: string;
}

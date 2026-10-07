// src/features/payment-settlement/form-config/paymentSettlementFormConfig.ts

import type { FormField } from '@/shared/components/ui/Forms/form.types';

export const paymentSettlementFormConfig: FormField[] = [
  {
    name: 'receiptCertificateId',
    label: 'Receipt Certificate ID',
    type: 'text',
    placeholder: 'Enter receipt certificate ID',
    gridColumn: 3,
    validation: {
      required: true,
      message: 'Receipt Certificate ID is required',
    },
  },

  {
    name: 'deliveryAcknowledgment',
    label: 'Delivery Acknowledgment',
    type: 'select',
    placeholder: 'Select acknowledgment status',
    options: [
      { label: 'Acknowledged', value: 'acknowledged' },
      { label: 'Pending', value: 'pending' },
    ],
    gridColumn: 3,
    validation: {
      required: true,
      message: 'Please select delivery acknowledgment status',
    },
  },

  {
    name: 'claimDate',
    label: 'Claim Date',
    type: 'date',
    placeholder: 'Select claim date',
    gridColumn: 3,
    validation: {
      required: true,
      message: 'Claim Date is required',
    },
  },

  {
    name: 'slaCountdown',
    label: '15-Day SLA Countdown',
    type: 'text',
    placeholder: 'Auto-calculated SLA countdown',
    gridColumn: 3,
    disabled: true,
  },

  {
    name: 'ePaymentRefUtr',
    label: 'E-Payment Ref / UTR',
    type: 'text',
    placeholder: 'Enter E-Payment reference / UTR',
    gridColumn: 3,
  },

  {
    name: 'readOnlyClaimViewer',
    label: 'Read-only Claim Viewer',
    type: 'textarea',
    placeholder: 'Claim details',
    gridColumn: 3,
    disabled: true,
  },

  {
    name: 'slaCountdownDisplay',
    label: 'SLA Countdown Display',
    type: 'text',
    placeholder: '15-day SLA countdown',
    gridColumn: 3,
    disabled: true,
  },

  {
    name: 'ePaymentGatewayTrigger',
    label: 'E-Payment Gateway Trigger',
    gridColumn: 3,
  },
];
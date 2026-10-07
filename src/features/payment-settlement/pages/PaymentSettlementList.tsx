// src/features/payment-settlement/pages/PaymentSettlementList.tsx
import React, { useCallback, useMemo, useState } from 'react';
import type { MRT_ColumnDef } from 'material-react-table';
import { Layers } from 'lucide-react';
import { ReusableTable } from '@/shared/components/ui/Table';
import ActionButtons from '@/shared/components/ui/Actions/ActionButtons';
import type { ActionType } from '@/shared/components/ui/Actions/action.types';
import Modal from '@/shared/components/ui/Modal/Modal';
import Card from '@/shared/components/layout/Card';
import type { PaymentSettlementItem } from '../types/payment-settlement.types';
import AddPaymentSettlement from './AddPaymentSettlement';

const INITIAL_DATA: PaymentSettlementItem[] = [
  { id: '1', name: 'PaymentSettlement Alpha', code: 'PAY-001', status: 'active' },
  { id: '2', name: 'PaymentSettlement Beta', code: 'PAY-002', status: 'active' },
  { id: '3', name: 'PaymentSettlement Gamma', code: 'PAY-003', status: 'inactive' },
];

const PaymentSettlementStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const isActive = status?.toLowerCase() === 'active';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {status?.toUpperCase() || 'N/A'}
    </span>
  );
};

const PaymentSettlementActionCell: React.FC<{
  item: PaymentSettlementItem;
  onAction: (action: ActionType, item: PaymentSettlementItem) => void;
}> = ({ item, onAction }) => (
  <ActionButtons
    actions={['view', 'edit', 'delete']}
    toggleValue={item.status === 'active'}
    onAction={(action) => onAction(action, item)}
  />
);

const getPaymentSettlementColumns = (
  handleAction: (action: ActionType, item: PaymentSettlementItem) => void
): MRT_ColumnDef<PaymentSettlementItem>[] => [
  { accessorKey: 'id', header: 'ID', size: 80 },
  { accessorKey: 'name', header: 'PaymentSettlement Name' },
  { accessorKey: 'code', header: 'Code' },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ cell }) => <PaymentSettlementStatusBadge status={cell.getValue<string>()} />,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    size: 150,
    Cell: ({ row }) => (
      <PaymentSettlementActionCell
        item={row.original}
        onAction={handleAction}
      />
    ),
  },
];

export const PaymentSettlementList: React.FC = () => {
  const [data] = useState<PaymentSettlementItem[]>(INITIAL_DATA);
  const [selectedItem, setSelectedItem] = useState<PaymentSettlementItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = useCallback(
    (action: ActionType, row: PaymentSettlementItem) => {
      if (action === 'view') {
        setSelectedItem(row);
        setIsModalOpen(true);
      }
    },
    []
  );

  const columns = useMemo(() => getPaymentSettlementColumns(handleAction), [handleAction]);

  return (
    <>
       <AddPaymentSettlement />
       <div className='mt-5'>
      <Card title="Payment Settlement Details" icon={Layers}>
        <ReusableTable
          columns={columns}
          data={data}
          enableRowActions={false}
          enableExport={true}
          exportFileName="payment-settlement_records"
        />
      </Card>
      </div>
   
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? `PaymentSettlement Details - ${selectedItem.name}` : 'PaymentSettlement Details'}
        size="2xl"
      >
        {selectedItem && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">ID</span>
                <p className="text-sm font-medium text-foreground mt-1">{selectedItem.id}</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">PaymentSettlement Name</span>
                <p className="text-sm font-medium text-foreground mt-1">{selectedItem.name}</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Code</span>
                <p className="text-sm font-medium text-foreground mt-1">{selectedItem.code}</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <p className="text-sm font-medium text-foreground mt-1">
                  <PaymentSettlementStatusBadge status={selectedItem.status} />
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PaymentSettlementList;

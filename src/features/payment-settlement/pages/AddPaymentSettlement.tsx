// src/features/payment-settlement/pages/AddPaymentSettlement.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';
import FormGenerator from '@/shared/components/ui/Forms/FormGenerator';
import Card from '@/shared/components/layout/Card';
import Button from '@/shared/components/ui/Button';
import { paymentSettlementFormConfig } from '../form-config/paymentSettlementFormConfig';

export const AddPaymentSettlement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleSubmit = (_data: Record<string, any>) => {
    toast.success(id ? 'PaymentSettlement updated successfully!' : 'PaymentSettlement created successfully!');
    navigate('/payment-settlement');
  };

  return (
    <div className="space-y-6">
      <Card
        title={id ? 'Edit PaymentSettlement' : 'Add New Payment Settlement'}
        icon={PlusCircle}
      >
        <FormGenerator
          fields={paymentSettlementFormConfig}
          onSubmit={handleSubmit}
          gridColumns={12}
        >
          <div className="flex w-full justify-end gap-2 mt-6 col-span-full">
            <Button
              type="button"
              variant="danger"
              label="Cancel"
              size="md"
              onClick={() => navigate('/payment-settlement')}
            />
            <Button
              type="submit"
              variant="primary"
              label={id ? 'Update' : 'Save'}
              size="md"
            />
          </div>
        </FormGenerator>
      </Card>
    </div>
  );
};

export default AddPaymentSettlement;

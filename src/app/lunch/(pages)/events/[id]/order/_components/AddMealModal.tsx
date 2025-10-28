import { Form2Ref } from '@/components/form2/types';
import Modal, { ModalRef } from '@/components/Modal';
import { EventMenuItem } from '@/types/LunchEvent';
import { useEffect, useMemo, useRef } from 'react';
import MealForm from './MealForm';

interface AddMealModalProps {
  settings: {
    from: 'menu' | 'custom';
    menu_item?: EventMenuItem;
  }
  open?: boolean;
  onOk: (values: any) => void;
  onClose?: () => void;
}

export interface MenuFormValues {
  name: string;
  price: number;
  quantity: number;
  note: string;
  description?: string;
  menu_item_id?: string;
  [x: string]: unknown;
}

const id = "add-meal-modal";
export default function AddMealModal({
  settings = { from: 'custom' },
  open = false,
  onOk,
  onClose
}: AddMealModalProps) {
  const modalRef = useRef<ModalRef>(null);
  const formRef = useRef<Form2Ref>(null);
  const initialValues: MenuFormValues = useMemo(() => {
    if (settings.from === 'menu' && settings.menu_item) {
      return {
        menu_item_id: settings.menu_item.id,
        name: settings.menu_item.name,
        description: settings.menu_item.description || '',
        price: settings.menu_item.price,
        quantity: 1,
        note: '',
      };
    }
    return {
      menu_item_id: undefined,
      name: '',
      description: '',
      price: 0,
      quantity: 1,
      note: '',
    };
  }, [settings.from, settings.menu_item]);

  useEffect(() => {
    if (open) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  return (
    <Modal
      ref={modalRef}
      id={id}
      title="新增餐點"
      onOk={() => {
        formRef.current?.submit();
      }}
      onClose={() => {
        modalRef.current?.close();
        onClose?.();
      }}
    >
      <MealForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={(values) => {
          onOk?.(values);
          modalRef.current?.close();
        }}
      />
    </Modal>
  )
}

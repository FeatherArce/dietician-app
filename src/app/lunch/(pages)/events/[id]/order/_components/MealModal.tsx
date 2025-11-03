import { Form2Ref } from '@/components/form2/types';
import Modal, { ModalRef } from '@/components/Modal';
import { EventMenuItem } from '@/types/LunchEvent';
import { useEffect, useMemo, useRef } from 'react';
import MealForm, { MealFormMode, MenuFormValues } from './MealForm';
import { EventOrderItem } from '@/app/lunch/types';

export interface MealModalSettings {
  mode: MealFormMode;
  from: 'menu' | 'custom';
  menu_item?: EventMenuItem;
  open: boolean;
  // Edit mode only  
  index?: number; // 編輯模式下的項目索引
  values?: EventOrderItem;
}

interface AddMealModalProps {
  settings: MealModalSettings;
  open?: boolean;
  onOk: (values: any, settings: MealModalSettings) => void;
  onClose?: () => void;
}

const id = "add-meal-modal";
export default function MealModal({
  settings,
  open = false,
  onOk,
  onClose
}: AddMealModalProps) {
  const modalRef = useRef<ModalRef>(null);
  const formRef = useRef<Form2Ref>(null);

  const initialValues: MenuFormValues = useMemo(() => {
    if (settings.mode === MealFormMode.EDIT && settings.values) {
      return {
        menu_item_id: settings.values.menu_item_id,
        name: settings.values.name,
        // description: settings.values.description || '',
        price: settings.values.price,
        quantity: settings.values.quantity,
        note: settings.values.note || '',
      };
    } else {
      if (settings.from === 'menu' && settings.menu_item) {
        return {
          menu_item_id: settings.menu_item.id,
          name: settings.menu_item.name,
          // description: settings.menu_item.description || '',
          price: settings.menu_item.price,
          quantity: 1,
          note: '',
        };
      }
      return {
        menu_item_id: undefined,
        name: '',
        // description: '',
        price: 0,
        quantity: 1,
        note: '',
      };
    }
  }, [settings]);

  useEffect(() => {
    if (open) {
      modalRef.current?.open();
      if (settings.mode === MealFormMode.EDIT && formRef.current) {
        formRef.current.setFieldsValue(initialValues);
      }
    } else {
      modalRef.current?.close();
      formRef.current?.reset();
    }
  }, [open, settings, initialValues]);

  return (
    <Modal
      ref={modalRef}
      id={id}
      title={settings.mode === MealFormMode.ADD ? "新增餐點" : "編輯餐點"}
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
        mode={settings.mode}
        initialValues={initialValues}
        onSubmit={(values) => {
          onOk?.(values, settings);
          modalRef.current?.close();
        }}
      />
    </Modal>
  )
}

import { FormRef } from '@/components/form/types';
import Modal, { ModalRef } from '@/components/Modal';
import { ILunchOrderItem, IShopMenuItem } from '@/types/LunchEvent';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import MealForm, { MealFormMode, MenuFormValues } from './MealForm';

export interface MealModalSettings {
  mode: MealFormMode;
  from: 'menu' | 'custom';
  menu_item?: IShopMenuItem;
  open: boolean;
  // Edit mode only  
  index?: number; // 編輯模式下的項目索引
  values?: ILunchOrderItem;
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
  const formRef = useRef<FormRef>(null);

  const getValuesFromSettings = useCallback((): MenuFormValues => {
    if (settings.mode === MealFormMode.EDIT && settings.from === 'custom' && settings.values) {
      // 編輯: 使用傳入的值作為初始值
      return {
        menu_item_id: settings.values.menu_item_id || undefined,
        name: settings.values.name,
        // description: settings.values.description || '',
        price: settings.values.price,
        quantity: settings.values.quantity,
        note: settings.values.note || '',
      };
    }

    if (settings.from === 'menu' && settings.menu_item) {
      // 新增或編輯: 從菜單項目載入初始值
      return {
        menu_item_id: settings.menu_item.id,
        name: settings.menu_item.name,
        // description: settings.menu_item.description || '',
        price: settings.menu_item.price,
        quantity: 1,
        note: (settings.mode === MealFormMode.EDIT && settings?.values?.note) ? settings.values.note : '',
      };
    }

    // 新增: 初始載入預設值
    return {
      menu_item_id: undefined,
      name: '',
      // description: '',
      price: 0,
      quantity: 1,
      note: '',
    };
  }, [settings]);

  useEffect(() => {
    if (open) {
      modalRef.current?.open();
      const newValues = getValuesFromSettings();
      formRef.current?.setFieldsValue(newValues);
    } else {
      modalRef.current?.close();
      formRef.current?.reset();
    }
  }, [open, settings, getValuesFromSettings]);

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
        initialValues={getValuesFromSettings()}
        onSubmit={(values) => {
          onOk?.(values, settings);
          modalRef.current?.close();
        }}
      />
    </Modal>
  )
}

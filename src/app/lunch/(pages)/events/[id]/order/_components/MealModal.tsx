import { FormRef } from '@/components/form/types';
import Modal, { ModalRef } from '@/components/Modal';
import { ILunchOrderItem, IShopMenuItem } from '@/types/LunchEvent';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
  onOk: (values: any, settings: MealModalSettings, continueAdding: boolean) => void;
  onClose?: () => void;
}

export interface MealModalRef extends ModalRef {
  resetForm: () => void;
}

const id = "add-meal-modal";
function MealModal(
  {
    settings,
    open = false,
    onOk,
    onClose,
  }: AddMealModalProps,
  ref: React.Ref<MealModalRef>
) {
  const modalRef = useRef<ModalRef>(null);
  const formRef = useRef<FormRef>(null);
  const [isCountinueAdding, setIsContinueAdding] = useState(false);
  if(settings.mode === MealFormMode.ADD && settings.from === 'custom' && isCountinueAdding === false) {
    setIsContinueAdding(true);
  } else if (!(settings.mode === MealFormMode.ADD && settings.from === 'custom') && isCountinueAdding === true) {
    setIsContinueAdding(false);
  }

  const setValuesFromSettings = useCallback((): void => {
    if (settings.from === 'custom' && settings.mode === MealFormMode.EDIT && settings.values) {
      // 編輯: 使用傳入的值作為初始值
      formRef.current?.setFieldsValue({
        menu_item_id: settings.values.menu_item_id || undefined,
        name: settings.values.name,
        // description: settings.values.description || '',
        price: settings.values.price,
        quantity: settings.values.quantity,
        note: settings.values.note || '',
      });
      return;
    }

    if (settings.from === 'menu' && settings.menu_item) {
      // 新增或編輯: 從菜單項目載入初始值
      formRef.current?.setFieldsValue({
        menu_item_id: settings.menu_item.id,
        name: settings.menu_item.name,
        // description: settings.menu_item.description || '',
        price: settings.menu_item.price,
        quantity: 1,
        note: (settings.mode === MealFormMode.EDIT && settings?.values?.note) ? settings.values.note : '',
      });
      return;
    }

    // 新增: 初始載入預設值
    formRef.current?.setFieldsValue({
      menu_item_id: undefined,
      name: '',
      // description: '',
      price: 0,
      quantity: 1,
      note: '',
    });
  }, [settings]);

  useEffect(() => {
    if (open) {
      modalRef.current?.open();
      setValuesFromSettings();
    } else {
      modalRef.current?.close();
      formRef.current?.reset();
    }
  }, [open, settings, setValuesFromSettings]);

  useImperativeHandle(ref, () => ({
    resetForm: () => {
      formRef.current?.reset();
    },
    open: () => {
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }), []);

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
        onSubmit={(values) => {
          onOk?.(values, settings, isCountinueAdding);
          modalRef.current?.close();
        }}
      />
      {(settings.mode === MealFormMode.ADD && settings.from === 'custom') && (
        <label className="label mt-1">
          <input
            type="checkbox"
            className="checkbox"
            checked={isCountinueAdding}
            onChange={e => setIsContinueAdding(e.target.checked)}
          />
          按下確定送出後，繼續輸入下一筆
        </label>
      )}
    </Modal>
  )
}

export default forwardRef(MealModal);
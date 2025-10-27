import React from 'react'
import Modal, { ModalTriggerButton } from './Modal';
import { FaPlus } from 'react-icons/fa';

interface AddMealModalProps {
  open?: boolean;
  onClose?: () => void;
}

const id = "add-meal-modal";
export default function AddMealModal({ open, onClose }: AddMealModalProps) {
  return (
    <>
      <ModalTriggerButton id={id}>
        <FaPlus className="w-3 h-3 mr-1" />
        自訂餐點
      </ModalTriggerButton>
      <Modal id={id} title="新增餐點" open={open} onClose={onClose}>

      </Modal>
    </>
  )
}

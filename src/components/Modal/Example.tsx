import React, { useRef, useState } from 'react';
import Modal, { ModalRef, ModalTriggerButton } from './index';
import { FaPlus } from 'react-icons/fa';

export default function ModalExample() {
  const modalRef = useRef<ModalRef>(null);
  const [result, setResult] = useState<string>('');

  return (
    <div className="space-y-4">
      <ModalTriggerButton id="example-modal">
        <FaPlus className="w-3 h-3 mr-1" />
        開啟範例 Modal
      </ModalTriggerButton>

      <Modal
        ref={modalRef}
        id="example-modal"
        title="範例 Modal"
        onOk={() => {
          setResult('你點擊了確定！');
          modalRef.current?.close();
        }}
        onClose={() => {
          setResult('你關閉了 Modal');
        }}
        okText="確定送出"
        closeText="取消"
      >
        <div className="py-4">
          <p>這是一個 DaisyUI Modal 的使用範例。</p>
          <p>你可以點擊下方按鈕來觸發 onOk 或 onClose。</p>
        </div>
      </Modal>

      {result && (
        <div className="alert alert-info">
          {result}
        </div>
      )}
    </div>
  );
}

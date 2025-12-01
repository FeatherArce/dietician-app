import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Form } from '../form';
import DataTable from '../DataTable';
import { utils as xlsxUtils, writeFile, read } from 'xlsx';
import Modal, { ModalRef } from '../Modal';

interface BatchImportMenuModalProps {
    open?: boolean;
    onFinish?: (records: BatchCreateMenuItemSheetData[]) => void;
}

export interface BatchCreateMenuItemSheetData {
    name: string;
    description?: string;
    price: number;
    is_available: boolean;
    [key: string]: any;
}

export default function BatchImportMenuModal({
    open = false,
    onFinish,
}: BatchImportMenuModalProps) {
    const modalRef = useRef<ModalRef>(null);
    const [sheetData, setSheetData] = useState<BatchCreateMenuItemSheetData[]>([]);

    useEffect(() => {
        if (open) {
            modalRef.current?.open();
        } else {
            modalRef.current?.close();
        }
    }, [open]);

    const handleDownloadTemplate = useCallback(() => {
        const workbook = xlsxUtils.book_new();
        const worksheet = xlsxUtils.json_to_sheet([
            { name: '範例菜單項目', description: '這是一個範例描述', price: 100, is_available: true },
        ]);
        xlsxUtils.sheet_add_aoa(worksheet, [['name', 'description', 'price', 'is_available']], { origin: 'A1' });
        xlsxUtils.book_append_sheet(workbook, worksheet, 'Template Menu Items');
        writeFile(workbook, 'template_menu_item_.xlsx', { bookType: 'xlsx', compression: true });
    }, []);

    const parseXLSX = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (data) {
                const workbook = read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const sheetData = xlsxUtils.sheet_to_json(worksheet);
                console.log('Parsed sheet data:', sheetData);
                setSheetData(sheetData as BatchCreateMenuItemSheetData[]);
            }
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleImport = useCallback(() => {
        console.log('Importing data:', sheetData);
        onFinish?.(sheetData);
        modalRef.current?.close();
    }, [sheetData, onFinish]);

    return (
        <Modal
            ref={modalRef}
            id="batch-import-menu-modal"
            title="批次匯入菜單項目"
            size="lg"
            className="max-w-screen-lg"
            okText='匯入'
            onOk={handleImport}
            onClose={() => { }}
        >
            <div className="space-y-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">上傳檔案</legend>
                    <input
                        type="file"
                        className="file-input file-input-primary w-full"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                            console.log('File input changed:', e);
                            const file = e.target.files?.[0];
                            console.log('Selected file:', file);
                            if (file) {
                                parseXLSX(file);
                            }
                        }}
                    />
                    <label className="label">
                        格式請參考
                        <a href="#" onClick={handleDownloadTemplate} className="link link-primary dark:link-info">範本檔案</a>
                    </label>
                </fieldset>
                <div className="card">
                    <div className="card-body">
                        <DataTable<BatchCreateMenuItemSheetData>
                            dataSource={sheetData}
                            columns={[
                                { title: '名稱', key: 'name' },
                                { title: '描述', key: 'description' },
                                { title: '價格', key: 'price' },
                                { title: '是否可用', key: 'is_available' },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

'use client';
import DataTable, { type Column } from '@/components/DataTable';
import { Form2, FormItem, Input } from '@/components/form2';
import React, { useCallback } from 'react'
import { read, utils } from "xlsx";

interface SheetData {
    name: string;
    data: any[];
    gibberishData?: any[];
    columns?: Column[];
}

interface ExcelData {
    sheets: SheetData[];
}

// 上傳 excel 檔案，並讀取內容顯示在畫面上
export default function ExcelParser() {
    const [gibberishEmails, setGibberishEmails] = React.useState<Map<string, any[]>>(new Map());
    const [fileData, setFileData] = React.useState<ExcelData>({ sheets: [] });

    // 有一些看起來像是假的 email，嘗試查出
    // ex: xkgfykq3jav@hotmail.com, whyrujgsm@hotmail.com, qtfcege@hotmail.com, fcefvbnkhj@hotmail.com, yrgux7us6@hotmail.com, tcxjdtb@hotmail.com....    
    const checkGibberishEmail = useCallback((email: string) => {
        const match = email.match(/^(.+)@/);
        const accountName = match ? match[1].toLowerCase().replace(/[^a-z0-9]/g, '') : null;

        if (!accountName) {
            return { isGibberish: false, reason: "格式不完整" };
        }

        // 模式一: 連續 3 個或更多子音（排除 a, e, i, o, u）
        // 這是捕捉 'xkgf', 'tcxj', 'jgsm', 'qtf' 這種亂碼的關鍵。
        const CONSONANT_CLUSTER_REGEX = /[b-df-hj-np-tv-z]{3,}/i;

        // 模式二: 連續 6 個或更多數字
        const LONG_NUMBER_REGEX = /\d{6,}/;

        // 模式三: 用戶名過長 (例如超過 15 個字元)
        const MAX_USERNAME_LENGTH = 15;

        // --- 檢查 ---

        if (CONSONANT_CLUSTER_REGEX.test(accountName)) {
            return { isGibberish: true, reason: "連續子音過長 (3+)" };
        }

        if (LONG_NUMBER_REGEX.test(accountName)) {
            return { isGibberish: true, reason: "連續數字過長 (6+)" };
        }

        // if (accountName.length > MAX_USERNAME_LENGTH) {
        //     return { isGibberish: true, reason: "用戶名長度過長" };
        // }

        return { isGibberish: false, reason: "正常" };
    }, []);

    const handleFileChange = useCallback((file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result as ArrayBuffer;
                const workbook = read(data);
                console.log(workbook);
                const newSheetData: SheetData[] = [];
                const newGibberishEmails = new Map<string, any[]>();
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = utils.sheet_to_json(worksheet, { defval: null });
                    console.log(`Sheet: ${sheetName}`, json);
                    const columns: Column[] = Object.keys(json[0] || {}).map(key => ({
                        key: key,
                        title: key,
                        dataIndex: key
                    }));

                    const newGibberishData: any[] = [];
                    json?.forEach((row: any) => {
                        const email = row['信箱'] as string;
                        const checkResult = checkGibberishEmail(email);
                        if (checkResult.isGibberish) {
                            newGibberishData.push(row);
                            newGibberishEmails.set(`${email} (${checkResult.reason})`, row);
                        }
                    });

                    newSheetData.push({
                        name: sheetName,
                        data: json,
                        gibberishData: newGibberishData,
                        columns
                    });
                });
                setFileData({ sheets: newSheetData });
                setGibberishEmails(newGibberishEmails);
            };
            reader.readAsArrayBuffer(file);
        }
    }, [checkGibberishEmail]);

    return (
        <div className='container grid gap-4 p-4'>
            <Form2
                onValuesChange={(changedValues, allValues) => {
                    console.log('Changed values:', changedValues);
                    if (changedValues.excelFile && changedValues.excelFile instanceof FileList) {
                        const file = changedValues.excelFile[0];
                        if (file) {
                            handleFileChange(file);
                        }
                    }
                }}
            >
                <FormItem label="上傳檔案" name="excelFile">
                    <Input type="file" accept=".xlsx, .xls" />
                </FormItem>
            </Form2>
            <div>
                <h2 className="text-lg font-bold">偵測到的疑似亂碼信箱列表：</h2>
                <ul className="list-disc list-inside">
                    {[...gibberishEmails.keys()].map((email) => (
                        <li key={email}>{email}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="text-lg font-bold mt-4">檔案內容預覽：</h2>
                {fileData.sheets.map((sheet) => (
                    <div key={sheet.name}>
                        <DataTable
                            key={sheet.name}
                            dataSource={sheet.gibberishData || []}
                            columns={sheet.columns || []}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

"use client";
import DataTable, { type Column } from '@/components/DataTable';
import { Form2, FormItem, Input } from '@/components/form2';
import React, { useCallback, useEffect, useState } from 'react'
import { read, utils } from "xlsx";
import wordlist from '../../../../public/en-word-list.json';

interface SheetData {
    name: string;
    data: any[];
    tableData?: any[];
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
        const emailMatch = email.match(/^(.+)@/);
        const accountName = emailMatch ? emailMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '') : null;

        if (!accountName) {
            return { isGibberish: false, reason: "格式不完整" };
        }

        // const CONSONANT_CLUSTER_REGEX = /[b-df-hj-np-tv-z]{3,}/i;
        // if (CONSONANT_CLUSTER_REGEX.test(accountName)) {
        //     return { isGibberish: true, reason: "連續子音過長 (3+)" };
        // }

        const LONG_NUMBER_REGEX = /\d{6,}/;
        const CELL_PHONE_PARTIAL = /(?:09\d{8}|8869\d{8}|\+8869\d{8})/;
        if (LONG_NUMBER_REGEX.test(accountName)) {
            const isContainsCellPhone = CELL_PHONE_PARTIAL.test(accountName);
            if (isContainsCellPhone) {
                return { isGibberish: false, reason: "包含手機號碼" };
            } else {
                return { isGibberish: true, reason: "連續數字過長 (6+)" };
            }
        }

        // 簡化邏輯：直接遍歷 wordlist 檢查包含的單字
        let validWordCount = 0;

        Object.values(wordlist).forEach((word: string) => {
            if (accountName.includes(word)) {
                validWordCount++;
            }
        });

        if (validWordCount > 0) {
            return { isGibberish: false, reason: `包含有效英文單字 (${validWordCount} 次)` };
        }

        return { isGibberish: true, reason: "非有效英文單字" };
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
                    columns.push({
                        key: 'is_abnormal_email',
                        title: '是否疑似亂碼信箱',
                    });
                    columns.push({
                        key: 'abnormal_email_reason',
                        title: '疑似原因',
                    });

                    const newTableData: any[] = [];
                    const newGibberishData: any[] = [];
                    json?.forEach((row: any) => {
                        const email = row['信箱'] as string;
                        const checkResult = checkGibberishEmail(email);
                        if (checkResult.isGibberish) {
                            newGibberishData.push(row);
                            newGibberishEmails.set(`${email} (${checkResult.reason})`, row);
                        }
                        const newRow = {
                            ...row,
                            is_abnormal_email: checkResult.isGibberish,
                            abnormal_email_reason: checkResult.reason
                        };

                        newTableData.push(newRow);
                    });

                    newSheetData.push({
                        name: sheetName,
                        data: json,
                        tableData: newTableData,
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
        <div className='grid gap-4 p-4'>
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
            <div className='space-y-2'>
                <h2 className="text-lg font-bold">偵測到的疑似亂碼信箱列表：</h2>
                <p>
                    目前的檢查規則包括：<br />
                    1. 連續數字過長 (6 個以上)，且不為手機號碼。<br />
                    2. 不包含任何有效英文單字。
                </p>
                <ul className="list-disc list-inside ml-2">
                    {[...gibberishEmails.keys()].map((email) => (
                        <li key={email}>{email}</li>
                    ))}
                </ul>
            </div>
            <div className='w-full overflow-x-auto'>
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

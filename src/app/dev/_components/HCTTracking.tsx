"use client";

import React, { useState } from 'react';
import { FaSearch, FaTruck, FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';
import CryptoJS from 'crypto-js';

interface HCTConfig {
  daysOffset: number;
  ivValue: string;
  vParam: string;
}

const encryptHCTTrackingNumber = (
  plaintext: string, 
  daysOffset: number, 
  ivValue: string
): string => {
  try {
    const today = new Date();
    const keyDate = new Date(today);
    keyDate.setDate(today.getDate() + daysOffset);
    const dateKey = keyDate.toISOString().slice(0, 10).replace(/-/g, '');
    const iv = ivValue.substring(0, 8).padEnd(8, '0');
    const key = dateKey.substring(0, 8);

    const keyWords = CryptoJS.enc.Utf8.parse(key);
    const ivWords = CryptoJS.enc.Utf8.parse(iv);
    
    const encrypted = CryptoJS.DES.encrypt(plaintext, keyWords, {
      iv: ivWords,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
    
  } catch (error) {
    console.error('DES 加密錯誤:', error);
    throw new Error('加密失敗: ' + (error as Error).message);
  }
};

export default function HCTTrackingPage() {
  const [config] = useState<HCTConfig>({
    daysOffset: 0,
    ivValue: "12345678",
    vParam: "1"
  });

  const [trackingNumber, setTrackingNumber] = useState('');
  const [encryptedString, setEncryptedString] = useState('');
  const [queryUrl, setQueryUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQueryUrl = () => {
    if (!trackingNumber.trim()) {
      setError('請輸入貨號或訂單編號');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const encrypted = encryptHCTTrackingNumber(
        trackingNumber, 
        config.daysOffset, 
        config.ivValue
      );
      
      setEncryptedString(encrypted);

      const url = `https://hctapiweb.hct.com.tw/phone/searchGoods_Main.aspx?no=${encodeURIComponent(encrypted)}&v=${config.vParam}`;
      setQueryUrl(url);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const openTrackingPage = () => {
    if (queryUrl) {
      window.open(queryUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FaTruck className="text-2xl text-primary" />
          <h1 className="text-2xl font-bold">新竹物流貨運查詢測試</h1>
        </div>

        <div className="alert alert-info mb-6">
          <FaInfoCircle />
          <div>
            <h3 className="font-bold">使用說明</h3>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>輸入 10 碼貨號或訂單編號</li>
              <li>系統會使用 DES 加密產生查詢字串</li>
              <li>點擊查詢按鈕開啟新竹物流官方查詢頁面</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">天數偏移</div>
            <div className="stat-value text-lg">{config.daysOffset} 天</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">IV 值</div>
            <div className="stat-value text-lg">
              {config.ivValue === "12345678" ? "測試值" : "已設定"}
            </div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">V 參數</div>
            <div className="stat-value text-lg">{config.vParam}</div>
          </div>
        </div>

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-medium">貨號或訂單編號</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="請輸入 10 碼貨號或訂單編號"
              className="input input-bordered flex-1"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              maxLength={20}
            />
            <button
              className="btn btn-primary"
              onClick={generateQueryUrl}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <FaSearch />
                  產生查詢
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {encryptedString && (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">加密後字串</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20"
                value={encryptedString}
                readOnly
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">查詢 URL</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={queryUrl}
                readOnly
              />
            </div>

            <div className="flex space-x-2">
              <button
                className="btn btn-success"
                onClick={openTrackingPage}
              >
                <FaExternalLinkAlt />
                開啟新竹物流查詢頁面
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => navigator.clipboard.writeText(queryUrl)}
              >
                複製 URL
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 bg-base-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">技術說明</h3>
          <div className="text-sm space-y-1">
            <p><strong>加密方式：</strong>DES 加密</p>
            <p><strong>金鑰：</strong>日期格式 yyyyMMdd（今天 + 偏移天數）</p>
            <p><strong>向量值：</strong>申請文件提供的 8 位元 IV 值</p>
            <p><strong>編碼：</strong>Base64 編碼</p>
          </div>
        </div>

        <div className="alert alert-warning mt-6">
          <FaInfoCircle />
          <div>
            <h4 className="font-bold">配置說明</h4>
            <p>要修改配置參數，請編輯程式碼第 40-44 行的 config 物件：</p>
            <div className="bg-base-300 p-2 mt-2 rounded text-xs">
              <code>
                daysOffset: 日期偏移天數<br/>
                ivValue: 8位元IV值（申請文件提供）<br/>
                vParam: V參數值
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
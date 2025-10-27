# CRM 系統資料結構設計

## 客戶（Customer）
- id: string
- name: string
- type: string (企業/個人)
- tags: string[]
- contactInfo: {
    phone: string
    email: string
    address: string
  }
- files: string[]
- createdAt: Date
- updatedAt: Date

## 聯絡人（Contact）
- id: string
- customerId: string
- name: string
- position: string
- phone: string
- email: string
- note: string

## 銷售機會（Lead/Sale）
- id: string
- customerId: string
- title: string
- status: string (洽談/報價/成交/失敗)
- amount: number
- owner: string
- createdAt: Date
- updatedAt: Date

## 活動/任務（Activity/Task）
- id: string
- title: string
- type: string (行銷/拜訪/任務)
- relatedCustomer: string
- owner: string
- status: string
- startDate: Date
- endDate: Date

## 客戶服務（Service/Case）
- id: string
- customerId: string
- type: string (客訴/諮詢/其他)
- status: string
- description: string
- createdAt: Date
- updatedAt: Date

## 使用者（User）
- id: string
- name: string
- role: string
- email: string
- password: string (hash)
- createdAt: Date
- updatedAt: Date

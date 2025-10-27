# ERP 系統資料結構設計

## 員工（Employee）
- id: string
- name: string
- department: string
- position: string
- hireDate: Date
- salary: number
- attendance: {
    records: Array<{ date: Date, type: string }>
    leave: Array<{ type: string, start: Date, end: Date }>
  }

## 財務（Finance）
- id: string
- type: string (收入/支出)
- amount: number
- date: Date
- account: string
- description: string

## 採購（Purchase）
- id: string
- supplierId: string
- items: Array<{ productId: string, qty: number, price: number }>
- total: number
- status: string
- createdAt: Date

## 庫存（Inventory）
- id: string
- productId: string
- location: string
- qty: number
- updatedAt: Date

## 生產（Production）
- id: string
- productId: string
- schedule: {
    start: Date
    end: Date
  }
- status: string
- cost: number

## 行政（Admin）
- id: string
- type: string (公文/資產/會議)
- title: string
- status: string
- createdAt: Date

## 使用者（User）
- id: string
- name: string
- role: string
- email: string
- password: string (hash)
- createdAt: Date
- updatedAt: Date

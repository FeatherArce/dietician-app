This is a dynamic website for 'Dietician'.


## Frameworks
- [Next.js](https://nextjs.org)
- [DaisyUI](https://daisyui.com)
- [Tailwind CSS](https://tailwindcss.com)

## Packages
- react
- react-dom
- react-icons
- swr
- prisma / @prisma/client
- next-auth
- zustand
- xlsx
- zod
- dotenv
- bcryptjs
- better-sqlite3
- crypto-js
- jsonwebtoken
- @supabase/supabase-js

## Commands

```bash
pnpm dev                # 開發模式 (Turbopack)
pnpm dev:legacy         # 傳統 Next.js 開發模式
pnpm build              # 建置專案
pnpm start              # 啟動 production server
pnpm lint               # 執行 ESLint
pnpm db:generate        # 產生 Prisma Client
pnpm db:push            # 推送 schema 至資料庫
pnpm db:migrate         # 開發資料庫 migration
pnpm db:deploy          # 部署 migration
pnpm db:reset           # 重設資料庫
pnpm db:seed            # 執行 Prisma seeding
pnpm db:seed-complete   # 完整 lunch seeding
pnpm db:studio          # 開啟 Prisma Studio
pnpm db:init            # 初始化 SQLite DB
pnpm seed:create-admin  # 建立管理員帳號
pnpm seed:create-test   # 建立測試使用者帳號
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

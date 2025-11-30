將遠端資料庫與目前的 prisma schema 比對差異，並產生差異的 sql
1. 若使用 multiple schema files，`--to-schema-datamodel`則只要指定到資料夾即可
2. `--from-empty` 是從初始建立資料庫，`--from-url` 是指定資料庫

```bash
npx prisma migrate diff --from-url="postgresql://連線字串" --to-schema-datamodel=prisma/postgres/ --script > baseline.sql
```


---

# 備份資料庫（推薦在進行 schema 變更前操作）

建議在執行 migration 或 baseline 前，先備份一次資料庫，避免意外遺失資料。

## 使用 pg_dump 備份 Supabase PostgreSQL

1. **安裝 PostgreSQL 工具**（如尚未安裝，可至 https://www.postgresql.org/download/ 下載安裝）
2. **取得連線資訊**：可從 .env 檔的 `DIRECT_URL` 拆解出 host、port、user、password、dbname。
3. **在本機命令列執行**（以 Windows PowerShell 為例）：

	```powershell
	pg_dump --host=你的host --port=5432 --username=你的user --dbname=你的db --format=custom --file=backup.dump
	```
	執行時會要求輸入密碼（.env 連線字串中的 password）。

4. **備份完成後**，會產生一個 backup.dump 檔案，可用於日後還原。

> 注意：pg_dump 只能在本機命令列執行，不能在 Supabase SQL Editor 執行。


---

# 新增必填欄位（NOT NULL）時的注意事項

如果 migration 新增了必填（NOT NULL）欄位，舊資料必須有值，否則 migration 會失敗。

常見做法：

1. **直接給新欄位設預設值**（@default）：
	```prisma
	someField String @default("defaultValue")
	```
	這樣舊資料會自動填入預設值。

2. **先設為 nullable，補齊資料後再改成必填**：
	- 先加欄位（nullable）
	- 用 SQL 或程式補齊舊資料
	- 再改 schema 為 NOT NULL，產生第二個 migration

> 小提醒：務必檢查舊資料，避免 migration 失敗。
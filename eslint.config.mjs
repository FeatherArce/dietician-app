import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // 忽略 Prisma 生成的文件
      "prisma-generated/**",
      "**/prisma-generated/**",
    ],
  },
  // 使用 Next.js 的推薦規則
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 在 useCallback 和 useMemo 的依賴項中允許省略變量
      "react-hooks/exhaustive-deps": 'warn',
    },
  }
];

export default eslintConfig;

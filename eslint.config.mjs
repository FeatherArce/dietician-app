import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from 'eslint-plugin-react-hooks';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})


const eslintConfig = [
  // 使用 Next.js 的推薦規則
  ...compat.config({
    extends: ['next/typescript'],  // next/core-web-vitals 會出錯
  }),
  reactHooks.configs.flat.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // 在 useCallback 和 useMemo 的依賴項中允許省略變量
      "react-hooks/exhaustive-deps": 'warn',
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "next-env.d.ts",
      "prisma-generated/**",
    ],
  },
];

export default eslintConfig;
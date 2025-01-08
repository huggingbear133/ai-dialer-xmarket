// next.config.ts
import { defineConfig } from 'next';

export default defineConfig({
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during production builds
    // Optional: customize specific ESLint rules to suppress warnings or errors
    // rules: {
    //   "react-hooks/exhaustive-deps": "warn", // turn it into a warning
    //   "@typescript-eslint/no-unused-vars": "warn", // turn unused-vars into a warning
    // }
  },
});

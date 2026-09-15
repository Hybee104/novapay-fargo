import nextConfig from "eslint-config-next";

// eslint-config-next 16 ships a native flat config array, so we spread it
// directly instead of using FlatCompat (which crashes with plugin circular
// references on this eslint 9 + plugin-react combination).
const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
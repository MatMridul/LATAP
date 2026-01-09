import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextConfig from 'eslint-config-next'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // React 19 specific rules
      'react/no-deprecated': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'off',
      // ESLint 9 compatibility
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
    },
  },
]

export default eslintConfig

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/coverage/**',
            '**/out-tsc/**',
            '**/build/**',
            'apps/frontend/src/app/shared/libs/ui/**',
        ],
    },
    // Configuration de base pour tous les fichiers JS/TS
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,js}'],
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            'prefer-const': 'warn',
            'no-undef': 'off',
        },
    },
    // Configuration spécifique pour le backend (Node.js)
    {
        files: ['apps/backend/**/*.{ts,js}'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    // Configuration spécifique pour le frontend (Angular/Browser)
    {
        files: ['apps/frontend/**/*.{ts,js}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
    },
    prettier,
    skipFormatting
);

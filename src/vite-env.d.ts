/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_ADMIN_EMAILS?: string;
	readonly VITE_ADMIN_MAIL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

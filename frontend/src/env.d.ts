/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  // Agrega aquí otras variables si las tienes
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
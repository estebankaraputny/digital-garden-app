/// <reference types="astro/client" />
/// <reference types="vite/client" />

declare module '*.astro' {
  import type { ComponentType } from 'astro';
  const component: ComponentType;
  export default component;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

declare module 'astro:assets' {
  export const Image: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// @ts-check
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({

  output: 'server',
  devToolbar: {
    enabled: false
  },

  env: {
    schema: {
      // Nota: He cambiado los nombres para que coincidan con tu archivo .env
      // y he cambiado el acceso a 'secret' y el contexto a 'server'.

      EMAILJS_SERVICE_ID: envField.string({ 
        context: 'server', 
        access: 'secret', 
        optional: false 
      }),

      EMAILJS_TEMPLATE_ID: envField.string({ 
        context: 'server', 
        access: 'secret', 
        optional: false 
      }),

      EMAILJS_PUBLIC_KEY: envField.string({ 
        context: 'server', 
        access: 'secret', 
        optional: false 
      }),

      // Agregamos la Private Key que faltaba
      EMAILJS_PRIVATE_KEY: envField.string({ 
        context: 'server', 
        access: 'secret', 
        optional: false 
      }),
    }
  }
});
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  // Usamos la configuración recomendada de Astro
  ...eslintPluginAstro.configs.recommended,
  {
    // Aquí sobreescribimos las reglas que no nos gustan
    rules: {
      "no-console": "off", 
      "no-unused-vars": "warn" 
    }
  }
];
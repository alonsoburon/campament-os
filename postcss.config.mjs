// postcss.config.mjs

/**
 * @typedef {{ plugins: Record<string, unknown> }} PostcssConfig
 */

/** @type {PostcssConfig} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Autoprefixer ya no es estrictamente necesario ya que Tailwind v4 maneja
    // los prefijos, pero no hace daño tenerlo por si escribes CSS personalizado.
    autoprefixer: {},
  },
};

export default config;
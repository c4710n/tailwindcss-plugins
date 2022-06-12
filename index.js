const plugin = require('tailwindcss/plugin')
const postcss = require('postcss')

/**
 * Make utilities device type sensitive.
 */
export const pluginDeviceType = plugin(function ({ addVariant }) {
  addVariant('app', 'html[data-device-type="app"] &')
  addVariant('browser', 'html[data-device-type="browser"] &')
})

/**
 * Make utilities theme-sensitive by using `theme` variant.
 *
 * ## Usage
 *
 * At first, a color object following fixed convention should be added. Here we
 * will declare a color object called `brand`:
 *
 *     module.exports = {
 *       // ...
 *       theme: {
 *         extend: {
 *           colors: {
 *             brand: {
 *               DEFAULT: 'transparent',
 *               light: '#E5881E',
 *               dark: '#C77D28',
 *             }
 *           }
 *         }
 *       }
 *       // ...
 *     }
 *
 * There are three shades in the above color object:
 * + DEFAULT - a placeholder for telling TailwindCSS that it shouldn't purge something
 *   like `bg-brand`. In theory, its value is arbitrary. But, in order to avoid
 *   misuse, `transparent` is an ideal value.
 * + light - the shade for light mode.
 * + dark - the shade for dark mode.
 *
 * Then, we can use `theme` variant for utilities as normal. For example:
 * + `theme:bg-brand`
 * + `theme:bg-text-brand`
 * + ...
 *
 *
 * ## More Details
 *
 * The `theme` variant works in a similar way to other variants, but with a slight
 * difference.
 *
 * For normal usage of other variants, they modify the selector without touching
 * the rules. For example: `hover:bg-orange` will result following CSS:
 *
 *     hover\:bg-orange:hover {
 *       // the rules of bg-orange
 *     }
 *
 * But, for `theme` variant, it modifies the rules without touching the selector.
 * For example, `theme:bg-orange` will result following CSS:
 *
 *     theme:bg-orange {
 *       @apply bg-orange-light;
 *       @apply dark:bg-orange-dark;
 *     }
 *
 * Then, the `@apply` directive will be handled by TailwindCSS.
 *
 * You can think `theme` variant as a shortcut for calling multiple `@apply`, but
 * in HTML, intead of a standalone CSS file.
 */
export const pluginTheme = plugin(function ({ addVariant }) {
  addVariant('theme', (api) => {
    const { container } = api

    container.walkRules((rule) => {
      const classCandidate = extractClassCandidate(rule)
      clearRule(rule)
      applyNewClassCandidate(rule, `${classCandidate}-light`)
      applyNewClassCandidate(rule, `dark:${classCandidate}-dark`)
      // TODO - read `important` option from config
      rule.walkDecls((decl) => {
        decl.important = true
      })
    })

    return '&'
  })
})

function extractClassCandidate(rule) {
  const {
    tailwind: { classCandidate: classCandidate },
  } = rule.raws

  return classCandidate
}

function clearRule(rule) {
  // clean all nodes in current rule
  rule.removeAll()

  return rule
}

function applyNewClassCandidate(rule, newClassCandidate) {
  // apply new TailwindCSS class
  rule.append(postcss.atRule({ name: 'apply', params: newClassCandidate }))

  return rule
}

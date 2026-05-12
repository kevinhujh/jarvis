import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import './index.css'
import App from './App.tsx'
import ThemeProvider from './content/contexts/theme/ThemeProvider'

// Wrap every emotion-injected rule in `@layer mui { ... }` at insertion time.
// Tried a stylis middleware plugin first, but emotion places `stringify` AFTER
// any user plugins in the middleware chain, so `element.return` is empty when
// the plugin runs and the wrap is silently dropped. Patching `sheet.insert`
// after createCache gives us the final serialized rule to wrap, which the
// CSS engine then merges across multiple @layer mui declarations per spec.
//
// `prepend` is intentionally OFF (default false). With it on, emotion would
// insert at the top of <head>, BEFORE index.css. CSS cascade-layer order is
// established by first occurrence — if emotion's `@layer mui` appears before
// our `@layer theme, base, components, mui, utilities;` declaration, mui
// gets locked into position 0 (lowest priority) and our intended order can
// never apply. With prepend off, index.css loads first and establishes the
// correct layer order; subsequent emotion @layer mui blocks just append rules
// to the existing layer at its proper position (above base, below utilities).
const muiCache = createCache({
  key: 'mui',
})

const originalInsert = muiCache.sheet.insert.bind(muiCache.sheet)
muiCache.sheet.insert = (rule: string) => {
  // @import / @charset must remain at the stylesheet root, unwrapped.
  if (rule.startsWith('@import') || rule.startsWith('@charset')) {
    originalInsert(rule)
  } else {
    originalInsert(`@layer mui{${rule}}`)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={muiCache}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>,
)

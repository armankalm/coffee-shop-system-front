import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders the initialized dark app shell', () => {
    const markup = renderToStaticMarkup(<App />)

    expect(markup).toContain('drinkit')
    expect(markup).toContain('Dark app shell')
  })
})

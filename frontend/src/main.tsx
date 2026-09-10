import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* HashRouter (urls like /#/leaderboard) needs no server-side rewrite rule,
          which is what makes client-side routing work on static hosts like
          GitHub Pages. Switch back to BrowserRouter only if you set up the
          404.html redirect trick instead. */}
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
)

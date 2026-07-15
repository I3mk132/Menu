import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './i18n'
import './index.css'
import { loadTenantBranding } from './branding/loadBranding'
import { TenantProvider } from './context/TenantContext'

// Resolve tenant branding (title, favicon, meta, colors data) BEFORE the
// app renders, so the very first paint already reflects the correct
// tenant — no flash of default branding, no second network round trip
// inside a mounted component.
loadTenantBranding().then((tenant) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <TenantProvider initialTenant={tenant}>
          <App />
        </TenantProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
})

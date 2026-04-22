import { useEffect, useState } from 'react'
import './App.css'
import { Toaster, toast } from 'sonner'

const TOAST_STYLES = {
  light: {
    name: 'Emerald Glass',
    success: {
      background: 'linear-gradient(140deg, rgba(6,95,70,0.92), rgba(13,148,136,0.95))',
      color: '#ecfeff',
      border: '1px solid rgba(153,246,228,0.55)',
      backdropFilter: 'blur(8px)',
    },
    error: {
      background: 'linear-gradient(140deg, rgba(127,29,29,0.95), rgba(190,24,93,0.95))',
      color: '#fff1f2',
      border: '1px solid rgba(254,205,211,0.55)',
      backdropFilter: 'blur(8px)',
    },
  },
  dark: {
    name: 'Midnight Lux',
    success: {
      background: 'linear-gradient(135deg, #0b1120, #134e4a)',
      color: '#ccfbf1',
      border: '1px solid rgba(45,212,191,0.4)',
    },
    error: {
      background: 'linear-gradient(135deg, #0b1120, #4c0519)',
      color: '#ffe4e6',
      border: '1px solid rgba(244,63,94,0.4)',
    },
  },
}

const mockApiRequest = (shouldFail = false) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Database timeout'))
      } else {
        resolve({ ok: true })
      }
    }, 1200)
  })

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const activeTheme = TOAST_STYLES[theme]

  const successToast = (title, description, options = {}) => {
    toast.success(title, {
      description,
      style: activeTheme.success,
      ...options,
    })
  }

  const errorToast = (title, description, options = {}) => {
    toast.error(title, {
      description,
      style: activeTheme.error,
      ...options,
    })
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const notifyUserCreated = () => {
    successToast('User created successfully', 'Inserted in PostgreSQL with Prisma ORM.')
  }

  const notifyDataSaved = () => {
    successToast('Project saved', 'All changes are synced to the server.', {
      action: {
        label: 'View',
        onClick: () => toast.message('Opening project details...'),
      },
    })
  }

  const notifyValidationError = () => {
    errorToast('Validation failed', 'Email format is invalid. Please fix and submit again.', {
      cancel: {
        label: 'Fix form',
        onClick: () => toast.message('Form focused for editing.'),
      },
    })
  }

  const notifyServerError = () => {
    errorToast('Server error while saving order', 'Could not reach API. Check DB connection and try again.', {
      action: {
        label: 'Retry',
        onClick: () => {
          notifyAsyncFlow(false)
        },
      },
    })
  }

  const notifyAsyncFlow = async (forceSuccess = null) => {
    const shouldFail = forceSuccess === null ? Math.random() > 0.5 : !forceSuccess
    const loadingId = toast.loading('Saving with Prisma...', {
      style: activeTheme.success,
    })

    try {
      await mockApiRequest(shouldFail)
      toast.dismiss(loadingId)
      successToast('Saved successfully.', 'Transaction committed in PostgreSQL.')
    } catch {
      toast.dismiss(loadingId)
      errorToast('Save failed.', 'Rollback completed and no data was persisted.')
    }
  }

  return (
    <main className={`page ${theme}`}>
      <Toaster
        position="top-right"
        theme={theme}
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: 'toast-card',
            title: 'toast-title',
            description: 'toast-description',
            actionButton: 'toast-action',
            cancelButton: 'toast-cancel',
          },
        }}
      />

      <section className="hero">
        <div className="topbar">
          <p className="eyebrow">React + Sonner Playground</p>
          <button className="toggle-btn" onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
          </button>
        </div>
        <h1>Toast notifications for success and error flows</h1>
        <p className="subtitle">
          Light theme uses <strong>Emerald Glass</strong>. Dark theme uses{' '}
          <strong>Midnight Lux</strong>.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Success toasts</h2>
          <p>Common patterns after create, update, and async completion.</p>
          <div className="actions">
            <button onClick={notifyUserCreated}>User Created</button>
            <button onClick={notifyDataSaved}>Saved With Action</button>
            <button onClick={notifyAsyncFlow}>Async Success/Error</button>
          </div>
        </article>

        <article className="card">
          <h2>Error toasts</h2>
          <p>Validation and backend failures with retry or fix actions.</p>
          <div className="actions">
            <button onClick={notifyValidationError}>Validation Error</button>
            <button onClick={notifyServerError}>Server Error + Retry</button>
            <button onClick={() => notifyAsyncFlow()}>Async Success/Error</button>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App

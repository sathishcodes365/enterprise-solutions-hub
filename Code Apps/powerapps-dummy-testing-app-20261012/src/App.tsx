import { useMemo, useState, type FormEvent } from 'react'
import './App.css'

type Feature = {
  id: string
  icon: string
  category: string
  title: string
  description: string
  detail: string
}

type Activity = {
  id: number
  title: string
  detail: string
  time: string
}

type Page = 'overview' | 'features' | 'activity' | 'connectors'

type Connector = {
  name: string
  category: string
  description: string
  icon: string
  style: number
}

const features: Feature[] = [
  {
    id: 'interface',
    icon: 'UI',
    category: 'DESIGN SYSTEM',
    title: 'Responsive interface',
    description: 'A flexible layout that adapts from desktop to mobile.',
    detail: 'Layout check passed',
  },
  {
    id: 'state',
    icon: 'ST',
    category: 'APP LOGIC',
    title: 'Interactive state',
    description: 'Update cards and progress instantly with local React state.',
    detail: 'State update check passed',
  },
  {
    id: 'forms',
    icon: 'FM',
    category: 'USER INPUT',
    title: 'Form validation',
    description: 'Try a short note to see required-field validation in action.',
    detail: 'Form interaction check passed',
  },
  {
    id: 'theme',
    icon: 'TH',
    category: 'ACCESSIBILITY',
    title: 'System theme',
    description: 'Uses your device preference for light or dark appearance.',
    detail: 'Theme preference check passed',
  },
]

const starterActivity: Activity[] = [
  {
    id: 1,
    title: 'Demo workspace is ready',
    detail: 'All sample data stays in this browser session.',
    time: 'Just now',
  },
]

const connectors: Connector[] = [
  { name: 'Microsoft Dataverse', category: 'DATA', description: 'Store and manage business records in Power Platform.', icon: 'DV', style: 0 },
  { name: 'SharePoint', category: 'FILES & DATA', description: 'Work with SharePoint lists, libraries, and documents.', icon: 'SP', style: 1 },
  { name: 'Microsoft Teams', category: 'COLLABORATION', description: 'Send messages and work with Teams channels.', icon: 'TM', style: 2 },
  { name: 'Excel Online (Business)', category: 'PRODUCTIVITY', description: 'Read and update workbook data stored in Microsoft 365.', icon: 'XL', style: 3 },
  { name: 'OneDrive for Business', category: 'FILES', description: 'Upload, download, and manage business files.', icon: 'OD', style: 1 },
  { name: 'Office 365 Outlook', category: 'PRODUCTIVITY', description: 'Work with email, calendars, and events.', icon: 'OL', style: 0 },
  { name: 'Azure DevOps', category: 'DEVELOPMENT', description: 'Access work items, bugs, builds, and pipelines.', icon: 'AD', style: 2 },
  { name: 'Copilot Studio', category: 'AI & AUTOMATION', description: 'Connect the app to an agent built with Copilot Studio.', icon: 'CS', style: 3 },
  { name: 'Work IQ', category: 'AI & SEARCH', description: 'Search Microsoft 365 knowledge with grounded AI answers.', icon: 'WI', style: 0 },
]

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview')
  const [completedChecks, setCompletedChecks] = useState<string[]>([])
  const [activity, setActivity] = useState(starterActivity)
  const [search, setSearch] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const visibleFeatures = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return features

    return features.filter((feature) =>
      `${feature.title} ${feature.category} ${feature.description}`
        .toLowerCase()
        .includes(query),
    )
  }, [search])

  function navigateTo(page: Page) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addActivity(title: string, detail: string) {
    setActivity((items) => [
      {
        id: Date.now(),
        title,
        detail,
        time: new Intl.DateTimeFormat(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date()),
      },
      ...items,
    ].slice(0, 5))
  }

  function runCheck(feature: Feature) {
    setCompletedChecks((checks) =>
      checks.includes(feature.id) ? checks : [...checks, feature.id],
    )
    setNotice(`${feature.title} check completed.`)
    addActivity(feature.title, feature.detail)
  }

  function runAllChecks() {
    setCompletedChecks(features.map((feature) => feature.id))
    setNotice('All feature checks passed.')
    addActivity('All feature checks passed', 'The demo suite completed successfully.')
  }

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = note.trim()
    if (!value) {
      setFormError('Enter a note before adding it to the demo activity.')
      setNotice('')
      return
    }

    addActivity('Sample note added', value)
    setNote('')
    setFormError('')
    setNotice('Your note was added to the local demo activity.')
  }

  function resetDemo() {
    setCompletedChecks([])
    setActivity(starterActivity)
    setSearch('')
    setNote('')
    setFormError('')
    setNotice('Demo data has been reset.')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="CodeLab home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span className="brand-copy">
            <strong>CodeLab</strong>
            <span>POWER APPS DEMO</span>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button
            aria-current={currentPage === 'overview' ? 'page' : undefined}
            className={`nav-link${currentPage === 'overview' ? ' active' : ''}`}
            onClick={() => navigateTo('overview')}
            type="button"
          >
            <span aria-hidden="true">▦</span> Overview
          </button>
          <button
            aria-current={currentPage === 'features' ? 'page' : undefined}
            className={`nav-link${currentPage === 'features' ? ' active' : ''}`}
            onClick={() => navigateTo('features')}
            type="button"
          >
            <span aria-hidden="true">◇</span> Feature lab
          </button>
          <button
            aria-current={currentPage === 'activity' ? 'page' : undefined}
            className={`nav-link${currentPage === 'activity' ? ' active' : ''}`}
            onClick={() => navigateTo('activity')}
            type="button"
          >
            <span aria-hidden="true">◷</span> Activity
          </button>
          <button
            aria-current={currentPage === 'connectors' ? 'page' : undefined}
            className={`nav-link${currentPage === 'connectors' ? ' active' : ''}`}
            onClick={() => navigateTo('connectors')}
            type="button"
          >
            <span aria-hidden="true">⊞</span> Supported connectors
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="local-card">
            <span className="local-indicator" />
            <div>
              <strong>Local demo</strong>
              <span>No environment connected</span>
            </div>
          </div>
          <div className="version-label">DUMMY TESTING APP <span>v0.1.0</span></div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {currentPage === 'features' ? 'Feature lab' : currentPage === 'activity' ? 'Activity' : currentPage === 'connectors' ? 'Supported connectors' : 'Overview'}</div>
          <div className="topbar-right">
            <span className="local-pill"><span className="local-indicator" /> Running locally</span>
            <span className="avatar" aria-label="Demo user">D</span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">{currentPage === 'features' ? 'HANDS-ON EXPLORATION' : currentPage === 'activity' ? 'YOUR SESSION HISTORY' : currentPage === 'connectors' ? 'POWER PLATFORM ECOSYSTEM' : 'YOUR POWER APPS PLAYGROUND'}</div>
              <h1>{currentPage === 'features' ? <>Feature lab<span>.</span></> : currentPage === 'activity' ? <>Recent activity<span>.</span></> : currentPage === 'connectors' ? <>Supported connectors<span>.</span></> : <>Explore code apps<span>.</span></>}</h1>
              <p className="welcome-copy">
                {currentPage === 'features'
                  ? 'Try the sample interactions and explore what a code app can do.'
                  : currentPage === 'activity'
                    ? 'Review the actions and test results from this local demo session.'
                    : currentPage === 'connectors'
                      ? 'Explore common services that can connect to a Power Apps code app.'
                      : 'A safe little workspace to explore app features, try interactions, and see what changes.'}
              </p>
            </div>
            <button className="button button-secondary reset-button" onClick={resetDemo} type="button">
              <span aria-hidden="true">↻</span> Reset demo
            </button>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span className="notice-check" aria-hidden="true">✓</span>
              {notice}
              <button aria-label="Dismiss message" onClick={() => setNotice('')} type="button">×</button>
            </div>
          )}

          {currentPage === 'overview' && <section className="stats-grid" aria-label="Demo summary">
            <article className="stat-card">
              <div className="stat-top"><span>CHECKS PASSED</span><span className="stat-icon green">✓</span></div>
              <div className="stat-value">{completedChecks.length}<span> / {features.length}</span></div>
              <div className="stat-foot">Feature checks completed</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>DEMO FEATURES</span><span className="stat-icon violet">✳</span></div>
              <div className="stat-value">{features.length}</div>
              <div className="stat-foot">Ready for you to explore</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>DATA SOURCE</span><span className="stat-icon blue">⌘</span></div>
              <div className="stat-value stat-text">Sample data</div>
              <div className="stat-foot">Stored only in app memory</div>
            </article>
          </section>}

          {(currentPage === 'overview' || currentPage === 'features') && <section className="feature-section" id="feature-lab">
            <div className="section-heading">
              <div>
                <div className="eyebrow">{currentPage === 'features' ? 'SAMPLE CHECKS' : 'HANDS-ON EXPLORATION'}</div>
                <h2>{currentPage === 'features' ? 'Available checks' : 'Feature lab'}</h2>
                <p>
                  {currentPage === 'features'
                    ? 'Pick a feature to try a small interaction. Nothing connects to a live environment.'
                    : 'Pick a feature to try a small interaction. Nothing here connects to a live environment.'}
                </p>
              </div>
              <button className="button button-primary" onClick={runAllChecks} type="button">
                <span aria-hidden="true">▶</span> Run all checks
              </button>
            </div>

            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search features"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search features..."
                type="search"
                value={search}
              />
              <kbd>⌘ K</kbd>
            </label>

            <div className="feature-grid">
              {visibleFeatures.map((feature, index) => {
                const passed = completedChecks.includes(feature.id)
                return (
                  <article className="feature-card" key={feature.id}>
                    <div className="feature-card-top">
                      <span className={`feature-icon feature-icon-${index % 4}`}>{feature.icon}</span>
                      <span className={`status-badge ${passed ? 'passed' : ''}`}>
                        <span /> {passed ? 'Passed' : 'Ready'}
                      </span>
                    </div>
                    <div className="feature-category">{feature.category}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <button
                      className="text-button"
                      onClick={() => runCheck(feature)}
                      type="button"
                    >
                      {passed ? 'Run again' : 'Try feature'} <span aria-hidden="true">→</span>
                    </button>
                  </article>
                )
              })}
              {visibleFeatures.length === 0 && (
                <div className="empty-state">No features match “{search}”. Try another search.</div>
              )}
            </div>
          </section>}

          {currentPage === 'connectors' && <section className="feature-section connector-section" aria-labelledby="connector-heading">
            <div className="section-heading">
              <div>
                <div className="eyebrow">CONNECTOR CATALOG</div>
                <h2 id="connector-heading">Popular integrations</h2>
                <p>This is an informational demo catalog; no connections are configured in this local app.</p>
              </div>
              <span className="catalog-count">{connectors.length} examples</span>
            </div>
            <div className="connector-grid">
              {connectors.map((connector) => (
                <article className="feature-card connector-card" key={connector.name}>
                  <div className="feature-card-top">
                    <span className={`feature-icon feature-icon-${connector.style}`}>{connector.icon}</span>
                    <span className="status-badge"><span /> Example</span>
                  </div>
                  <div className="feature-category">{connector.category}</div>
                  <h3>{connector.name}</h3>
                  <p>{connector.description}</p>
                </article>
              ))}
            </div>
            <p className="catalog-note">
              Connector availability depends on your Power Platform environment, licensing, permissions, and configured connections.
            </p>
          </section>}

          {(currentPage === 'overview' || currentPage === 'features' || currentPage === 'activity') && <section className="lower-grid">
            {(currentPage === 'overview' || currentPage === 'features') &&
            <article className="panel note-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">INTERACTIVE SAMPLE</div>
                  <h2>Try a quick note</h2>
                </div>
                <span className="panel-icon">✎</span>
              </div>
              <p className="panel-description">Test a simple form and validation. Your note stays in this local demo.</p>
              <form className="note-form" onSubmit={submitNote}>
                <label htmlFor="demo-note">Your note</label>
                <div className="note-input-row">
                  <input
                    id="demo-note"
                    onChange={(event) => {
                      setNote(event.target.value)
                      if (formError) setFormError('')
                    }}
                    placeholder="Type something to test..."
                    value={note}
                  />
                  <button className="button button-primary" type="submit">Add note</button>
                </div>
                {formError && <div className="form-error" role="alert">{formError}</div>}
              </form>
            </article>}

            {(currentPage === 'overview' || currentPage === 'activity') &&
            <article className="panel activity-panel" id="activity">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">THIS SESSION</div>
                  <h2>Recent activity</h2>
                </div>
                <span className="activity-count">{activity.length}</span>
              </div>
              <div className="activity-list">
                {activity.map((item) => (
                  <div className="activity-item" key={item.id}>
                    <span className="activity-dot" />
                    <div className="activity-copy">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <time>{item.time}</time>
                  </div>
                ))}
              </div>
            </article>}
          </section>}

          <footer className="page-footer">
            <span><span className="local-indicator" /> Demo mode · Changes reset when you refresh</span>
            <span>Built for local exploration</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App

import React from 'react'

export default function Layout({ sidebar, topbar, children }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {sidebar}
      {topbar}
      <main
        className="transition-all duration-300 pt-14"
        style={{ paddingLeft: 'var(--sidebar-width, 220px)' }}
      >
        <div className="p-6 max-w-7xl mx-auto module-transition">
          {children}
        </div>
      </main>
    </div>
  )
}

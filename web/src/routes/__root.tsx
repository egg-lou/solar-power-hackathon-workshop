import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen lumenlogs-bg safe-area-padding">
      <Header />
      <main className="relative">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
})

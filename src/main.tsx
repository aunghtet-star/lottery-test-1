import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage';
import { BetEntryPage } from '@/pages/BetEntryPage';
import { LedgerPage } from '@/pages/LedgerPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { LimitsPage } from '@/pages/LimitsPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "entry", element: <BetEntryPage /> },
      { path: "ledger", element: <LedgerPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "limits", element: <LimitsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ]
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)
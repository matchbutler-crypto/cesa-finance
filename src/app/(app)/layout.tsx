import { Sidebar } from '@/components/cesa/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cesa-app">
      <Sidebar />
      <main className="cesa-main">{children}</main>
    </div>
  )
}

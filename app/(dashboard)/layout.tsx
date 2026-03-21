import Header from '../header'
import MenuSidebar from '../menu-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <header>
        <Header />
      </header>
      <div className="flex flex-1">
        <aside className="w-64 flex-shrink-0 bg-stone-900 text-stone-50 overflow-y-auto">
          <MenuSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}

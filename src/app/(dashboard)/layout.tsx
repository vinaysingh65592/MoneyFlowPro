import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { BottomNav } from "@/components/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <MobileNav />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

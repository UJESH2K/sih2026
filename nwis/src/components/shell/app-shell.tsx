import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Tour } from "@/components/tour/tour";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="relative min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Tour />
    </div>
  );
}

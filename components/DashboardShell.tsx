import DashboardShellClient from "./DashboardShellClient";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardShellClient>{children}</DashboardShellClient>
    </div>
  );
}

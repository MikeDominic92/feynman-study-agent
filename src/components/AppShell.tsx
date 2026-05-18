import Link from "next/link";
import { navItems } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link href="/" className="brand-mark" aria-label="Feynman Study Agent">
          <span className="brand-symbol">F</span>
          <span>
            <strong>Feynman</strong>
            <small>Study Agent</small>
          </span>
        </Link>
        <nav className="nav-list">
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} className="nav-link" key={item.href}>
                <Icon size={17} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="content-shell">{children}</main>
    </div>
  );
}

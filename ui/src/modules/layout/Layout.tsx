import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-dot" />
          <div>
            <div className="logo-title">k8s-cleaner</div>
            <div className="logo-subtitle">Cluster Hygiene Console</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item nav-item-active" : "nav-item"
            }
          >
            仪表盘
          </NavLink>
          <NavLink
            to="/cleaners"
            className={({ isActive }) =>
              isActive ? "nav-item nav-item-active" : "nav-item"
            }
          >
            清理任务
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive ? "nav-item nav-item-active" : "nav-item"
            }
          >
            报告 / 审计
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "nav-item nav-item-active" : "nav-item"
            }
          >
            设置
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-title">SRE 视角</div>
          <div className="sidebar-footer-text">
            为集群“卫生”打造的可视化控制台。
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="main-header">
          <div className="main-header-title">k8s-cleaner 控制台</div>
          <div className="main-header-subtitle">
            统一查看 Cleaner 运行状态、清理结果和风险审计。
          </div>
        </header>
        <section className="main-content">{children}</section>
      </main>
    </div>
  );
}





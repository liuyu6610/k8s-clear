import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Menu,
  X,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const navItems = [
    { to: "/", label: "总览", icon: LayoutDashboard },
    { to: "/cleaners", label: "Cleaners", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex relative overflow-hidden">
      {/* 动态背景 */}
      <AnimatedBackground />

      {/* 侧边栏 */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : 80,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={clsx(
          "border-r border-slate-800/50 glass-strong flex flex-col relative z-10",
          "shadow-2xl shadow-black/20"
        )}
      >
        {/* Logo */}
        <motion.div
          className="h-16 flex items-center px-4 border-b border-slate-800/50"
        >
          <Link
            to="/"
            className="flex items-center gap-3 w-full"
            onClick={() => setSidebarOpen(true)}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-500/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <span className="relative z-10">K</span>
            </motion.div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="font-bold tracking-tight text-white truncate text-gradient">
                    k8s-cleaner
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    Cluster Hygiene
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        {/* 导航 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              icon={Icon}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        {/* 底部信息 */}
        <div className="px-4 py-3 border-t border-slate-800">
          {sidebarOpen ? (
            <div className="text-xs text-slate-500">
              <div className="truncate mb-1">当前路径:</div>
              <div className="truncate text-slate-400 font-mono">
                {location.pathname}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      </aside>

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* 顶部栏 */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 glass-strong sticky top-0 z-20 shadow-lg shadow-black/10"
          >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-slate-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-400" />
              )}
            </button>
            <div className="hidden sm:block text-sm text-slate-400">
              企业级集群清理 · 可视化控制台
            </div>
          </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg hover:bg-slate-800/60 transition-colors backdrop-blur-sm"
                title="刷新页面"
              >
                <RefreshCw className="w-5 h-5 text-slate-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-800/60 transition-colors backdrop-blur-sm"
                title="切换主题"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-400" />
                )}
              </motion.button>
            </div>
          </motion.header>

          {/* 内容区域 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 p-4 sm:p-6 overflow-auto relative"
          >
            <div className="max-w-7xl mx-auto relative z-10">{children}</div>
          </motion.section>
      </main>
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed?: boolean;
}

function NavItem({ to, label, icon: Icon, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 shadow-lg shadow-blue-500/20"
            : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
          collapsed && "justify-center"
        )
      }
      end={to === "/"}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10"
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
          </motion.div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10"
            >
              {label}
            </motion.span>
          )}
        </>
      )}
    </NavLink>
  );
}

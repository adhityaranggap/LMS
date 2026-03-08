import React from 'react';
import { NavLink } from 'react-router-dom';
import { syllabus } from '../data/syllabus';
import { cryptoSyllabusData } from '../data/crypto-syllabus-data';
import { Shield, Book, Menu, X, LogOut, Key, Lock, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { COURSES } from '../data/courses';
import { useProgressSummary } from '../hooks/useProgress';
import { Chatbot } from './Chatbot';
import { ChatbotProvider } from '../context/ChatbotContext';
import { NotificationBell } from './NotificationBell';

const cryptoIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Key,
  Lock,
  Cpu,
  FileCode: Key,
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { user, logout, course } = useAuth();
  const { summary } = useProgressSummary();
  const isCrypto = course === 'crypto';
  const courseInfo = COURSES[course ?? 'infosec'];

  const modules = isCrypto
    ? cryptoSyllabusData.map(m => ({ id: m.id, title: m.title, iconName: m.iconName, icon: null as null }))
    : syllabus.map(m => ({ id: m.id, title: m.title, iconName: '' as string, icon: m.icon as React.ComponentType<{ className?: string }> }));

  const visitedModules = new Set(summary.filter(s => s.visitedTabs.length > 0).map(s => s.moduleId));

  return (
    <ChatbotProvider>
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <img src="/logo.png" alt="Bina Insani" className="h-7 w-auto object-contain" />
          <span>Bina Insani LMS</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-10 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen overflow-y-auto flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Bina Insani" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-bold text-slate-900 leading-tight">Bina Insani LMS</p>
              <p className="text-xs text-slate-500">Universitas Bina Insani</p>
            </div>
          </div>
          {course && (
            <p className="text-xs font-medium text-indigo-600 mt-0.5">{courseInfo.name}</p>
          )}
        </div>

        {user && (
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              {user.photo ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={user.photo} alt="Student" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border-2 border-white shadow-sm">
                  {user.id.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Student ID</p>
                <p className="text-sm font-bold text-slate-900 truncate">{user.id}</p>
              </div>
              <div className="hidden md:block">
                <NotificationBell />
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Book className="w-4 h-4" />
            Course Overview
          </NavLink>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Modules
          </div>

          {modules.map((module) => {
            const IconComp: React.ComponentType<{ className?: string }> = isCrypto
              ? (cryptoIconMap[module.iconName] ?? Key)
              : (module.icon ?? Key);
            return (
              <NavLink
                key={module.id}
                to={`/module/${module.id}`}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-white text-indigo-700 shadow-md border border-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="relative">
                  <IconComp className="w-4 h-4 transition-colors text-slate-400 group-hover:text-indigo-500" />
                  {visitedModules.has(module.id) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <span className="truncate">{module.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* AI Chatbot */}
      <Chatbot />
    </div>
    </ChatbotProvider>
  );
};

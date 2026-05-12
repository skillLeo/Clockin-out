import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    SparklesIcon,
    SwatchIcon,
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import BrandMark from '@/Components/BrandMark';
import useBranding from '@/Components/useBranding';

const navItems = [
    { label: 'Dashboard',   route: 'admin.dashboard',         icon: HomeIcon },
    { label: 'Visits',      route: 'admin.visits.index',      icon: ClipboardDocumentListIcon, matches: ['/admin/visits', '/admin/visit', '/admin/assignments'] },
    { label: 'Payroll',     route: 'admin.payroll.index',     icon: BanknotesIcon },
    { label: 'AI Settings', route: 'admin.ai-settings.index', icon: SparklesIcon },
    { label: 'Branding',    route: 'admin.branding.index',    icon: SwatchIcon },
];

function useBrand() {
    return useBranding();
}

function Sidebar({ currentPath, onClose }) {
    const { auth } = usePage().props;
    const brand = useBrand();

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-white/10" style={{ backgroundColor: brand.sidebar_bg }}>
            {/* Brand */}
            <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                        {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.app_name}
                                style={{ height: `${brand.logo_size ?? 40}px` }}
                                className="w-auto max-w-[80px] object-contain flex-shrink-0" />
                        ) : (
                            <div className="rounded-xl bg-white/10 p-1.5 ring-1 ring-white/10 flex-shrink-0">
                                <BrandMark color={brand.primary_color} className="h-8 w-8 flex-shrink-0" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-5 text-white">{brand.app_name}</p>
                            <p className="truncate text-xs font-medium text-slate-400">Admin Portal</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden flex-shrink-0">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Workspace
                </p>
                <div className="space-y-1.5">
                {navItems.map(({ label, route: routeName, icon: Icon, matches }) => {
                    const href = route(routeName);
                    const path = new URL(href).pathname;
                    const active = matches
                        ? matches.some((match) => currentPath.startsWith(match))
                        : currentPath === path;
                    return (
                        <Link
                            key={label}
                            href={href}
                            onClick={onClose}
                            className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                active
                                    ? 'bg-white text-slate-950 shadow-sm'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-white'}`} />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
                </div>
            </nav>

            {/* User */}
            <div className="border-t border-white/10 p-3">
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/10">
                    <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: brand.primary_color }}
                    >
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{auth.user.name}</p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <ArrowRightStartOnRectangleIcon className="h-4 w-4 flex-shrink-0" />
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = window.location.pathname;
    const brand = useBrand();

    return (
        <div
            className="flex h-screen overflow-hidden bg-slate-50"
            style={{
                '--brand-primary': brand.primary_color,
                '--brand-sidebar': brand.sidebar_bg,
            }}
        >
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar currentPath={currentPath} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:h-screen lg:w-64 lg:flex-shrink-0">
                <Sidebar currentPath={currentPath} />
            </aside>

            {/* Main */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                    {title && <h1 className="text-sm font-semibold text-slate-800 truncate">{title}</h1>}
                </header>

                <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

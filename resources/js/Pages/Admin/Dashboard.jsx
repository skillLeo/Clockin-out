import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    CalendarDaysIcon,
    UserGroupIcon,
    IdentificationIcon,
    BriefcaseIcon,
    ArrowRightIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';

const statCards = [
    {
        key: 'today_assignments',
        label: "Today's Visits",
        icon: CalendarDaysIcon,
        tone: 'bg-blue-50 text-blue-700 ring-blue-100',
    },
    {
        key: 'active_staff',
        label: 'Active Staff',
        icon: UserGroupIcon,
        tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    },
    {
        key: 'individuals',
        label: 'Individuals',
        icon: IdentificationIcon,
        tone: 'bg-violet-50 text-violet-700 ring-violet-100',
    },
    {
        key: 'services',
        label: 'Services',
        icon: BriefcaseIcon,
        tone: 'bg-amber-50 text-amber-700 ring-amber-100',
    },
];

function formatDate(date) {
    if (!date) return '-';
    return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Dashboard({ stats, assignmentTrend, nextAssignment }) {
    const maxCount = Math.max(...assignmentTrend.map((item) => item.count), 1);

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Admin Overview</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Workspace Dashboard</h2>
                <p className="mt-1 text-sm text-slate-500">Monitor schedules, staff capacity, and setup data at a glance.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ key, label, icon: Icon, tone }) => (
                    <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-3xl font-semibold tabular-nums text-slate-950">{stats[key]}</p>
                                <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
                            </div>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${tone}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-950">Visit Schedule</h3>
                            <p className="mt-1 text-xs text-slate-500">Upcoming visits for the next 7 days.</p>
                        </div>
                        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                            7 days
                        </span>
                    </div>

                    <div className="flex h-64 items-end gap-3 border-b border-slate-200 px-1 pb-4">
                        {assignmentTrend.map((item) => {
                            const height = Math.max((item.count / maxCount) * 100, item.count > 0 ? 12 : 4);

                            return (
                                <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                    <div className="flex h-52 w-full items-end justify-center rounded-lg bg-slate-50 px-2">
                                        <div
                                            className="w-full max-w-12 rounded-t-lg bg-slate-900 transition-all"
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold tabular-nums text-slate-950">{item.count}</p>
                                        <p className="text-xs font-medium text-slate-400">{item.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <aside className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-950">Next Visit</h3>
                        {nextAssignment ? (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-lg font-semibold text-slate-950">{nextAssignment.individual?.name}</p>
                                    <p className="text-sm text-slate-500">{nextAssignment.service?.name}</p>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                                    <p className="font-medium text-slate-700">{nextAssignment.staff?.name}</p>
                                    <p className="mt-0.5 text-slate-500">{formatDate(nextAssignment.date)}</p>
                                </div>
                                <button
                                    onClick={() => router.visit(route('admin.visits.index'))}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    View Visits
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
                                <CalendarDaysIcon className="mx-auto h-8 w-8 text-slate-300" />
                                <p className="mt-2 text-sm font-medium text-slate-600">No upcoming visits</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => router.visit(route('admin.payroll.index'))}
                        className="group w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                                <BanknotesIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-slate-950">Payroll Export</h3>
                                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                                </div>
                                <p className="mt-1 text-sm leading-6 text-slate-500">Download approved records when payroll is ready.</p>
                            </div>
                        </div>
                    </button>
                </aside>
            </div>
        </AdminLayout>
    );
}

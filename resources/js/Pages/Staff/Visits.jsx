import { Head, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import axios from 'axios';
import { useState } from 'react';
import {
    PlayIcon,
    ArrowRightIcon,
    CalendarDaysIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    MapPinIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

function getGps() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve({ lat: null, lng: null }),
            { timeout: 5000 },
        );
    });
}

const STATUS_CFG = {
    draft: { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: ClockIcon },
    pending_admin: { label: 'Submitted', cls: 'bg-blue-50 text-blue-700 ring-blue-200', icon: ClockIcon },
    approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircleIcon },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 ring-red-200', icon: XCircleIcon },
};

export default function Visits({ assignments }) {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const startVisit = async (id) => {
        setLoading(id);
        setError(null);
        const { lat, lng } = await getGps();

        try {
            const res = await axios.post('/api/visit/start', { assignment_id: id, lat, lng });
            router.visit(route('staff.visit.show', res.data.visit_id));
        } catch (e) {
            const status = e.response?.status;
            const msg = e.response?.data?.message ?? e.response?.data?.error ?? e.message;
            setError(`Could not start visit (${status ?? 'network error'}): ${msg}`);
            setLoading(null);
        }
    };

    return (
        <StaffLayout title="My Visits">
            <Head title="My Visits" />

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Staff Visits</p>
                        <h2 className="mt-1 text-xl font-semibold text-slate-950">Today's Visits</h2>
                        <p className="mt-1 text-sm text-slate-500">Start, continue, or review your scheduled EVV visits.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                        <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-xl font-semibold tabular-nums text-slate-950">{assignments.length}</p>
                            <p className="text-xs font-medium text-slate-500">Assigned today</p>
                        </div>
                    </div>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                        <CalendarDaysIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No visits today</p>
                    <p className="mt-1 text-xs text-slate-400">Check back tomorrow or contact your supervisor.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments.map((assignment) => {
                        const cfg = assignment.visit ? (STATUS_CFG[assignment.visit.status] ?? STATUS_CFG.draft) : null;
                        const Icon = cfg?.icon;
                        const actionLabel = assignment.visit
                            ? (assignment.visit.status === 'draft' ? 'Continue Visit' : 'View Visit')
                            : 'Start Visit';

                        return (
                            <div
                                key={assignment.id}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="mb-3 flex items-center gap-2">
                                            {assignment.visit ? (
                                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${cfg.cls}`}>
                                                    <Icon className="h-3.5 w-3.5" /> {cfg.label}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                                    <ClockIcon className="h-3.5 w-3.5" /> Not started
                                                </span>
                                            )}
                                        </div>

                                        <p className="truncate text-lg font-semibold text-slate-950">{assignment.individual}</p>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <UserIcon className="h-4 w-4 text-slate-400" />
                                                {assignment.service}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                                                {assignment.date}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                                                GPS captured at clock in/out
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-shrink-0">
                                        {assignment.visit ? (
                                            <button
                                                onClick={() => router.visit(
                                                    assignment.visit.status === 'draft'
                                                        ? route('staff.visit.show', assignment.visit.id)
                                                        : route('staff.visit.review', assignment.visit.id),
                                                )}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                                            >
                                                {actionLabel}
                                                <ArrowRightIcon className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startVisit(assignment.id)}
                                                disabled={loading === assignment.id}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                            >
                                                <PlayIcon className="h-4 w-4" />
                                                {loading === assignment.id ? 'Starting...' : actionLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </StaffLayout>
    );
}

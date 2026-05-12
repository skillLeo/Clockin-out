import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { useState } from 'react';
import {
    FunnelIcon, XMarkIcon, EyeIcon,
    CalendarDaysIcon, CheckIcon, PlusIcon,
} from '@heroicons/react/24/outline';

const STATUS = {
    scheduled:     { label: 'Scheduled', cls: 'bg-slate-100 text-slate-500' },
    draft:         { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
    pending_admin: { label: 'Pending',   cls: 'bg-blue-100 text-blue-700' },
    approved:      { label: 'Approved',  cls: 'bg-emerald-100 text-emerald-700' },
    rejected:      { label: 'Rejected',  cls: 'bg-red-100 text-red-700' },
};

function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const sel = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent';
const inp = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900';

function ScheduleModal({ staffList, individuals, services, onClose }) {
    const [form, setForm] = useState({
        staff_id:      staffList[0]?.id   ?? '',
        individual_id: individuals[0]?.id ?? '',
        service_id:    services[0]?.id    ?? '',
        date:          new Date().toISOString().slice(0, 10),
        note:          '',
    });
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);
    const [error,  setError]  = useState(null);

    const set = (key, val) => setForm(c => ({ ...c, [key]: val }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await axios.post('/api/admin/assignments', form);
            setSaved(true);
            setTimeout(onClose, 1200);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not create schedule.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Schedule Visit</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Assign a staff member to a client, service, and date.</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ml-4 flex-shrink-0">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="px-7 py-6">
                    {saved && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-5">
                            <CheckIcon className="h-4 w-4 flex-shrink-0" /> Visit scheduled successfully.
                        </div>
                    )}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5">{error}</div>
                    )}

                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Staff Member</label>
                            <select className={inp} value={form.staff_id} onChange={e => set('staff_id', e.target.value)}>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Individual (Client)</label>
                            <select className={inp} value={form.individual_id} onChange={e => set('individual_id', e.target.value)}>
                                {individuals.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Service</label>
                            <select className={inp} value={form.service_id} onChange={e => set('service_id', e.target.value)}>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                            <input type="date" className={inp} value={form.date} onChange={e => set('date', e.target.value)} />
                        </div>
                    </div>

                    {/* Row 3 — full width */}
                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Note <span className="text-slate-400 font-normal">— optional</span>
                        </label>
                        <textarea
                            rows={3}
                            className={`${inp} resize-none`}
                            placeholder="Any instructions or context for this visit…"
                            value={form.note}
                            onChange={e => set('note', e.target.value)}
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100">
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button type="submit"
                            disabled={saving || saved || !form.staff_id || !form.individual_id || !form.service_id || !form.date}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <CalendarDaysIcon className="h-4 w-4" />
                            {saving ? 'Scheduling…' : saved ? 'Scheduled!' : 'Schedule Visit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Visits({ visits, scheduled = [], filters, staffList = [], individuals = [], services = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        status:        filters.status        ?? '',
        staff_id:      filters.staff_id      ?? '',
        individual_id: filters.individual_id ?? '',
        date_from:     filters.date_from     ?? '',
        date_to:       filters.date_to       ?? '',
    });

    const apply = () => {
        const clean = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
        router.get(route('admin.visits.index'), clean, { preserveState: true });
    };

    const clear = () => {
        setForm({ status: '', staff_id: '', individual_id: '', date_from: '', date_to: '' });
        router.get(route('admin.visits.index'));
    };

    const hasFilters = Object.values(form).some(Boolean);

    return (
        <AdminLayout title="Visits">
            <Head title="Visits" />

            {showModal && (
                <ScheduleModal
                    staffList={staffList}
                    individuals={individuals}
                    services={services}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* Page header */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Admin</p>
                    <h2 className="mt-0.5 text-xl font-semibold text-slate-900">Visits</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    <PlusIcon className="h-4 w-4" />
                    Schedule Visit
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={sel}>
                            <option value="">All statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="draft">In Progress</option>
                            <option value="pending_admin">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Staff</label>
                        <select value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })} className={sel}>
                            <option value="">All staff</option>
                            {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Individual</label>
                        <select value={form.individual_id} onChange={e => setForm({ ...form, individual_id: e.target.value })} className={sel}>
                            <option value="">All individuals</option>
                            {individuals.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                        <input type="date" value={form.date_from} onChange={e => setForm({ ...form, date_from: e.target.value })} className={sel} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                        <input type="date" value={form.date_to} onChange={e => setForm({ ...form, date_to: e.target.value })} className={sel} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={apply} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors">
                        <FunnelIcon className="h-4 w-4" /> Filter
                    </button>
                    {hasFilters && (
                        <button onClick={clear} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            <XMarkIcon className="h-4 w-4" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {['Date', 'Staff', 'Individual', 'Service', 'Hours', 'Units', 'Status', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {scheduled.length === 0 && visits.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-14 text-center">
                                        <CalendarDaysIcon className="mx-auto h-8 w-8 text-slate-200 mb-3" />
                                        <p className="text-sm text-slate-400">No visits found.</p>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Schedule a Visit
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {scheduled.map(v => {
                                        const s = STATUS.scheduled;
                                        return (
                                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(v.clock_in_time)}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{v.staff}</td>
                                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{v.individual}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{v.service}</td>
                                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">—</td>
                                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">—</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${s.cls}`}>{s.label}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-300 text-xs">—</td>
                                            </tr>
                                        );
                                    })}
                                    {visits.data.map(v => {
                                        const s = STATUS[v.status] ?? { label: v.status, cls: 'bg-slate-100 text-slate-600' };
                                        return (
                                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(v.clock_in_time)}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{v.staff}</td>
                                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{v.individual}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{v.service}</td>
                                                <td className="px-4 py-3 text-slate-700 tabular-nums whitespace-nowrap">{v.total_hours_rounded ?? '—'}</td>
                                                <td className="px-4 py-3 text-slate-700 tabular-nums whitespace-nowrap">{v.total_units ?? '—'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${s.cls}`}>{s.label}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => router.visit(route('admin.visit.show', v.id))}
                                                        className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold transition-colors"
                                                    >
                                                        <EyeIcon className="h-3.5 w-3.5" /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {visits.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {visits.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${link.active ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { useState } from 'react';
import { ArrowDownTrayIcon, MagnifyingGlassIcon, ClipboardDocumentCheckIcon, ClockIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const inp = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent';

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Payroll({ staff }) {
    const [form, setForm]       = useState({ date_from: '', date_to: '', staff_id: '' });
    const [records, setRecords] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const search = async () => {
        if (!form.date_from || !form.date_to) { setError('Both date fields are required.'); return; }
        setError(null); setLoading(true);
        try {
            const params = new URLSearchParams({
                date_from: form.date_from,
                date_to:   form.date_to,
                ...(form.staff_id ? { staff_id: form.staff_id } : {}),
            });
            const { data } = await axios.get(`/api/admin/payroll/preview?${params}`);
            setRecords(data.records);
            setSummary({ hours: data.total_hours, units: data.total_units, visits: data.total_visits });
        } catch (e) {
            setError(e.response?.data?.message ?? 'Failed to load records.');
        } finally {
            setLoading(false);
        }
    };

    const download = () => {
        const params = new URLSearchParams({
            date_from: form.date_from,
            date_to:   form.date_to,
            ...(form.staff_id ? { staff_id: form.staff_id } : {}),
        });
        window.location.href = `/api/admin/payroll/export?${params}`;
    };

    const summaryCards = summary ? [
        { label: 'Total Visits',        value: summary.visits, icon: ClipboardDocumentCheckIcon },
        { label: 'Total Rounded Hours', value: summary.hours,  icon: ClockIcon },
        { label: 'Total Billing Units', value: summary.units,  icon: CalculatorIcon },
    ] : [];

    return (
        <AdminLayout title="Payroll">
            <Head title="Payroll" />

            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Admin</p>
                    <h2 className="mt-0.5 text-xl font-semibold text-slate-900">Payroll</h2>
                </div>
                {records !== null && records.length > 0 && (
                    <button onClick={download}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
                    </button>
                )}
            </div>

            {/* Filter card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 mb-5">
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date From</label>
                        <input type="date" value={form.date_from}
                            onChange={e => setForm({ ...form, date_from: e.target.value })} className={inp} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date To</label>
                        <input type="date" value={form.date_to}
                            onChange={e => setForm({ ...form, date_to: e.target.value })} className={inp} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Staff Member <span className="text-slate-400 font-normal">— optional</span>
                        </label>
                        <select value={form.staff_id}
                            onChange={e => setForm({ ...form, staff_id: e.target.value })} className={inp}>
                            <option value="">All staff</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={search} disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    {loading ? 'Loading…' : 'Search Records'}
                </button>
            </div>

            {/* Summary cards */}
            {summary && (
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {summaryCards.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tabular-nums text-slate-900 leading-tight">{value}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results table */}
            {records !== null && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">Approved Visit Records</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {records.length === 0
                                ? 'No approved visits found for the selected range.'
                                : `${records.length} record${records.length !== 1 ? 's' : ''} — ${fmtDate(form.date_from)} to ${fmtDate(form.date_to)}`}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    {['Date', 'Staff', 'Individual', 'Service', 'Rounded Hrs', 'Billing Units'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-400">
                                            No approved visits found for this date range.
                                        </td>
                                    </tr>
                                ) : records.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap font-medium">{fmtDate(r.date)}</td>
                                        <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{r.staff}</td>
                                        <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{r.individual}</td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{r.service}</td>
                                        <td className="px-5 py-3.5 text-slate-800 tabular-nums whitespace-nowrap">{r.total_hours_rounded}</td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                {r.total_units} {r.total_units === 1 ? 'unit' : 'units'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {records.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                                        <td colSpan={4} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Totals</td>
                                        <td className="px-5 py-3 font-bold text-slate-900 tabular-nums">{summary.hours}</td>
                                        <td className="px-5 py-3 font-bold text-slate-900 tabular-nums">{summary.units} units</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

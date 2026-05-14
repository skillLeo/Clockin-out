import { Head, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import axios from 'axios';
import { useState } from 'react';
import { PaperAirplaneIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function NoteCard({ label, content, color }) {
    const c = { slate: 'bg-slate-50 border-slate-200', indigo: 'bg-indigo-50 border-indigo-200', emerald: 'bg-emerald-50 border-emerald-200' };
    return (
        <div className={`rounded-lg border px-5 py-4 ${c[color] ?? c.slate}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
            {content
                ? <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{content}</p>
                : <p className="text-sm italic text-slate-400">Not available</p>
            }
        </div>
    );
}

function SummaryCard({ label, content }) {
    let sections = null;
    try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            sections = Object.entries(parsed);
        }
    } catch {}

    return (
        <div className="rounded-lg border bg-emerald-50 border-emerald-200 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">{label}</p>
            {sections ? (
                <div className="divide-y divide-emerald-100">
                    {sections.map(([key, value]) => (
                        <div key={key} className="py-3 first:pt-0 last:pb-0">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">{key}</p>
                            <p className="text-sm text-slate-800 leading-relaxed">{value}</p>
                        </div>
                    ))}
                </div>
            ) : content ? (
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{content}</p>
            ) : (
                <p className="text-sm italic text-slate-400">Not available</p>
            )}
        </div>
    );
}

const STATUS = {
    draft:         { label: 'Draft',     cls: 'bg-amber-100 text-amber-700' },
    pending_admin: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
    approved:      { label: 'Approved',  cls: 'bg-emerald-100 text-emerald-700' },
    rejected:      { label: 'Rejected',  cls: 'bg-red-100 text-red-700' },
};

export default function VisitReview({ visit }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState(null);
    const isLocked = visit.status !== 'draft';
    const s = STATUS[visit.status] ?? { label: visit.status, cls: 'bg-slate-100 text-slate-600' };

    const submit = async () => {
        setSubmitting(true); setError(null);
        try {
            await axios.post('/api/visit/submit', { visit_id: visit.id });
            router.visit(route('staff.dashboard'));
        } catch (e) {
            setError(e.response?.data?.error ?? 'Failed to submit visit.');
            setSubmitting(false);
        }
    };

    return (
        <StaffLayout title="Review & Submit">
            <Head title="Review Visit" />

            {/* Visit header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                        <p className="text-base font-semibold text-slate-900">{visit.individual}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{visit.service}</p>
                    </div>
                    <span className={`inline-flex items-center self-start px-2.5 py-1 rounded-md text-xs font-semibold ${s.cls}`}>{s.label}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 pt-4 border-t border-slate-100">
                    {[
                        { label: 'Clock In',      value: fmt(visit.clock_in_time) },
                        { label: 'Clock Out',     value: fmt(visit.clock_out_time) },
                        { label: 'Rounded Hours', value: visit.total_hours_rounded ?? '—' },
                        { label: 'Billing Units', value: visit.total_units ?? '—' },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                            <p className="text-sm font-medium text-slate-800">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

            {/* Notes */}
            <div className="space-y-3 mb-5">
                <NoteCard label="Your Original Note"    content={visit.note_staff_raw}  color="slate" />
                <NoteCard label="AI Cleaned Note"       content={visit.note_ai_cleaned} color="indigo" />
                <SummaryCard label="AI Structured Summary" content={visit.note_ai_summary} />
            </div>

            {/* Draft — submit bar */}
            {!isLocked && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-slate-500">Once submitted, your visit is locked and sent to admin for review.</p>
                    <button onClick={submit} disabled={submitting}
                        className="flex items-center justify-center gap-2 flex-shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors w-full sm:w-auto">
                        <PaperAirplaneIcon className="h-4 w-4" />
                        {submitting ? 'Submitting…' : 'Submit Visit'}
                    </button>
                </div>
            )}

            {/* Locked — status messages */}
            {isLocked && (
                <div className="space-y-3">
                    {visit.status === 'pending_admin' && (
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                            Visit submitted — awaiting admin review.
                        </div>
                    )}

                    {visit.status === 'approved' && (
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                            <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                            Visit approved by admin.
                        </div>
                    )}

                    {visit.status === 'rejected' && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-1">
                                <XCircleIcon className="h-4 w-4 flex-shrink-0" />
                                Visit rejected by admin.
                            </div>
                            {visit.admin_comment && (
                                <p className="text-sm text-red-600 ml-6 leading-relaxed">{visit.admin_comment}</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button onClick={() => router.visit(route('staff.dashboard'))}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <ArrowLeftIcon className="h-4 w-4" /> Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}

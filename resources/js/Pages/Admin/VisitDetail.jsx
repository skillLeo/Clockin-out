import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function Field({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-800 break-words">{value ?? '—'}</p>
        </div>
    );
}

function NoteContent({ value }) {
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return (
                <div className="divide-y divide-emerald-100">
                    {Object.entries(parsed).map(([key, val]) => (
                        <div key={key} className="py-3 first:pt-0 last:pb-0">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">{key}</p>
                            <p className="text-sm text-slate-800 leading-relaxed">{val}</p>
                        </div>
                    ))}
                </div>
            );
        }
    } catch {}
    return <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{value}</p>;
}

function EditableNote({ label, content, color, field, visitId, onSaved, locked }) {
    const colors = {
        slate:   { wrap: 'bg-slate-50 border-slate-200',   ring: 'focus:ring-slate-400' },
        indigo:  { wrap: 'bg-indigo-50 border-indigo-200', ring: 'focus:ring-indigo-400' },
        emerald: { wrap: 'bg-emerald-50 border-emerald-200', ring: 'focus:ring-emerald-400' },
    };
    const { wrap, ring } = colors[color] ?? colors.slate;

    const lsKey = `evv_draft_${visitId}_${field}`;

    const [editing, setEditing] = useState(false);
    const [value,   setValue]   = useState(() => {
        if (locked) return content ?? '';
        const draft = localStorage.getItem(lsKey);
        return draft !== null ? draft : (content ?? '');
    });
    const [saving,  setSaving]  = useState(false);
    const [saved,   setSaved]   = useState(false);
    const [hasDraft, setHasDraft] = useState(() =>
        !locked && localStorage.getItem(lsKey) !== null
    );

    const handleChange = (e) => {
        setValue(e.target.value);
        localStorage.setItem(lsKey, e.target.value);
        setHasDraft(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            await axios.post('/api/admin/visit/update-notes', { visit_id: visitId, [field]: value });
            localStorage.removeItem(lsKey);
            setHasDraft(false);
            setSaved(true);
            setEditing(false);
            onSaved(field, value);
            setTimeout(() => setSaved(false), 2000);
        } catch { /* keep editing open on error */ }
        finally { setSaving(false); }
    };

    const cancel = () => {
        localStorage.removeItem(lsKey);
        setHasDraft(false);
        setValue(content ?? '');
        setEditing(false);
    };

    return (
        <div className={`rounded-lg border ${wrap}`}>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    {hasDraft && !editing && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Draft</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {saved && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
                    {!locked && (
                        !editing
                            ? <button onClick={() => setEditing(true)}
                                className="rounded px-2.5 py-1 text-xs font-medium text-slate-500 border border-slate-200 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                Edit
                              </button>
                            : <div className="flex items-center gap-1.5">
                                <button onClick={cancel}
                                    className="rounded px-2.5 py-1 text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={save} disabled={saving}
                                    className="rounded px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-700 disabled:opacity-50 transition-colors">
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                    )}
                </div>
            </div>
            <div className="px-4 pb-4 pt-1">
                {!locked && editing
                    ? <textarea
                        rows={5}
                        value={value}
                        onChange={handleChange}
                        autoFocus
                        className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${ring} focus:border-transparent resize-none`}
                      />
                    : value
                        ? <NoteContent value={value} locked={locked} />
                        : <p className="text-sm italic text-slate-400">{locked ? 'Not available.' : 'Not available — click Edit to add.'}</p>
                }
            </div>
        </div>
    );
}

const STATUS = {
    draft:         { label: 'Draft',          cls: 'bg-slate-100 text-slate-600' },
    pending_admin: { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700' },
    approved:      { label: 'Approved',       cls: 'bg-emerald-100 text-emerald-700' },
    rejected:      { label: 'Rejected',       cls: 'bg-red-100 text-red-700' },
};

export default function VisitDetail({ visit }) {
    const [rejecting, setRejecting] = useState(false);
    const [comment, setComment]     = useState('');
    const [busy, setBusy]           = useState(false);
    const [error, setError]         = useState(null);
    const [notes, setNotes]         = useState({
        note_staff_raw:  visit.note_staff_raw,
        note_ai_cleaned: visit.note_ai_cleaned,
        note_ai_summary: visit.note_ai_summary,
    });
    const updateNote = (field, value) => setNotes(n => ({ ...n, [field]: value }));

    const s = STATUS[visit.status] ?? { label: visit.status, cls: 'bg-slate-100 text-slate-600' };
    const isPending = visit.status === 'pending_admin';

    const approve = async () => {
        setBusy(true); setError(null);
        try { await axios.post('/api/admin/visit/approve', { visit_id: visit.id }); router.reload(); }
        catch (e) { setError(e.response?.data?.error ?? 'Failed to approve.'); }
        finally { setBusy(false); }
    };

    const reject = async () => {
        if (!comment.trim()) return;
        setBusy(true); setError(null);
        try {
            await axios.post('/api/admin/visit/reject', { visit_id: visit.id, admin_comment: comment });
            setRejecting(false); router.reload();
        } catch (e) { setError(e.response?.data?.error ?? 'Failed to reject.'); }
        finally { setBusy(false); }
    };

    return (
        <AdminLayout title="Visit Detail">
            <Head title="Visit Detail" />

            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => router.visit(route('admin.visits.index'))}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4" /> Visits
                </button>
                <span className="text-slate-300">/</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${s.cls}`}>{s.label}</span>
            </div>

            {error && <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="space-y-4">
                {/* EVV */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">EVV Record</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        <Field label="Staff"         value={visit.staff} />
                        <Field label="Individual"    value={visit.individual} />
                        <Field label="Service"       value={visit.service} />
                        <Field label="Clock In"      value={fmt(visit.clock_in_time)} />
                        <Field label="Clock In GPS"  value={visit.clock_in_lat ? `${visit.clock_in_lat}, ${visit.clock_in_lng}` : 'Not captured'} />
                        <Field label="Clock Out"     value={fmt(visit.clock_out_time)} />
                        <Field label="Clock Out GPS" value={visit.clock_out_lat ? `${visit.clock_out_lat}, ${visit.clock_out_lng}` : 'Not captured'} />
                    </div>
                </div>

                {/* Time */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Time & Units</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Time',  value: visit.total_hours_raw },
                            { label: 'Units', value: visit.total_units },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-4 text-center">
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{value ?? '—'}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Visit Notes</p>
                    <EditableNote label="Staff Original Note"   field="note_staff_raw"  content={notes.note_staff_raw}  color="slate"   visitId={visit.id} onSaved={updateNote} locked={visit.status === 'draft'} />
                    <EditableNote label="AI Cleaned Note"       field="note_ai_cleaned" content={notes.note_ai_cleaned} color="indigo"  visitId={visit.id} onSaved={updateNote} locked={visit.status === 'draft'} />
                    <EditableNote label="AI Structured Summary" field="note_ai_summary" content={notes.note_ai_summary} color="emerald" visitId={visit.id} onSaved={updateNote} locked={visit.status === 'draft'} />
                </div>

                {visit.admin_comment && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-800">{visit.admin_comment}</p>
                    </div>
                )}

                {isPending && !rejecting && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
                        <button onClick={() => setRejecting(true)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                            <XCircleIcon className="h-4 w-4" /> Reject
                        </button>
                        <button onClick={approve} disabled={busy}
                            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                            <CheckCircleIcon className="h-4 w-4" /> {busy ? 'Approving…' : 'Approve'}
                        </button>
                    </div>
                )}

                {isPending && rejecting && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                            placeholder="Explain why this visit is being rejected…"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none" />
                        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <button onClick={() => setRejecting(false)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={reject} disabled={busy || !comment.trim()}
                                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                                {busy ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

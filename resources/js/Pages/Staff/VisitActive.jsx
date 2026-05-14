import { Head, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import axios from 'axios';
import { useState } from 'react';
import { StopCircleIcon, DocumentTextIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const ASSISTANCE_OPTIONS = [
    'Emotional support',
    'Meal clean-up',
    'Safety monitoring',
    'Transition support',
    'Shower assistance',
    'Dressing assistance',
    'Communication support',
    'Redirection',
    'Leisure activity',
    'Social engagement',
];

const defaultForm = {
    description: '',
    q951_yes: null, q951_assistance: [], q951_notes: '',
    q952_yes: null, q952_notes: '',
    q953_yes: null, q953_notes: '',
    q954_yes: null, q954_notes: '',
    q955_notes: '',
};

function buildNote(form) {
    const lines = [];

    lines.push('Description of Act/Task:');
    lines.push(form.description.trim() || '(none)');

    lines.push('');
    lines.push(`951 - What assistance was provided? ${yesNoLabel(form.q951_yes)}`);
    if (form.q951_yes === true && form.q951_assistance.length > 0) {
        form.q951_assistance.forEach(a => lines.push(`• ${a}`));
    }
    if (form.q951_notes.trim()) lines.push(`Note: ${form.q951_notes.trim()}`);

    lines.push('');
    lines.push(`952 - Were there any challenges? ${yesNoLabel(form.q952_yes)}`);
    if (form.q952_yes === true && form.q952_notes.trim()) lines.push(form.q952_notes.trim());

    lines.push('');
    lines.push(`953 - Services rendered per the ISP? ${yesNoLabel(form.q953_yes)}`);
    if (form.q953_notes.trim()) lines.push(`Note: ${form.q953_notes.trim()}`);

    lines.push('');
    lines.push(`954 - Any recommended adjustments? ${yesNoLabel(form.q954_yes)}`);
    if (form.q954_yes === true && form.q954_notes.trim()) lines.push(form.q954_notes.trim());

    lines.push('');
    lines.push('955 - Please note any progress:');
    if (form.q955_notes.trim()) lines.push(form.q955_notes.trim());

    return lines.join('\n');
}

function yesNoLabel(val) {
    return val === true ? 'Yes' : val === false ? 'No' : '';
}

function YesNo({ value, onChange }) {
    return (
        <div className="flex gap-1.5">
            {[true, false].map(v => (
                <button key={String(v)} type="button"
                    onClick={() => onChange(value === v ? null : v)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold border transition-colors ${
                        value === v
                            ? v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}>
                    {v ? 'Yes' : 'No'}
                </button>
            ))}
        </div>
    );
}

function QuestionCard({ number, question, children }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{number}</p>
            {children}
        </div>
    );
}

function getGps() {
    return new Promise(resolve => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
            p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve({ lat: null, lng: null }),
            { timeout: 5000 }
        );
    });
}

function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function VisitActive({ visit }) {
    const noteKey = `evv_staff_note_${visit.id}`;

    const [ending, setEnding]         = useState(false);
    const [saving, setSaving]         = useState(false);
    const [processing, setProcessing] = useState(false);
    const [times, setTimes]           = useState(null);
    const [aiDone, setAiDone]         = useState(false);
    const [error, setError]           = useState(null);

    const [form, setForm] = useState(() => {
        try {
            const saved = localStorage.getItem(noteKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object' && 'description' in parsed) {
                    return { ...defaultForm, ...parsed };
                }
            }
        } catch {}
        return { ...defaultForm, description: visit.note_staff_raw ?? '' };
    });

    const setField = (key, value) => {
        setForm(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem(noteKey, JSON.stringify(next));
            return next;
        });
    };

    const toggleAssistance = (item) => {
        setForm(prev => {
            const list = prev.q951_assistance.includes(item)
                ? prev.q951_assistance.filter(a => a !== item)
                : [...prev.q951_assistance, item];
            const next = { ...prev, q951_assistance: list };
            localStorage.setItem(noteKey, JSON.stringify(next));
            return next;
        });
    };

    const isClockedOut = !!visit.clock_out_time;
    const isReady = form.description.trim().length > 0;

    const endVisit = async () => {
        setEnding(true); setError(null);
        const { lat, lng } = await getGps();
        try {
            const res = await axios.post('/api/visit/end', { visit_id: visit.id, lat, lng });
            setTimes(res.data);
            router.reload({ only: ['visit'] });
        } catch (e) { setError(e.response?.data?.error ?? 'Failed to end visit.'); }
        finally { setEnding(false); }
    };

    const saveNote = async () => {
        if (!isReady) return;
        setSaving(true); setError(null);
        try {
            await axios.post('/api/visit/save-note', { visit_id: visit.id, note_staff_raw: buildNote(form) });
            localStorage.removeItem(noteKey);
        } catch (e) { setError(e.response?.data?.error ?? 'Failed to save note.'); }
        finally { setSaving(false); }
    };

    const processAi = async () => {
        if (!isReady) { setError('Please fill in the Description of Act/Task before processing.'); return; }
        setSaving(true); setError(null);
        try {
            await axios.post('/api/visit/save-note', { visit_id: visit.id, note_staff_raw: buildNote(form) });
            localStorage.removeItem(noteKey);
        } catch {}
        setSaving(false);
        setProcessing(true);
        try {
            const { data } = await axios.post('/api/ai/process-note', { visit_id: visit.id });
            if (!data.success || !data.note_ai_cleaned || !data.note_ai_summary) {
                setError('AI processing failed. Please try again before reviewing the visit.');
                setAiDone(false);
                return;
            }
            setAiDone(true);
        } catch (e) {
            setError(e.response?.data?.error ?? 'AI processing failed. Please try again before reviewing the visit.');
            setAiDone(false);
        } finally { setProcessing(false); }
    };

    const ta = 'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none';

    return (
        <StaffLayout title="Active Visit">
            <Head title="Active Visit" />

            {/* Visit header card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                        <p className="text-base font-semibold text-slate-900">{visit.individual}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{visit.service}</p>
                    </div>
                    <span className="inline-flex items-center self-start px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">
                        In Progress
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Clock In</p>
                        <p className="text-sm font-medium text-slate-800">{fmt(visit.clock_in_time)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Clock Out</p>
                        <p className="text-sm font-medium text-slate-800">{fmt(visit.clock_out_time)}</p>
                    </div>
                </div>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

            {!isClockedOut ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-slate-500">When the visit is complete, click End Visit to record your clock-out time and GPS location.</p>
                    <button onClick={endVisit} disabled={ending}
                        className="flex items-center justify-center gap-2 flex-shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors w-full sm:w-auto">
                        <StopCircleIcon className="h-4 w-4" />
                        {ending ? 'Ending…' : 'End Visit'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">

                    {/* Time summary */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Time Summary</p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                                { label: 'Raw Hours',     value: times?.total_hours_raw     ?? visit.total_hours_raw },
                                { label: 'Rounded Hours', value: times?.total_hours_rounded ?? visit.total_hours_rounded },
                                { label: 'Units',         value: times?.total_units         ?? visit.total_units },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-lg bg-slate-50 border border-slate-200 py-4 px-2">
                                    <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{value ?? '—'}</p>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                            Description of Act / Task <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-3">Describe in detail what happened during this visit.</p>
                        <textarea rows={6} value={form.description}
                            onChange={e => setField('description', e.target.value)}
                            placeholder="When I arrived, the client was…"
                            className={ta} />
                    </div>

                    {/* 951 */}
                    <QuestionCard number="951">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <p className="text-sm font-semibold text-slate-800">What assistance was provided?</p>
                            <YesNo value={form.q951_yes} onChange={v => setField('q951_yes', v)} />
                        </div>
                        {form.q951_yes === true && (
                            <>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                                    {ASSISTANCE_OPTIONS.map(opt => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox"
                                                checked={form.q951_assistance.includes(opt)}
                                                onChange={() => toggleAssistance(opt)}
                                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <input type="text" value={form.q951_notes}
                                    onChange={e => setField('q951_notes', e.target.value)}
                                    placeholder="Additional notes (optional)…"
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                            </>
                        )}
                    </QuestionCard>

                    {/* 952 */}
                    <QuestionCard number="952">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <p className="text-sm font-semibold text-slate-800">Were there any challenges?</p>
                            <YesNo value={form.q952_yes} onChange={v => setField('q952_yes', v)} />
                        </div>
                        {form.q952_yes === true && (
                            <textarea rows={3} value={form.q952_notes}
                                onChange={e => setField('q952_notes', e.target.value)}
                                placeholder="Describe the challenges…"
                                className={ta} />
                        )}
                    </QuestionCard>

                    {/* 953 */}
                    <QuestionCard number="953">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <p className="text-sm font-semibold text-slate-800">Services rendered per the ISP?</p>
                            <YesNo value={form.q953_yes} onChange={v => setField('q953_yes', v)} />
                        </div>
                        <input type="text" value={form.q953_notes}
                            onChange={e => setField('q953_notes', e.target.value)}
                            placeholder="Notes (optional)…"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                    </QuestionCard>

                    {/* 954 */}
                    <QuestionCard number="954">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <p className="text-sm font-semibold text-slate-800">Any recommended adjustments to the consumer's ISP?</p>
                            <YesNo value={form.q954_yes} onChange={v => setField('q954_yes', v)} />
                        </div>
                        {form.q954_yes === true && (
                            <textarea rows={3} value={form.q954_notes}
                                onChange={e => setField('q954_notes', e.target.value)}
                                placeholder="Describe the recommended adjustments…"
                                className={ta} />
                        )}
                    </QuestionCard>

                    {/* 955 */}
                    <QuestionCard number="955">
                        <p className="text-sm font-semibold text-slate-800 mb-3">Please note any progress</p>
                        <textarea rows={3} value={form.q955_notes}
                            onChange={e => setField('q955_notes', e.target.value)}
                            placeholder="Note any progress made during the visit…"
                            className={ta} />
                    </QuestionCard>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={saveNote} disabled={saving || !isReady}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                            <DocumentTextIcon className="h-4 w-4" />
                            {saving ? 'Saving…' : 'Save Note'}
                        </button>
                        <button onClick={processAi} disabled={processing || saving || !isReady}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                            <SparklesIcon className="h-4 w-4" />
                            {processing ? 'Processing…' : 'Process with AI'}
                        </button>
                    </div>

                    {aiDone && (
                        <div className="flex justify-end">
                            <button onClick={() => router.visit(route('staff.visit.review', visit.id))}
                                className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center">
                                Review & Submit <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </StaffLayout>
    );
}

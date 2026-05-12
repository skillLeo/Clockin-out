import { Head, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { StopCircleIcon, DocumentTextIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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
    const [note, setNote]             = useState(() => localStorage.getItem(noteKey) ?? visit.note_staff_raw ?? '');
    const [times, setTimes]           = useState(null);
    const [aiDone, setAiDone]         = useState(false);
    const [error, setError]           = useState(null);

    const handleNoteChange = (e) => {
        setNote(e.target.value);
        localStorage.setItem(noteKey, e.target.value);
    };

    const isClockedOut = !!visit.clock_out_time;

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
        if (!note.trim()) return;
        setSaving(true); setError(null);
        try {
            await axios.post('/api/visit/save-note', { visit_id: visit.id, note_staff_raw: note });
            localStorage.removeItem(noteKey);
        }
        catch (e) { setError(e.response?.data?.error ?? 'Failed to save note.'); }
        finally { setSaving(false); }
    };

    const processAi = async () => {
        if (!note.trim()) { setError('Write your note before processing.'); return; }
        setSaving(true); setError(null);
        try {
            await axios.post('/api/visit/save-note', { visit_id: visit.id, note_staff_raw: note });
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

    return (
        <StaffLayout title="Active Visit">
            <Head title="Active Visit" />

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

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-5">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                            Visit Note <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-3">Describe in detail what happened during this visit.</p>
                        <textarea rows={6} value={note} onChange={handleNoteChange}
                            placeholder="Describe what happened during the visit…"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none" />
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <button onClick={saveNote} disabled={saving || !note.trim()}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                <DocumentTextIcon className="h-4 w-4" />
                                {saving ? 'Saving…' : 'Save Note'}
                            </button>
                            <button onClick={processAi} disabled={processing || saving || !note.trim()}
                                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                                <SparklesIcon className="h-4 w-4" />
                                {processing ? 'Processing…' : 'Process with AI'}
                            </button>
                        </div>
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

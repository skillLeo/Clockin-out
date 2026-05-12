import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { useMemo, useState } from 'react';
import {
    CalendarDaysIcon,
    CheckIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const emptyForm = (staff, individuals, services) => ({
    staff_id: staff[0]?.id ?? '',
    individual_id: individuals[0]?.id ?? '',
    service_id: services[0]?.id ?? '',
    date: new Date().toISOString().slice(0, 10),
});

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function Assignments({ assignments: initialAssignments, staff, individuals, services }) {
    const [assignments, setAssignments] = useState(initialAssignments);
    const [form, setForm] = useState(() => emptyForm(staff, individuals, services));
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);

    const editing = useMemo(
        () => assignments.find((assignment) => assignment.id === editingId),
        [assignments, editingId],
    );

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const resetForm = () => {
        setEditingId(null);
        setForm(emptyForm(staff, individuals, services));
        setError(null);
    };

    const flash = (message) => {
        setNotice(message);
        setTimeout(() => setNotice(null), 2500);
    };

    const startEdit = (assignment) => {
        if (assignment.visits_count > 0) return;

        setEditingId(assignment.id);
        setForm({
            staff_id: assignment.staff_id,
            individual_id: assignment.individual_id,
            service_id: assignment.service_id,
            date: assignment.date?.slice(0, 10) ?? '',
        });
        setError(null);
        setNotice(null);
    };

    const saveAssignment = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setNotice(null);

        try {
            if (editingId) {
                const { data } = await axios.put(`/api/admin/assignments/${editingId}`, form);
                setAssignments((current) => current.map((assignment) => (
                    assignment.id === editingId ? data.assignment : assignment
                )));
                resetForm();
                flash('Assignment updated.');
            } else {
                const { data } = await axios.post('/api/admin/assignments', form);
                setAssignments((current) => [data.assignment, ...current]);
                setForm(emptyForm(staff, individuals, services));
                flash('Assignment created.');
            }
        } catch (e) {
            setError(e.response?.data?.message ?? 'Assignment could not be saved.');
        } finally {
            setSaving(false);
        }
    };

    const deleteAssignment = async (assignment) => {
        if (assignment.visits_count > 0) return;
        if (!window.confirm('Delete this assignment? This cannot be undone.')) return;

        setDeletingId(assignment.id);
        setError(null);
        setNotice(null);

        try {
            await axios.delete(`/api/admin/assignments/${assignment.id}`);
            setAssignments((current) => current.filter((item) => item.id !== assignment.id));
            if (editingId === assignment.id) resetForm();
            flash('Assignment deleted.');
        } catch (e) {
            setError(e.response?.data?.message ?? 'Assignment could not be deleted.');
        } finally {
            setDeletingId(null);
        }
    };

    const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900';
    const canSave = form.staff_id && form.individual_id && form.service_id && form.date;

    return (
        <AdminLayout title="Assignments">
            <Head title="Assignments" />

            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-950">Schedule Assignments</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Create and maintain staff visits before clock-in. Started visits are locked to protect EVV records.
                    </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                    <span className="font-semibold text-slate-900">{assignments.length}</span> recent assignments
                </div>
            </div>

            {(notice || error) && (
                <div className="mb-4">
                    {notice && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <CheckIcon className="h-4 w-4 flex-shrink-0" />
                            {notice}
                        </div>
                    )}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-5">
                <form onSubmit={saveAssignment} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                <CalendarDaysIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    {editing ? 'Edit Assignment' : 'New Assignment'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {editing ? 'Update the schedule details.' : 'Add a visit to the staff dashboard.'}
                                </p>
                            </div>
                        </div>
                        {editing && (
                            <span className="inline-flex self-start rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 sm:self-auto">
                                Editing #{editing.id}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Staff Member</label>
                            <select className={inputClass} value={form.staff_id} onChange={(e) => set('staff_id', e.target.value)}>
                                {staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Individual</label>
                            <select className={inputClass} value={form.individual_id} onChange={(e) => set('individual_id', e.target.value)}>
                                {individuals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Service</label>
                            <select className={inputClass} value={form.service_id} onChange={(e) => set('service_id', e.target.value)}>
                                {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                            <input type="date" className={inputClass} value={form.date} onChange={(e) => set('date', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
                        {editing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={saving || !canSave}
                            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {editing ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Assignment'}
                        </button>
                    </div>
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Recent Assignments</h3>
                            <p className="text-xs text-slate-500">Latest 100 scheduled assignments.</p>
                        </div>
                        <span className="text-xs text-slate-400">Edit/delete is disabled after a visit starts.</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Staff</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Individual</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Service</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {assignments.map((assignment) => {
                                    const locked = assignment.visits_count > 0;
                                    return (
                                        <tr key={assignment.id} className={editingId === assignment.id ? 'bg-slate-50' : 'hover:bg-slate-50/70'}>
                                            <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900">{formatDate(assignment.date)}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-slate-700">{assignment.staff?.name}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-slate-700">{assignment.individual?.name}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-slate-700">{assignment.service?.name}</td>
                                            <td className="whitespace-nowrap px-5 py-3">
                                                <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${locked ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {locked ? 'Visit started' : 'Scheduled'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(assignment)}
                                                        disabled={locked}
                                                        title={locked ? 'Started assignments cannot be edited' : 'Edit assignment'}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteAssignment(assignment)}
                                                        disabled={locked || deletingId === assignment.id}
                                                        title={locked ? 'Started assignments cannot be deleted' : 'Delete assignment'}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {assignments.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">
                                            No assignments yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  GraduationCap,
  Eye,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { classesApi, teachersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner, { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

const Classes = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: 'A',
    academicTerm: 'Fall 2026 / Spring 2027',
    teacherId: '',
    isActive: true
  });

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesRes, teachersRes] = await Promise.all([
        classesApi.getAll(),
        isAdmin ? teachersApi.getAll() : Promise.resolve({ success: true, data: [] })
      ]);

      if (classesRes.success) setClasses(classesRes.data);
      if (teachersRes.success) setTeachers(teachersRes.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      section: 'A',
      academicTerm: 'Fall 2026 / Spring 2027',
      teacherId: '',
      isActive: true
    });
    setSelectedClass(null);
  };

  // Create Class
  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.grade.trim()) {
      toast.error('Class name and grade level are required');
      return;
    }

    try {
      setActionLoading(true);
      const res = await classesApi.create(formData);
      if (res.success) {
        toast.success(`Class ${formData.name} created successfully`);
        setIsAddModalOpen(false);
        resetForm();
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create class');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Class
  const handleEditClass = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      setActionLoading(true);
      const res = await classesApi.update(selectedClass._id, formData);
      if (res.success) {
        toast.success(`Class ${formData.name} updated successfully`);
        setIsEditModalOpen(false);
        resetForm();
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update class');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (cls) => {
    if (!isAdmin) return;
    try {
      const res = await classesApi.updateStatus(cls._id, !cls.isActive);
      if (res.success) {
        toast.success(`Class ${cls.name} ${!cls.isActive ? 'activated' : 'deactivated'}`);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  // Delete Class
  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    try {
      setActionLoading(true);
      const res = await classesApi.delete(selectedClass._id);
      if (res.success) {
        toast.success('Class deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedClass(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete class');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (cls) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      section: cls.section || 'A',
      academicTerm: cls.academicTerm || 'Fall 2026 / Spring 2027',
      teacherId: cls.teacherId?._id || cls.teacherId || '',
      isActive: cls.isActive
    });
    setIsEditModalOpen(true);
  };

  const openView = async (cls) => {
    try {
      setActionLoading(true);
      const res = await classesApi.getById(cls._id);
      if (res.success) {
        setSelectedClass(res.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load class roster');
    } finally {
      setActionLoading(false);
    }
  };

  const openDelete = (cls) => {
    setSelectedClass(cls);
    setIsDeleteDialogOpen(true);
  };

  const filteredClasses = classes.filter((c) => {
    const term = search.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(term);
    const gradeMatch = c.grade.toLowerCase().includes(term);
    const teacherMatch = c.teacherId?.name?.toLowerCase().includes(term);
    return nameMatch || gradeMatch || teacherMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search classes by name, grade, or teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus size={18} />
              <span>Create Class</span>
            </button>
          )}
        </div>
      </div>

      {/* Classes Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">
              {isAdmin ? 'All Academic Classes' : 'My Assigned Classes'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {filteredClasses.length}
            </span>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={isAdmin ? 'No Classes Found' : 'No Classes Assigned'}
            description={
              isAdmin
                ? 'Create a class and assign an instructor to get started.'
                : 'You have not been assigned to any classes yet. Please contact the administrator.'
            }
            action={
              isAdmin ? (
                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="btn-primary"
                >
                  <Plus size={16} />
                  <span>Create Class</span>
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3 px-6">Class Name</th>
                  <th className="py-3 px-6">Grade / Section</th>
                  <th className="py-3 px-6">Assigned Teacher</th>
                  <th className="py-3 px-6">Enrolled Students</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Class Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                          {cls.grade?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{cls.name}</p>
                          <p className="text-xs text-gray-400">{cls.academicTerm}</p>
                        </div>
                      </div>
                    </td>

                    {/* Grade & Section */}
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-700">{cls.grade}</span>
                      <span className="text-xs text-gray-400 ml-1.5">(Sec {cls.section})</span>
                    </td>

                    {/* Teacher */}
                    <td className="py-4 px-6">
                      {cls.teacherId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            {cls.teacherId.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-xs leading-tight">
                              {cls.teacherId.name}
                            </p>
                            <p className="text-[11px] text-gray-400">{cls.teacherId.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Student count */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <Users size={14} className="text-gray-400" />
                        <span>{cls.studentCount ?? 0} Students</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleStatus(cls)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            cls.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {cls.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(cls)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Class Roster"
                        >
                          <Eye size={17} />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(cls)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Edit Class"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              onClick={() => openDelete(cls)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Class"
                            >
                              <Trash2 size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Class Modal (Admin) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Class">
        <form onSubmit={handleAddClass} className="space-y-4">
          <div>
            <label className="label">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Grade 8 - Section A"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Grade / Level <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g. Grade 8"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g. A"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Academic Term</label>
              <input
                type="text"
                value={formData.academicTerm}
                onChange={(e) => setFormData({ ...formData, academicTerm: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Assign Teacher</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="input-field bg-white"
              >
                <option value="">-- No Teacher Assigned --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal (Admin) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Class">
        <form onSubmit={handleEditClass} className="space-y-4">
          <div>
            <label className="label">Class Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Grade / Level</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Academic Term</label>
              <input
                type="text"
                value={formData.academicTerm}
                onChange={(e) => setFormData({ ...formData, academicTerm: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Assign Teacher</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="input-field bg-white"
              >
                <option value="">-- No Teacher Assigned --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Class Roster Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Class Roster: ${selectedClass?.name}`}
        maxWidth="max-w-2xl"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 uppercase font-semibold">Teacher: </span>
                <span className="font-bold text-gray-800">
                  {selectedClass.teacherId?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-semibold">Term: </span>
                <span className="font-bold text-gray-800">{selectedClass.academicTerm}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-semibold">Enrolled: </span>
                <span className="font-bold text-blue-600">{selectedClass.studentCount} Students</span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl">
              {selectedClass.students && selectedClass.students.length > 0 ? (
                selectedClass.students.map((student, idx) => (
                  <div key={student._id} className="p-3 flex items-center justify-between hover:bg-gray-50 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-gray-400 w-4">{idx + 1}.</span>
                      <div>
                        <p className="font-bold text-gray-900">{student.fullName}</p>
                        <p className="text-gray-400">{student.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        student.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No students currently enrolled in this class.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteClass}
        title="Delete Academic Class"
        message={`Are you sure you want to delete ${selectedClass?.name}? Enrolled students will have their class assignment unlinked, but their accounts and attendance records will remain safe.`}
        confirmText="Delete Class"
        loading={actionLoading}
      />
    </div>
  );
};

export default Classes;

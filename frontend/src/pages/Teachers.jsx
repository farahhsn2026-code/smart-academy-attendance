import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Mail,
  Phone,
  Filter,
  X
} from 'lucide-react';
import { teachersApi, classesApi } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner, { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    assignedClasses: [],
    isActive: true
  });

  const [newPassword, setNewPassword] = useState('');

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersRes, classesRes] = await Promise.all([
        teachersApi.getAll(),
        classesApi.getAll()
      ]);

      if (teachersRes.success) setTeachers(teachersRes.data);
      if (classesRes.success) setAvailableClasses(classesRes.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load teachers or classes');
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
      email: '',
      phone: '',
      password: '',
      assignedClasses: [],
      isActive: true
    });
    setSelectedTeacher(null);
  };

  // Add Teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Name, email, and a temporary password are required');
      return;
    }

    try {
      setActionLoading(true);
      const res = await teachersApi.create(formData);
      if (res.success) {
        toast.success(`Teacher ${formData.name} created successfully`);
        setIsAddModalOpen(false);
        resetForm();
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create teacher');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Teacher
  const handleEditTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      setActionLoading(true);
      const res = await teachersApi.update(selectedTeacher._id, {
        name: formData.name,
        phone: formData.phone,
        assignedClasses: formData.assignedClasses,
        isActive: formData.isActive
      });

      if (res.success) {
        toast.success(`Teacher ${formData.name} updated successfully`);
        setIsEditModalOpen(false);
        resetForm();
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update teacher');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (teacher) => {
    try {
      const res = await teachersApi.updateStatus(teacher._id, !teacher.isActive);
      if (res.success) {
        toast.success(
          `Teacher ${teacher.name} ${!teacher.isActive ? 'activated' : 'deactivated'}`
        );
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change status');
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setActionLoading(true);
      const res = await teachersApi.resetPassword(selectedTeacher._id, newPassword);
      if (res.success) {
        toast.success(`Password reset for ${selectedTeacher.name}`);
        setIsResetModalOpen(false);
        setNewPassword('');
        setSelectedTeacher(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      setActionLoading(true);
      const res = await teachersApi.delete(selectedTeacher._id);
      if (res.success) {
        toast.success('Teacher deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedTeacher(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete teacher');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      password: '',
      assignedClasses: teacher.assignedClasses ? teacher.assignedClasses.map((c) => c._id || c) : [],
      isActive: teacher.isActive
    });
    setIsEditModalOpen(true);
  };

  const openResetPassword = (teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const openDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleClassCheckbox = (classId) => {
    setFormData((prev) => {
      const exists = prev.assignedClasses.includes(classId);
      return {
        ...prev,
        assignedClasses: exists
          ? prev.assignedClasses.filter((id) => id !== classId)
          : [...prev.assignedClasses, classId]
      };
    });
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.phone && t.phone.includes(search));
    const matchesStatus =
      statusFilter === 'active'
        ? t.isActive
        : statusFilter === 'inactive'
        ? !t.isActive
        : true;
    return matchesSearch && matchesStatus;
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
              placeholder="Search teacher by name, email, or phone..."
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

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field py-2 text-xs font-medium w-auto bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus size={18} />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Faculty & Teachers</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {filteredTeachers.length}
            </span>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredTeachers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Teachers Found"
            description={
              search
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first teacher account.'
            }
            action={
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="btn-primary"
              >
                <Plus size={16} />
                <span>Add Teacher</span>
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3 px-6">Teacher Name</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Assigned Classes</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{teacher.name}</p>
                          <p className="text-xs text-gray-400">Teacher ID: #{teacher._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6">
                      <div className="text-gray-700 flex items-center gap-1.5 text-xs">
                        <Mail size={12} className="text-gray-400" />
                        <span>{teacher.email}</span>
                      </div>
                      {teacher.phone && (
                        <div className="text-gray-500 flex items-center gap-1.5 text-xs mt-0.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Classes */}
                    <td className="py-4 px-6">
                      {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.assignedClasses.map((cls) => (
                            <span
                              key={cls._id || cls}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium"
                            >
                              {cls.name || 'Class'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No classes assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(teacher)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          teacher.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {teacher.isActive ? (
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
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openResetPassword(teacher)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={17} />
                        </button>
                        <button
                          onClick={() => openEdit(teacher)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Teacher"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => openDelete(teacher)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Teacher"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Teacher"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div>
            <label className="label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ahmed Hassan"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@smartacademy.edu"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="input-field"
              required
            />
          </div>

          {/* Assigned Classes Multi-check */}
          <div>
            <label className="label">Assign Classes</label>
            <div className="border border-gray-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2 bg-gray-50/50">
              {availableClasses.length > 0 ? (
                availableClasses.map((cls) => (
                  <label
                    key={cls._id}
                    className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedClasses.includes(cls._id)}
                      onChange={() => handleClassCheckbox(cls._id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-800">{cls.name}</span>
                    <span className="text-gray-400">({cls.grade} - Section {cls.section})</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No classes available yet. Create classes first.</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Account Active (Allowed to log in)</span>
            </label>
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
              {actionLoading ? 'Creating...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Teacher"
      >
        <form onSubmit={handleEditTeacher} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
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
              <label className="label">Email Address (Read-only)</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Assigned Classes Multi-check */}
          <div>
            <label className="label">Assigned Classes</label>
            <div className="border border-gray-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2 bg-gray-50/50">
              {availableClasses.map((cls) => (
                <label
                  key={cls._id}
                  className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedClasses.includes(cls._id)}
                    onChange={() => handleClassCheckbox(cls._id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-800">{cls.name}</span>
                  <span className="text-gray-400">({cls.grade} - Section {cls.section})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Account Active (Allowed to log in)</span>
            </label>
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

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password for ${selectedTeacher?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Enter a new password for this teacher. They will need to use this new password for subsequent logins.
          </p>
          <div>
            <label className="label">New Temporary Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="input-field"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="Delete Teacher Account"
        message={`Are you sure you want to remove ${selectedTeacher?.name}? Their assigned classes will become unassigned, but student attendance records will remain intact.`}
        confirmText="Delete Teacher"
        loading={actionLoading}
      />
    </div>
  );
};

export default Teachers;

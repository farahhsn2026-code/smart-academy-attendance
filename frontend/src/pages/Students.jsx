import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Filter,
  Eye,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  X
} from 'lucide-react';
import { studentsApi } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StudentForm from '../components/StudentForm';
import LoadingSpinner, { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { formatDate, getStatusBadgeClass } from '../utils/helpers';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (courseFilter) params.course = courseFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await studentsApi.getAll(params);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Error fetching student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, courseFilter, statusFilter]);

  // Create Student
  const handleAddStudent = async (formData) => {
    try {
      setActionLoading(true);
      const res = await studentsApi.create(formData);
      if (res.success) {
        toast.success(`Student ${formData.fullName} added successfully`);
        setIsAddModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Student
  const handleEditStudent = async (formData) => {
    if (!selectedStudent) return;
    try {
      setActionLoading(true);
      const res = await studentsApi.update(selectedStudent._id, formData);
      if (res.success) {
        toast.success(`Student ${formData.fullName} updated successfully`);
        setIsEditModalOpen(false);
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update student');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      setActionLoading(true);
      const res = await studentsApi.delete(selectedStudent._id);
      if (res.success) {
        toast.success('Student record and related attendance deleted');
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const openDeleteDialog = (student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
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

          {/* Filters & Add Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="input-field py-2 text-xs font-medium w-auto bg-white"
              >
                <option value="">All Courses</option>
                <option value="Full-Stack Web Development">Web Development</option>
                <option value="Data Science & AI">Data Science</option>
                <option value="UI/UX Product Design">UI/UX Design</option>
                <option value="Cybersecurity Analyst">Cybersecurity</option>
                <option value="Cloud & DevOps Engineering">Cloud/DevOps</option>
                <option value="Mobile App Development">Mobile Apps</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field py-2 text-xs font-medium w-auto bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Enrolled Students</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {students.length}
            </span>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description={
              search || courseFilter || statusFilter
                ? 'Try tweaking your search keywords or filter criteria.'
                : 'Get started by creating your first student record in Smart Academy.'
            }
            action={
              <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                <Plus size={16} />
                <span>Add Student</span>
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3 px-6">Student ID</th>
                  <th className="py-3 px-6">Full Name</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Course / Class</th>
                  <th className="py-3 px-6">Enrolled</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-400">
                      #{student._id.slice(-6).toUpperCase()}
                    </td>

                    {/* Name & Gender */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{student.fullName}</div>
                      <div className="text-xs text-gray-400 capitalize">{student.gender}</div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6">
                      <div className="text-gray-700 flex items-center gap-1.5 text-xs">
                        <Mail size={12} className="text-gray-400" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="text-gray-500 flex items-center gap-1.5 text-xs mt-0.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Course */}
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-700">{student.course}</span>
                    </td>

                    {/* Enrollment */}
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {formatDate(student.enrollmentDate)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={getStatusBadgeClass(student.status)}>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(student)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Profile"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Student"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(student)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Student"
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
      >
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setIsAddModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Edit Student Information"
      >
        <StudentForm
          initialValues={selectedStudent}
          onSubmit={handleEditStudent}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
          }}
          loading={actionLoading}
        />
      </Modal>

      {/* View Student Profile Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Student Profile"
        maxWidth="max-w-lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.fullName}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  ID: #{selectedStudent._id.toUpperCase()}
                </p>
                <div className="mt-1">
                  <span className={getStatusBadgeClass(selectedStudent.status)}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1">
                  <Mail size={13} /> Email Address
                </span>
                <p className="font-medium text-gray-800 break-all">{selectedStudent.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1">
                  <Phone size={13} /> Phone
                </span>
                <p className="font-medium text-gray-800">{selectedStudent.phone || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1">
                  <BookOpen size={13} /> Course
                </span>
                <p className="font-medium text-gray-800">{selectedStudent.course}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1">
                  <Calendar size={13} /> Enrollment Date
                </span>
                <p className="font-medium text-gray-800">{formatDate(selectedStudent.enrollmentDate)}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedStudent);
                }}
                className="btn-primary"
              >
                <Pencil size={15} />
                <span>Edit Student</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.fullName}? All associated attendance logs will also be permanently deleted.`}
        confirmText="Delete Student"
        loading={actionLoading}
      />
    </div>
  );
};

export default Students;

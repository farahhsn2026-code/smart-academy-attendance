import { useState, useEffect } from 'react';
import { formatDateInput } from '../utils/helpers';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  gender: 'Prefer not to say',
  course: '',
  classId: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
  status: 'Active'
};

const StudentForm = ({
  initialValues,
  availableClasses = [],
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        fullName: initialValues.fullName || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        gender: initialValues.gender || 'Prefer not to say',
        course: initialValues.course || '',
        classId: initialValues.classId?._id || initialValues.classId || '',
        enrollmentDate: formatDateInput(initialValues.enrollmentDate) || new Date().toISOString().split('T')[0],
        status: initialValues.status || 'Active'
      });
    } else if (availableClasses.length > 0 && !formData.classId) {
      // Default to first available class if adding new
      setFormData((prev) => ({
        ...prev,
        classId: availableClasses[0]._id,
        course: availableClasses[0].name
      }));
    }
  }, [initialValues, availableClasses]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'classId') {
      const selectedCls = availableClasses.find((c) => c._id === value);
      setFormData((prev) => ({
        ...prev,
        classId: value,
        course: selectedCls ? selectedCls.name : prev.course
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="label">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          className={`input-field ${errors.fullName ? 'border-red-500 focus:ring-red-400' : ''}`}
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-400' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="label">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="input-field"
          />
        </div>
      </div>

      {/* Gender & Assigned Class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="label">
            Academic Class <span className="text-red-500">*</span>
          </label>
          <select
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            className="input-field bg-white"
          >
            <option value="">-- Select Class --</option>
            {availableClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.grade} - Sec {cls.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enrollment Date & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Enrollment Date</label>
          <input
            type="date"
            name="enrollmentDate"
            value={formData.enrollmentDate}
            onChange={handleChange}
            className="input-field bg-white"
          />
        </div>

        <div>
          <label className="label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input-field bg-white"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : initialValues ? 'Save Changes' : 'Create Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;

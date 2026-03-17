import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiCheckCircle, FiXCircle } from "react-icons/fi";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    aadharNumber: "",
    courseId: "",
    departmentId: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    photo: "",
    // active field removed from form - backend handles this
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get("http://localhost:8080/api/courses");
    setCourses(res.data.filter((c) => c.active));
  };

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:8080/api/departments");
    setDepartments(res.data.filter((d) => d.active));
  };

  const fetchStudents = async () => {
    const res = await axios.get("http://localhost:8080/api/students");
    setStudents(res.data);
  };

  const handleToggle = async (id) => {
    await axios.patch(`http://localhost:8080/api/students/${id}/status`);
    fetchStudents();
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!form.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!nameRegex.test(form.firstName)) {
      newErrors.firstName = "First name must contain only alphabets";
    }

    if (!form.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameRegex.test(form.lastName)) {
      newErrors.lastName = "Last name must contain only alphabets";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^\d{10}$/;
    if (!form.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    const aadharRegex = /^\d{12}$/;
    if (!form.aadharNumber?.trim()) {
      newErrors.aadharNumber = "Aadhar number is required";
    } else if (!aadharRegex.test(form.aadharNumber)) {
      newErrors.aadharNumber = "Aadhar number must be exactly 12 digits";
    }

    if (!form.courseId) {
      newErrors.courseId = "Please select a course";
    }

    if (!form.departmentId) {
      newErrors.departmentId = "Please select a department";
    }

    if (!form.gender) {
      newErrors.gender = "Please select a gender";
    }

    // 🔥 FIX: Age validation - minimum 17 years
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const age = calculateAge(form.dateOfBirth);
      if (age < 17) {
        newErrors.dateOfBirth = "Student must be at least 17 years old";
      } else if (age > 100) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    if (!form.address?.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      aadharNumber: form.aadharNumber,
      departmentId: Number(form.departmentId),
      courseId: Number(form.courseId),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      photo: form.photo || null,
    };

    // Note: active status is NOT included in payload
    // Backend will handle active status automatically

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8080/api/students/${selectedId}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          },
        );
        alert("Student updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/students", payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Student added successfully!");
      }

      setShowModal(false);
      setIsEdit(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.message || "Error saving student. Please try again.");
    }
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      aadharNumber: "",
      courseId: "",
      departmentId: "",
      gender: "",
      dateOfBirth: "",
      address: "",
      photo: "",
    });
    setErrors({});
  };

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleToggleConfirm = (student, action) => {
    const message = action === 'activate' 
      ? "Activate this student?" 
      : "Deactivate this student?";

    if (window.confirm(message)) {
      handleToggle(student.id);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone' || field === 'aadharNumber') {
      value = value.replace(/\D/g, '');
    }
    
    setForm({ ...form, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Students</h2>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsEdit(false);
            setShowModal(true);
          }}
          className="bg-[#2f5d62] hover:bg-[#264b4f] text-white px-5 py-2 rounded-lg shadow-sm"
        >
          + Add Student
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <input
          placeholder="Search by name, roll number or email..."
          className="w-full p-3 border rounded-lg focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-sm p-5 overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="text-left text-gray-600 text-sm border-b">
            <tr>
              <th className="py-3">Student</th>
              <th>Enrollment</th>
              <th>Course</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Aadhar</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {s.photo ? (
                      <img
                        src={`data:image/jpeg;base64,${s.photo}`}
                        className="w-11 h-11 rounded-full object-cover border shadow-sm"
                        alt="student"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(s.firstName, s.lastName)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{s.email}</div>
                    </div>
                  </div>
                </td>

                <td>{s.enrollmentNumber}</td>
                <td>{s.courseName}</td>
                <td>{s.departmentName}</td>
                <td>{s.phone}</td>
                <td>{s.aadharNumber}</td>
                <td>{s.gender}</td>
                <td>{s.dateOfBirth ? calculateAge(s.dateOfBirth) : '-'}</td>

                <td>
                  {s.active ? (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="flex gap-3 text-gray-600 mt-7">
                  {/* Edit Icon */}
                  <FiEdit2
                    className="cursor-pointer hover:text-green-600 text-lg"
                    title="Edit Student"
                    onClick={() => {
                      setForm({
                        firstName: s.firstName || "",
                        lastName: s.lastName || "",
                        email: s.email || "",
                        phone: s.phone || "",
                        aadharNumber: s.aadharNumber || "",
                        courseId: s.courseId || "",
                        departmentId: s.departmentId || "",
                        gender: s.gender || "",
                        dateOfBirth: s.dateOfBirth
                          ? s.dateOfBirth.substring(0, 10)
                          : "",
                        address: s.address || "",
                        photo: s.photo || "",
                        // active field NOT included in form
                      });
                      setSelectedId(s.id);
                      setIsEdit(true);
                      setShowModal(true);
                      setErrors({});
                    }}
                  />
                  
                  {/* Activate/Deactivate Icons */}
                  {s.active ? (
                    <FiXCircle
                      className="cursor-pointer hover:text-orange-600 text-lg"
                      title="Deactivate Student"
                      onClick={() => handleToggleConfirm(s, 'deactivate')}
                    />
                  ) : (
                    <FiCheckCircle
                      className="cursor-pointer hover:text-green-600 text-lg"
                      title="Activate Student"
                      onClick={() => handleToggleConfirm(s, 'activate')}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#cfe6ea] w-[600px] rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-4 right-5 text-gray-600 text-lg"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Student" : "Add New Student"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="text-sm">First Name *</label>
                <input
                  type="text"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                  value={form.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm">Last Name *</label>
                <input
                  type="text"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                  value={form.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm">Email *</label>
                <input
                  type="email"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm">Phone (10 digits) *</label>
                <input
                  type="text"
                  maxLength="10"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Aadhar */}
              <div>
                <label className="text-sm">Aadhar (12 digits) *</label>
                <input
                  type="text"
                  maxLength="12"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.aadharNumber ? 'border-red-500' : ''
                  }`}
                  value={form.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                />
                {errors.aadharNumber && <p className="text-red-500 text-xs mt-1">{errors.aadharNumber}</p>}
              </div>

              {/* Course */}
              <div>
                <label className="text-sm">Course *</label>
                <select
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.courseId ? 'border-red-500' : ''
                  }`}
                  value={form.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="text-sm">Department *</label>
                <select
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.departmentId ? 'border-red-500' : ''
                  }`}
                  value={form.departmentId}
                  onChange={(e) => handleInputChange('departmentId', e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm">Gender *</label>
                <select
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.gender ? 'border-red-500' : ''
                  }`}
                  value={form.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              {/* DOB - with 17+ validation */}
              <div>
                <label className="text-sm">Date of Birth *</label>
                <input
                  type="date"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.dateOfBirth ? 'border-red-500' : ''
                  }`}
                  value={form.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                {form.dateOfBirth && (
                  <p className="text-gray-500 text-xs mt-1">
                    Age: {calculateAge(form.dateOfBirth)} years
                  </p>
                )}
              </div>

              {/* Status Field - COMPLETELY REMOVED */}
              {/* No status dropdown in edit mode anymore */}

              {/* Address - full width */}
              <div className="col-span-2">
                <label className="text-sm">Address *</label>
                <input
                  type="text"
                  className={`w-full p-2 mt-1 rounded-md border ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                  value={form.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Photo */}
              <div className="col-span-2">
                <label className="text-sm">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 mt-1 rounded-md border"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (file.size > 5 * 1024 * 1024) {
                      alert("File size must be less than 5MB");
                      return;
                    }

                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      setForm({
                        ...form,
                        photo: reader.result.split(",")[1],
                      });
                    };
                  }}
                />
                {form.photo && (
                  <img
                    src={`data:image/jpeg;base64,${form.photo}`}
                    className="w-16 h-16 mt-2 rounded-md object-cover"
                    alt="preview"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-md border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2f5d62] text-white px-5 py-2 rounded-md hover:bg-[#264b4f]"
                >
                  {isEdit ? "Update Student" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
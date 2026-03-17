import { useEffect, useState } from "react";
import axios from "axios";

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});

  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: 0,
    experience: "",
    active: true,
  };

  const [form, setForm] = useState(emptyForm);

  const fetchFaculty = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/faculties");
      console.log(res.data);
      setFaculty(res.data);
    } catch (error) {
      console.error("Error fetching faculty:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/departments");
      setDepartments(
        Array.isArray(res.data) ? res.data.filter((d) => d.active) : [],
      );
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation (only alphabets and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!form.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!nameRegex.test(form.firstName)) {
      newErrors.firstName = "First name must contain only alphabets";
    } else if (form.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (form.firstName.length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    }

    if (!form.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameRegex.test(form.lastName)) {
      newErrors.lastName = "Last name must contain only alphabets";
    } else if (form.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (form.lastName.length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!form.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // Department validation
    if (!form.departmentId || form.departmentId === 0) {
      newErrors.departmentId = "Please select a department";
    } else {
      // 🔥 Check if selected department is active
      const selectedDept = departments.find(d => d.id === Number(form.departmentId));
      if (!selectedDept) {
        newErrors.departmentId = "Selected department is not available";
      }
    }

    // Experience validation
    if (!form.experience && form.experience !== 0) {
      newErrors.experience = "Experience is required";
    } else {
      const exp = Number(form.experience);
      if (isNaN(exp) || exp < 0) {
        newErrors.experience = "Experience must be a positive number";
      } else if (exp > 50) {
        newErrors.experience = "Experience cannot exceed 50 years";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      departmentId: Number(form.departmentId),
      experience: Number(form.experience),
    };

    try {
      if (isEdit) {
        console.log("Updating faculty with payload:", payload);
        await axios.put(
          `http://localhost:8080/api/faculties/${selectedId}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          },
        );
        alert("Faculty updated successfully!");
      } else {
        console.log("Creating faculty with payload:", payload);
        await axios.post("http://localhost:8080/api/faculties", payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Faculty added successfully!");
      }

      setShowModal(false);
      setIsEdit(false);
      setForm(emptyForm);
      setErrors({});
      fetchFaculty();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.message || "Error saving faculty. Please try again.");
    }
  };

  // 🔥 FIX: Enhanced toggle status with department check
  const toggleStatus = async (id) => {
    // Find the faculty member
    const facultyMember = faculty.find(f => f.id === id);
    
    // If trying to activate an inactive faculty member
    if (!facultyMember.active) {
      // Check if the department is active
      const department = departments.find(d => d.id === facultyMember.departmentId);
      
      if (!department || !department.active) {
        alert("Cannot activate this faculty member because their department is inactive. Please activate the department first.");
        return;
      }
    }

    // Confirm action
    const message = facultyMember?.active
      ? "Deactivate this faculty member?"
      : "Activate this faculty member?";

    if (window.confirm(message)) {
      try {
        await axios.patch(`http://localhost:8080/api/faculties/${id}/status`);
        fetchFaculty();
      } catch (error) {
        console.error("Error toggling status:", error);
        alert("Error updating status. Please try again.");
      }
    }
  };

  const getFacultyById = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/faculties/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching faculty:", error);
      return null;
    }
  };

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  // Handle input change and clear errors
  const handleInputChange = (field, value) => {
    // For phone, only allow digits
    if (field === 'phone') {
      value = value.replace(/\D/g, '');
    }
    
    setForm({ ...form, [field]: value });
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  // Filter faculty based on search
  const filteredFaculty = faculty.filter((f) =>
    `${f.firstName} ${f.lastName} ${f.email} ${f.departmentName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Helper function to check if department is active
  const isDepartmentActive = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.active : false;
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Faculty</h2>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setIsEdit(false);
            setShowModal(true);
            setErrors({});
          }}
          className="bg-[#2f5d62] text-white px-5 py-2 rounded-lg hover:bg-[#264b4f] transition cursor-pointer"
        >
          + Add Faculty
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <input
          type="text"
          placeholder="Search faculty by name, email or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {filteredFaculty.length} {filteredFaculty.length === 1 ? "faculty member" : "faculty members"} found
          </p>
        </div>
      </div>

      {/* 📋 TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-5 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="text-left text-gray-600 text-sm border-b">
            <tr>
              <th className="py-3">Faculty</th>
              <th>Department</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map((f) => {
                const deptActive = isDepartmentActive(f.departmentId);
                
                return (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {getInitials(f.firstName, f.lastName)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {f.firstName} {f.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{f.email}</div>
                          <div className="text-xs text-gray-400">{f.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td>{f.departmentName || "Not Assigned"}</td>

                    <td>{f.experience} yrs</td>

                    <td>
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          f.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {f.active ? "Active" : "Inactive"}
                      </span>
                      {!f.active && !deptActive && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ Department inactive
                        </p>
                      )}
                    </td>

                    <td className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setForm({
                            firstName: f.firstName || "",
                            lastName: f.lastName || "",
                            email: f.email || "",
                            phone: f.phone || "",
                            departmentId: f.departmentId || 0,
                            experience: f.experience || "",
                            active: f.active,
                          });
                          setSelectedId(f.id);
                          setIsEdit(true);
                          setShowModal(true);
                          setErrors({});
                        }}
                        className="text-sm border px-3 py-1 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(f.id)}
                        disabled={!f.active && !deptActive}
                        className={`text-sm px-3 py-1 rounded-md text-white cursor-pointer ${
                          f.active
                            ? "bg-red-500 hover:bg-red-600"
                            : !deptActive
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                        }`}
                        title={!f.active && !deptActive ? "Cannot activate: Department is inactive" : ""}
                      >
                        {f.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No faculty members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false);
                setErrors({});
              }}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Faculty" : "Add Faculty"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter first name"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter last name"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (10 digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.departmentId || ""}
                  onChange={(e) => handleInputChange("departmentId", e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {!d.active ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="Enter years of experience"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.experience ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                />
                {errors.experience && (
                  <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#2f5d62] text-white px-5 py-2 rounded-md hover:bg-[#264b4f] transition cursor-pointer"
                >
                  {isEdit ? "Update Faculty" : "Add Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Faculty;
import { useEffect, useState } from "react";
import axios from "axios";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [errors, setErrors] = useState({});

  const emptyForm = {
    name: "",
    code: "",
    description: "",
    hod: 0,
    active: true,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/departments");
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/faculties");
      console.log(res.data);
      setFaculty(res.data);
    } catch (error) {
      console.error("Error fetching faculty:", error);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation (only alphabets and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!form.name?.trim()) {
      newErrors.name = "Department name is required";
    } else if (!nameRegex.test(form.name)) {
      newErrors.name = "Department name must contain only alphabets";
    } else if (form.name.length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
    } else if (form.name.length > 100) {
      newErrors.name = "Department name must be less than 100 characters";
    }

    // Code validation (alphanumeric)
    const codeRegex = /^[A-Za-z0-9]+$/;
    if (!form.code?.trim()) {
      newErrors.code = "Department code is required";
    } else if (!codeRegex.test(form.code)) {
      newErrors.code = "Department code must contain only letters and numbers";
    } else if (form.code.length < 2) {
      newErrors.code = "Department code must be at least 2 characters";
    } else if (form.code.length > 20) {
      newErrors.code = "Department code must be less than 20 characters";
    }

    // Description validation (optional but with max length)
    if (form.description && form.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
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
      name: form.name,
      code: form.code,
      description: form.description || "",
      // hodId: form.hod ? Number(form.hod.id) : 0,
    };

    try {
      if (isEdit) {
        console.log("Updating department:", payload);
        await axios.put(
          `http://localhost:8080/api/departments/${selectedId}`,
          payload
        );
        alert("Department updated successfully!");
      } else {
        console.log("Creating department:", payload);
        await axios.post("http://localhost:8080/api/departments", payload);
        alert("Department created successfully!");
      }

      setShowModal(false);
      setIsEdit(false);
      setForm(emptyForm);
      setErrors({});
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      alert(error.response?.data?.message || "Error saving department. Please try again.");
    }
  };

  const toggleStatus = async (id) => {
    const department = departments.find(d => d.id === id);
    
    // Confirm action
    const message = department?.active
      ? "Deactivate this department?"
      : "Activate this department?";

    if (window.confirm(message)) {
      try {
        await axios.patch(`http://localhost:8080/api/departments/${id}/status`);
        fetchDepartments();
      } catch (error) {
        console.error("Error toggling status:", error);
        alert("Error updating status. Please try again.");
      }
    }
  };

  // Handle input change and clear errors
  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your departments</p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setIsEdit(false);
            setShowModal(true);
            setErrors({});
          }}
          className="bg-[#2f5d62] text-white px-5 rounded-lg hover:bg-[#264b4f] transition cursor-pointer"
        >
          + Add Department
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-5 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="border-b text-left text-sm text-gray-600">
            <tr>
              <th className="py-3">Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {departments.length > 0 ? (
              departments.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="py-6 font-medium">{d.name}</td>
                  <td className="text-gray-600">{d.code}</td>
                  <td className="text-gray-600 max-w-xs truncate">
                    {d.description || "—"}
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        d.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="flex gap-3 mt-5">
                    <button
                      onClick={() => {
                        setForm({
                          name: d.name || "",
                          code: d.code || "",
                          description: d.description || "",
                          hod: d.hod || 0,
                          active: d.active,
                        });
                        setSelectedId(d.id);
                        setIsEdit(true);
                        setShowModal(true);
                        setErrors({});
                      }}
                      className="text-sm border px-3 py-1 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(d.id)}
                      className={`text-sm px-3 py-1 rounded-md text-white cursor-pointer ${
                        d.active
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {d.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative">
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
              {isEdit ? "Edit Department" : "Add Department"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g., Computer Science"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g., CSE, IT"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Department description..."
                  rows="3"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
                {form.description && (
                  <p className="text-xs text-gray-400 mt-1">
                    {form.description.length}/500 characters
                  </p>
                )}
              </div>

              {/* HOD Dropdown - Commented out as in original */}
              {/* <select ... </select> */}

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
                  {isEdit ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Department;
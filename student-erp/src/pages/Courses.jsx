import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiEdit2,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { GiBookshelf } from "react-icons/gi";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    duration: "",
    departmentId: "",
    description: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  // Filter courses whenever search term or courses change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.department?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/courses");
      console.log(res.data);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/departments");
      // Filter only active departments with valid IDs
      const activeDepts = res.data.filter((d) => d.active && d.id != null);
      setDepartments(activeDepts);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Course Name validation
    if (!formData.courseName?.trim()) {
      newErrors.courseName = "Course name is required";
    } else if (formData.courseName.length < 3) {
      newErrors.courseName = "Course name must be at least 3 characters";
    } else if (formData.courseName.length > 100) {
      newErrors.courseName = "Course name must be less than 100 characters";
    }

    // Course Code validation
    const courseCodeRegex = /^[A-Za-z0-9]+$/;
    if (!formData.courseCode?.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (formData.courseCode.length < 2) {
      newErrors.courseCode = "Course code must be at least 2 characters";
    } else if (formData.courseCode.length > 20) {
      newErrors.courseCode = "Course code must be less than 20 characters";
    } else if (!courseCodeRegex.test(formData.courseCode)) {
      newErrors.courseCode = "Course code must contain only letters and numbers";
    }

    // Duration validation
    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    } else {
      const durationNum = parseInt(formData.duration);
      if (isNaN(durationNum) || durationNum < 1) {
        newErrors.duration = "Duration must be at least 1 semester";
      } else if (durationNum > 12) {
        newErrors.duration = "Duration cannot exceed 12 semesters";
      }
    }

    // Department validation
    if (!formData.departmentId) {
      newErrors.departmentId = "Please select a department";
    }

    // Description validation (optional but with max length)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggleStatus = async (id) => {
    // Find the course
    const course = courses.find(c => c.id === id);
    
    // 🔥 FIX: Check if course has enrolled students before deactivating
    if (course.active && course.studentCount > 0) {
      alert(`Cannot deactivate this course because ${course.studentCount} student(s) are currently enrolled.`);
      return;
    }

    // Confirm action
    const message = course.active
      ? "Deactivate this course?"
      : "Activate this course?";

    if (window.confirm(message)) {
      try {
        await axios.patch(`http://localhost:8080/api/courses/${id}/status`);
        fetchCourses();
      } catch (error) {
        console.error("Error toggling status:", error);
        alert("Error updating course status. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create payload matching your backend DTO
      const payload = {
        courseName: formData.courseName,
        courseCode: formData.courseCode,
        duration: formData.duration, // Keep as string if backend expects string
        departmentId: parseInt(formData.departmentId),
        description: formData.description || "",
      };

      console.log("Sending payload:", payload);

      if (selectedCourse) {
        await axios.put(
          `http://localhost:8080/api/courses/${selectedCourse.id}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          },
        );
        alert("Course updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/courses", payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Course created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error.response?.data || error);

      // Show specific error message
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = Object.values(error.response.data.errors).join("\n");
        alert(`Validation errors:\n${errors}`);
      } else {
        alert("Error saving course. Please check all fields and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseName: "",
      courseCode: "",
      duration: "",
      departmentId: "",
      description: "",
      status: "ACTIVE",
    });
    setSelectedCourse(null);
    setErrors({});
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseName: course.courseName || "",
      courseCode: course.courseCode || "",
      duration: course.duration || "",
      departmentId: course.department?.id || "",
      description: course.description || "",
      status: course.active ? "ACTIVE" : "INACTIVE",
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle input change and clear errors
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#2f5d62] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#264b4f] transition shadow-sm cursor-pointer z-10"
        >
          <FiPlus className="text-lg" />
          <span>Add Course</span>
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search courses by name, code, description or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"} found
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500">
              Searching for: "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-200"
          >
            {/* Course Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {course.courseName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {course.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-500">{course.courseCode}</p>
            </div>

            {/* Course Content */}
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description || "No description available"}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Students Enrolled:</span>
                  <span className="font-semibold text-gray-800">
                    {course.studentCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-semibold text-gray-800">
                    {course.duration || 3} semesters
                  </span>
                </div>
                {course.department && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-semibold text-gray-800">
                      {course.department.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => openEditModal(course)}
                  className="flex-1 px-4 py-2 bg-[#2f5d62] text-white rounded-lg hover:bg-[#264b4f] transition text-sm font-medium cursor-pointer"
                >
                  Manage
                </button>
                <button
                  onClick={() => handleToggleStatus(course.id)}
                  disabled={course.active && course.studentCount > 0}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 cursor-pointer ${
                    course.active
                      ? course.studentCount > 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                  title={course.active && course.studentCount > 0 ? "Cannot deactivate: Students enrolled" : ""}
                >
                  {course.active ? (
                    <>
                      <FiToggleLeft className="text-lg" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <FiToggleRight className="text-lg" />
                      Activate
                    </>
                  )}
                </button>
              </div>
              {course.active && course.studentCount > 0 && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ {course.studentCount} student(s) are enrolled - cannot deactivate
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Show when no courses match search */}
      {filteredCourses.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          {searchTerm ? (
            <>
              <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Courses Found
              </h3>
              <p className="text-gray-500 mb-4">
                No courses match your search "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-[#2f5d62] text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-[#264b4f] transition cursor-pointer"
              >
                <FiX />
                <span>Clear Search</span>
              </button>
            </>
          ) : (
            <>
              <GiBookshelf className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Courses Found
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first course
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-[#2f5d62] text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-[#264b4f] transition cursor-pointer"
              >
                <FiPlus />
                <span>Add Your First Course</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCourse ? "Edit Course" : "Add Course"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCourse ? "Update course information" : "Create a new course in the system"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.courseName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Computer Science"
                  value={formData.courseName}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                />
                {errors.courseName && (
                  <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>
                )}
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.courseCode ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., CS101"
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange("courseCode", e.target.value)}
                />
                {errors.courseCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.courseCode}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (semesters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="12"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 6"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Select Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.departmentId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.departmentId}
                  onChange={(e) => handleInputChange("departmentId", e.target.value)}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Course description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
                {formData.description && (
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#2f5d62] text-white rounded-lg hover:bg-[#264b4f] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading
                    ? "Saving..."
                    : selectedCourse
                      ? "Update Course"
                      : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
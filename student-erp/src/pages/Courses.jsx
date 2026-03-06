import { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight, FiX } from "react-icons/fi";
import { GiBookshelf } from "react-icons/gi";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    duration: "",
    departmentId: "",
    description: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/courses");
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/departments");
      // Filter only active departments with valid IDs
      const activeDepts = res.data.filter(d => d.active && d.id != null);
      setDepartments(activeDepts);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/courses/${id}/status`);
      fetchCourses();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate department selection
    if (!formData.departmentId) {
      alert("Please select a department");
      return;
    }

    setLoading(true);

    try {
      // Create payload matching your backend DTO
      const payload = {
        courseName: formData.courseName,
        courseCode: formData.courseCode,
        duration: parseInt(formData.duration),
        departmentId: parseInt(formData.departmentId), // Convert to number
        description: formData.description || "",
        active: formData.status === "ACTIVE"
      };

      console.log("Sending payload:", payload);

      if (selectedCourse) {
        await axios.put(
          `http://localhost:8080/api/courses/${selectedCourse.id}`, 
          payload,
          {
            headers: { "Content-Type": "application/json" }
          }
        );
        alert("Course updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/courses", 
          payload,
          {
            headers: { "Content-Type": "application/json" }
          }
        );
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
      status: "ACTIVE"
    });
    setSelectedCourse(null);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseName: course.courseName || "",
      courseCode: course.courseCode || "",
      duration: course.duration || "",
      departmentId: course.department?.id || "",
      description: course.description || "",
      status: course.active ? "ACTIVE" : "INACTIVE"
    });
    setShowModal(true);
  };

  // Rest of your component remains the same...
  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* Header - same as before */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#2f5d62] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#264b4f] transition shadow-sm"
        >
          <FiPlus className="text-lg" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Grid - same as before */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-200"
          >
            {/* Course Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{course.courseName}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {course.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{course.courseCode}</p>
            </div>

            {/* Course Content */}
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4">
                {course.description || 'No description available'}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Students Enrolled:</span>
                  <span className="font-semibold text-gray-800">{course.studentsEnrolled || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-semibold text-gray-800">{course.duration || 3} semesters</span>
                </div>
                {course.department && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-semibold text-gray-800">{course.department.name}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => openEditModal(course)}
                  className="flex-1 px-4 py-2 bg-[#2f5d62] text-white rounded-lg hover:bg-[#264b4f] transition text-sm font-medium"
                >
                  Manage
                </button>
                <button
                  onClick={() => handleToggleStatus(course.id)}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${
                    course.active
                      ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
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
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCourse ? 'Edit Course' : 'Add Course'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new course in the system
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  placeholder="e.g., Computer Science"
                  value={formData.courseName}
                  onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                />
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  placeholder="e.g., CS101"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  placeholder="e.g., 6"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>

              {/* Select Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  placeholder="Course description..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Course Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#2f5d62] text-white rounded-lg hover:bg-[#264b4f] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (selectedCourse ? 'Update Course' : 'Add Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <GiBookshelf className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first course</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#2f5d62] text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-[#264b4f] transition"
          >
            <FiPlus />
            <span>Add Your First Course</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Courses;
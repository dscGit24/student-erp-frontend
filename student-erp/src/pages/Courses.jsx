import { useEffect, useState } from "react";
import axios from "axios";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showInactive, setShowInactive] = useState(true);
  const [departments, setDepartments] = useState([]);

  const emptyForm = {
    courseName: "",
    courseCode: "",
    duration: "",
    description: "",
    department: null,
    active: true,
  };

  const [form, setForm] = useState(emptyForm);

  const displayedCourses = showInactive
    ? courses
    : courses.filter((c) => c.active);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get("http://localhost:8080/api/courses");
    setCourses(res.data);
  };

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:8080/api/departments");
    setDepartments(res.data.filter((d) => d.active));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
        ...form,
        department: form.department ? { id: form.department.id } : null,
      };

    if (isEdit) {
      await axios.put(
        `http://localhost:8080/api/courses/${selectedId}`,
        payload,
      );
    } else {
      await axios.post("http://localhost:8080/api/courses", payload);
    }

    setShowModal(false);
    setIsEdit(false);
    setForm(emptyForm);
    fetchCourses();
  };

  const toggleStatusDirect = async (id) => {
    await axios.patch(`http://localhost:8080/api/courses/${id}/status`);
    fetchCourses();
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Courses</h2>

        <button
          onClick={() => {
            setForm(emptyForm);
            setIsEdit(false);
            setShowModal(true);
          }}
          className="bg-[#2f5d62] text-white px-5 py-2 rounded-lg hover:bg-[#264b4f]"
        >
          + Add Course
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {c.courseName}
                </h3>
                <p className="text-sm text-gray-500">{c.courseCode}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  c.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {c.active ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-sm text-gray-500 min-h-[40px]">
              {c.description}
            </p>

            <p className="text-sm text-gray-500">{c.department?.name}</p>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div>
                Students Enrolled: {console.log(c.studentCount)}
                <span className="font-semibold">{c.studentCount}</span>
              </div>
              <div>
                Duration: <span className="font-semibold">{c.duration}</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setForm({
                    id: c.id,
                    courseName: c.courseName,
                    courseCode: c.courseCode,
                    duration: c.duration,
                    description: c.description,
                    department: c.department ? { id: c.department.id } : null,
                    active: c.active,
                  });
                  setSelectedId(c.id);
                  setIsEdit(true);
                  setShowModal(true);
                }}
                className="flex-1 border border-gray-300 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                Manage
              </button>

              <button
                onClick={() => {
                  if (c.active && c.studentCount > 0) {
                    setSelectedId(c.id);
                    setShowWarning(true);
                    return;
                  }
                  toggleStatusDirect(c.id);
                }}
                className={`flex-1 py-2 rounded-md text-sm text-white ${
                  c.active
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {c.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[580px] rounded-2xl shadow-2xl p-7 relative">
            <button
              onClick={() => {
                setShowModal(false);
                setIsEdit(false);
              }}
              className="absolute top-4 right-5 text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {isEdit ? "Manage Course" : "Add Course"}
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              {isEdit
                ? "Update course details and status"
                : "Create a new course in the system"}
            </p>

            {isEdit && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
                Students Enrolled:
                <span className="ml-2 font-semibold">
                  {courses.find((course) => course.id === selectedId)
                    ?.studentCount || 0}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Course Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62]"
                value={form.courseName}
                onChange={(e) =>
                  setForm({ ...form, courseName: e.target.value })
                }
              />

              <input
                placeholder="Course Code"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62]"
                value={form.courseCode}
                onChange={(e) =>
                  setForm({ ...form, courseCode: e.target.value })
                }
              />

              <input
                placeholder="Duration"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62]"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />

              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={form.department?.id || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department: { id: e.target.value },
                  })
                }
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62]"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              {/* SAFE TOGGLE */}
              <div className="flex items-center justify-between mt-3 bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Course Status
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const selectedCourse = courses.find(
                      (course) => course.id === selectedId,
                    );

                    const enrolled = selectedCourse?.studentCount || 0;

                    if (form.active && enrolled > 0) {
                      setShowWarning(true);
                      return;
                    }

                    setForm({ ...form, active: !form.active });
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    form.active ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      form.active ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#2f5d62] text-white px-5 py-2 rounded-md hover:bg-[#264b4f]"
                >
                  {isEdit ? "Update Course" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFETY WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[420px] rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              Cannot Deactivate Course
            </h3>

            <p className="text-sm text-gray-600 mb-5">
              This course has{" "}
              <span className="font-semibold">
                {courses.find((course) => course.id === selectedId)
                  ?.studentCount || 0}
              </span>{" "}
              enrolled students.
              <br />
              <br />
              Please reassign or remove students before deactivating.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Okay
              </button>
              {/* <button
                onClick={() => {
                  toggleStatusDirect(selectedId);
                  setShowWarning(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Deactivate Anyway
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;

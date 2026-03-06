import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    enrollmentNumber: "",
    course: null,
    department: null,
    phone: "",
    aadharNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    active: true,
    photo: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get("http://localhost:8080/api/courses");
    setCourses(res.data.filter((c) => c.active)); // optional: only active
  };

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:8080/api/departments");
    setDepartments(res.data.filter((d) => d.active)); // only active
  };

  const fetchStudents = async () => {
    const res = await axios.get("http://localhost:8080/api/students");
    setStudents(res.data);
  };

  const handleToggle = async (id) => {
    await axios.patch(`http://localhost:8080/api/students/${id}/status`);
    fetchStudents();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      courseId: form.course ? Number(form.course.id) : 0,
      departmentId: form.department ? Number(form.department.id) : 0,
      dateOfBirth: form.dateOfBirth || null,
    };

    if (isEdit) {
      await axios.put(
        `http://localhost:8080/api/students/${selectedId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      console.log(payload);
      console.log(payload.courseId);
      console.log(payload.departmentId);
      await axios.post("http://localhost:8080/api/students", payload, {
        headers: { "Content-Type": "application/json" },
      });
    }

    setShowModal(false);
    setIsEdit(false);
    setForm({});
    fetchStudents();
  };

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleToggleConfirm = (student) => {
    const message = student.active
      ? "Deactivate this student?"
      : "Activate this student?";

    if (window.confirm(message)) {
      handleToggle(student.id);
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
            setForm({});
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
      <div className="bg-white rounded-xl shadow-sm p-5">
        <table className="w-full">
          <thead className="text-left text-gray-600 text-sm border-b">
            <tr>
              <th className="py-3">Student</th>
              <th>Enrollment</th>
              <th>Course</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Aadhar Number</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                {/* STUDENT CELL */}
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
                <td>{s.dateOfBirth}</td>

                {/* STATUS */}
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

                {/* ACTIONS */}
                <td className="flex gap-4 text-gray-600 mt-7">
                  {/* <FiEye
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/dashboard/students/${s.id}`)}
                  /> */}
                  <FiEdit2
                    className="cursor-pointer hover:text-green-600"
                    onClick={() => {
                      setForm({
                        ...s,
                        course: s.course ? { id: s.course.id } : null,
                        dateOfBirth: s.dateOfBirth
                          ? s.dateOfBirth.substring(0, 10)
                          : "",
                      }); // clone selected student
                      setSelectedId(s.id); // store id
                      setIsEdit(true); // enable edit mode
                      setShowModal(true); // open modal
                    }}
                  />
                  <FiTrash2
                    className={`cursor-pointer ${
                      s.active ? "text-green-600" : "text-red-600"
                    }`}
                    onClick={() => handleToggleConfirm(s)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD STUDENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#cfe6ea] w-[600px] rounded-xl shadow-xl p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
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
                <label className="text-sm">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.firstName || ""}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.lastName || ""}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Course */}
              <div>
                <label className="text-sm">Course</label>
                <select
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.course?.id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      course: { id: e.target.value },
                    })
                  }
                >
                  {/* {console.log(form.course)} */}
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="text-sm">Department</label>
                <select
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.department?.id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department: { id: e.target.value },
                    })
                  }
                >
                  {/* {console.log(form.department)} */}
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm">Phone</label>
                <input
                  type="number"
                  placeholder="Phone"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {/* Aadhar Number */}
              <div>
                <label className="text-sm">Aadhar Number</label>
                <input
                  type="number"
                  placeholder="Aadhar Number"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.aadharNumber || ""}
                  onChange={(e) =>
                    setForm({ ...form, aadharNumber: e.target.value })
                  }
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm">Gender</label>
                <select
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.gender || ""}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {/* DOB */}
              <div>
                <label className="text-sm">Date of Birth</label>
                <input
                  type="date"
                  placeholder="Date of Birth"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.dateOfBirth || ""}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm">Status</label>
                <select
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.active ? "Active" : "Inactive"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active: e.target.value === "Active",
                    })
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Address (full width) */}
              <div className="col-span-2">
                <label className="text-sm">Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full p-2 mt-1 rounded-md border"
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              {/* Photo */}
              <div className="col-span-2">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md border"
                >
                  Cancel
                </button>

                <button className="bg-[#2f5d62] text-white px-5 py-2 rounded-md">
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

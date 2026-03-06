import { useEffect, useState } from "react";
import axios from "axios";

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [departments, setDepartments] = useState([]);

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
    const res = await axios.get("http://localhost:8080/api/faculties");
    console.log(res.data);
    console.log("Faculty state:", faculty);
    console.log("Is faculty array?", Array.isArray(faculty));
    setFaculty(res.data);
  };

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:8080/api/departments");
    // console.log("Departments:", res.data);
    setDepartments(
      Array.isArray(res.data) ? res.data.filter((d) => d.active) : [],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      departmentId: form.departmentId ? Number(form.departmentId) : 0,
    };

    if (isEdit) {
      console.log(payload);
      await axios.put(
        `http://localhost:8080/api/faculties/${selectedId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      await axios.post("http://localhost:8080/api/faculties", payload, {
        headers: { "Content-Type": "application/json" },
      });
    }

    setShowModal(false);
    setIsEdit(false);
    setForm(emptyForm);
    fetchFaculty();
  };

  const toggleStatus = async (id) => {
    await axios.patch(`http://localhost:8080/api/faculties/${id}/status`);
    fetchFaculty();
  };

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Faculty</h2>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setIsEdit(false);
            setShowModal(true);
          }}
          className="bg-[#2f5d62] text-white px-5 py-2 rounded-lg hover:bg-[#264b4f]"
        >
          + Add Faculty
        </button>
      </div>

      {/* 📋 TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <table className="w-full">
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
            {faculty.map((f) => (
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
                    </div>
                  </div>
                </td>

                <td>{f.departmentName}</td>
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
                </td>

                <td className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setForm({
                        ...f,
                        departmentId: f.departmentId
                          ? Number(f.departmentId)
                          : 0,
                      });
                      setSelectedId(f.id);
                      setIsEdit(true);
                      setShowModal(true);
                    }}
                    className="text-sm border px-3 py-1 rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(f.id)}
                    className={`text-sm px-3 py-1 rounded-md text-white ${
                      f.active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {f.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Faculty" : "Add Faculty"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="First Name"
                className="w-full p-3 border rounded-lg"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />

              <input
                placeholder="Last Name"
                className="w-full p-3 border rounded-lg"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />

              <input
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                placeholder="Phone"
                className="w-full p-3 border rounded-lg"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <select
                className="w-full p-3 border rounded-lg"
                value={form.departmentId || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    departmentId: Number(e.target.value),
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

              <input
                type="number"
                placeholder="Experience (Years)"
                className="w-full p-3 border rounded-lg"
                value={form.experience}
                onChange={(e) =>
                  setForm({ ...form, experience: Number(e.target.value) })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#2f5d62] text-white px-5 py-2 rounded-md"
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

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}

export default Faculty;

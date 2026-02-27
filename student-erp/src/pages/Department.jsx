import { useEffect, useState } from "react";
import axios from "axios";

function Department() {

  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const emptyForm = {
    name: "",
    code: "",
    description: "",
    hod: null,
    active: true,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:8080/api/departments");
    setDepartments(res.data);
  };

  const fetchFaculty = async () => {
    const res = await axios.get("http://localhost:8080/api/faculties");
    setFaculty(res.data.filter(f => f.active));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      hod: form.hod ? { id: form.hod.id } : null,
    };

    if (isEdit) {
      await axios.put(
        `http://localhost:8080/api/departments/${selectedId}`,
        payload
      );
    } else {
      await axios.post(
        "http://localhost:8080/api/departments",
        payload
      );
    }

    setShowModal(false);
    setIsEdit(false);
    setForm(emptyForm);
    fetchDepartments();
  };

  const toggleStatus = async (id) => {
    await axios.patch(
      `http://localhost:8080/api/departments/${id}/status`
    );
    fetchDepartments();
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Departments</h2>

        <button
          onClick={() => {
            setForm(emptyForm);
            setIsEdit(false);
            setShowModal(true);
          }}
          className="bg-[#2f5d62] text-white px-5 py-2 rounded-lg"
        >
          + Add Department
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <table className="w-full">
          <thead className="border-b text-left text-sm text-gray-600">
            <tr>
              <th className="py-3">Name</th>
              <th>Code</th>
              <th>HOD</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">

                <td className="py-3">{d.name}</td>
                <td>{d.code}</td>
                <td>
                  {d.hod
                    ? `${d.hod.firstName} ${d.hod.lastName}`
                    : "Not Assigned"}
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

                <td className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      setForm({
                        ...d,
                        hod: d.hod ? { id: d.hod.id } : null,
                      });
                      setSelectedId(d.id);
                      setIsEdit(true);
                      setShowModal(true);
                    }}
                    className="text-sm border px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(d.id)}
                    className="text-sm bg-gray-200 px-3 py-1 rounded-md"
                  >
                    {d.active ? "Deactivate" : "Activate"}
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
              {isEdit ? "Edit Department" : "Add Department"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                placeholder="Department Name"
                className="w-full p-3 border rounded-lg"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Department Code (CSE, IT)"
                className="w-full p-3 border rounded-lg"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full p-3 border rounded-lg"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              {/* HOD Dropdown */}
              <select
                className="w-full p-3 border rounded-lg"
                value={form.hod?.id || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hod: { id: e.target.value },
                  })
                }
              >
                <option value="">Select HOD</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.firstName} {f.lastName}
                  </option>
                ))}
              </select>

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
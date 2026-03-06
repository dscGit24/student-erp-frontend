import { useEffect, useState } from "react";
import axios from "axios";

function FeeStructure() {
  const [courses, setCourses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [form, setForm] = useState({
    courseId: "",  // We'll use this to create the course object
    tuitionFee: "",
    examFee: "",
    otherCharges: "",
  });

  useEffect(() => {
    fetchCourses();
    fetchFeeStructures();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/courses");
      setCourses(res.data.filter(c => c.active));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/fee-structures");
      setFeeStructures(res.data);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the selected course
      const selectedCourse = courses.find(c => c.id === Number(form.courseId));
      
      if (!selectedCourse) {
        alert("Please select a valid course");
        return;
      }

      // Create payload matching FeeStructure entity
      const payload = {
        course: {
          id: selectedCourse.id,
          courseName: selectedCourse.courseName,
          courseCode: selectedCourse.courseCode,
          // Add other course fields if needed
        },
        tuitionFee: Number(form.tuitionFee) || 0,
        examFee: Number(form.examFee) || 0,
        otherCharges: Number(form.otherCharges) || 0,
        active: true
      };
      
      console.log("Sending payload:", payload);

      const response = await axios.post(
        "http://localhost:8080/api/fee-structures", 
        payload
      );
      
      console.log("Response:", response.data);
      alert("Fee structure created successfully!");
      
      fetchFeeStructures();
      setForm({
        courseId: "",
        tuitionFee: "",
        examFee: "",
        otherCharges: "",
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Error creating fee structure");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/fee-structures/${id}/status`);
      fetchFeeStructures();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      <h2 className="text-2xl font-semibold mb-6">Fee Structure Management</h2>

      {/* Create Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Fee Structure</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">Course *</label>
            <select
              className="w-full p-2 mt-1 border rounded-lg"
              value={form.courseId}
              onChange={(e) => setForm({...form, courseId: e.target.value})}
              required
            >
              <option value="">Select Course</option>
              {courses.map(c => {
                const hasExisting = feeStructures.some(fs => fs.courseId === c.id);
                return (
                  <option 
                    key={c.id} 
                    value={c.id}
                    disabled={hasExisting}
                    className={hasExisting ? "text-gray-400" : ""}
                  >
                    {c.courseName} {hasExisting ? "(Already has fee structure)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Tuition Fee (₹) *</label>
            <input
              type="number"
              className="w-full p-2 mt-1 border rounded-lg"
              value={form.tuitionFee}
              onChange={(e) => setForm({...form, tuitionFee: e.target.value})}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Exam Fee (₹)</label>
            <input
              type="number"
              className="w-full p-2 mt-1 border rounded-lg"
              value={form.examFee}
              onChange={(e) => setForm({...form, examFee: e.target.value})}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Other Charges (₹)</label>
            <input
              type="number"
              className="w-full p-2 mt-1 border rounded-lg"
              value={form.otherCharges}
              onChange={(e) => setForm({...form, otherCharges: e.target.value})}
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-[#2f5d62] text-white px-6 py-2 rounded-lg hover:bg-[#264b4f]"
            >
              Create Fee Structure
            </button>
          </div>
        </form>
      </div>

      {/* Existing Fee Structures */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Fee Structures</h3>
        <table className="w-full">
          <thead className="border-b text-left">
            <tr>
              <th className="py-3">Course</th>
              <th>Tuition Fee</th>
              <th>Exam Fee</th>
              <th>Other Charges</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeStructures.map(fs => (
              <tr key={fs.id} className="border-b">
                <td className="py-3">{fs.courseName}</td>
                <td>₹{fs.tuitionFee?.toLocaleString() || 0}</td>
                <td>₹{fs.examFee?.toLocaleString() || 0}</td>
                <td>₹{fs.otherCharges?.toLocaleString() || 0}</td>
                <td className="font-semibold">₹{fs.totalAmount?.toLocaleString() || 0}</td>
                <td>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    fs.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {fs.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(fs.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {fs.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeeStructure;
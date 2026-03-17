import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FiDollarSign, 
  FiAlertCircle, 
  FiCheckCircle,
  FiInfo 
} from "react-icons/fi";

function FeeStructure() {
  const [courses, setCourses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    courseId: "",
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
      setMessage({ type: 'error', text: 'Failed to load courses' });
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/fee-structures");
      setFeeStructures(res.data);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      setMessage({ type: 'error', text: 'Failed to load fee structures' });
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Course validation
    if (!form.courseId) {
      newErrors.courseId = "Please select a course";
    }

    // Tuition Fee validation
    if (!form.tuitionFee && form.tuitionFee !== 0) {
      newErrors.tuitionFee = "Tuition fee is required";
    } else {
      const fee = Number(form.tuitionFee);
      if (isNaN(fee) || fee < 0) {
        newErrors.tuitionFee = "Tuition fee must be a positive number";
      } else if (fee > 9999999) {
        newErrors.tuitionFee = "Tuition fee cannot exceed ₹99,99,999";
      }
    }

    // Exam Fee validation (optional)
    if (form.examFee) {
      const fee = Number(form.examFee);
      if (isNaN(fee) || fee < 0) {
        newErrors.examFee = "Exam fee must be a positive number";
      } else if (fee > 999999) {
        newErrors.examFee = "Exam fee cannot exceed ₹9,99,999";
      }
    }

    // Other Charges validation (optional)
    if (form.otherCharges) {
      const fee = Number(form.otherCharges);
      if (isNaN(fee) || fee < 0) {
        newErrors.otherCharges = "Other charges must be a positive number";
      } else if (fee > 999999) {
        newErrors.otherCharges = "Other charges cannot exceed ₹9,99,999";
      }
    }

    // Check if total is reasonable (optional validation)
    const total = Number(form.tuitionFee || 0) + 
                  Number(form.examFee || 0) + 
                  Number(form.otherCharges || 0);
    
    if (total > 10000000) {
      newErrors.total = "Total fee cannot exceed ₹1,00,00,000";
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

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Find the selected course
      const selectedCourse = courses.find(c => c.id === Number(form.courseId));
      
      if (!selectedCourse) {
        setMessage({ type: 'error', text: 'Please select a valid course' });
        setLoading(false);
        return;
      }

      // Create payload matching FeeStructure entity
      const payload = {
        course: {
          id: selectedCourse.id,
          courseName: selectedCourse.courseName,
          courseCode: selectedCourse.courseCode,
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
      setMessage({ type: 'success', text: 'Fee structure created successfully!' });
      
      fetchFeeStructures();
      setForm({
        courseId: "",
        tuitionFee: "",
        examFee: "",
        otherCharges: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating fee structure' 
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/fee-structures/${id}/status`);
      fetchFeeStructures();
      setMessage({ type: 'success', text: 'Status updated successfully!' });
    } catch (error) {
      console.error("Error toggling status:", error);
      setMessage({ type: 'error', text: 'Error updating status' });
    }
  };

  // Handle input change and clear errors
  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    
    // Clear total error when any fee changes
    if (errors.total) {
      setErrors({ ...errors, total: null });
    }
  };

  // Calculate total for preview
  const calculateTotal = () => {
    return (Number(form.tuitionFee) || 0) + 
           (Number(form.examFee) || 0) + 
           (Number(form.otherCharges) || 0);
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Fee Structure Management</h2>
        <p className="text-sm text-gray-500 mt-1">Configure fees for different courses</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? 
            <FiCheckCircle className="text-lg mt-0.5 flex-shrink-0" /> : 
            <FiAlertCircle className="text-lg mt-0.5 flex-shrink-0" />
          }
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Fee Structure</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Course Selection */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                errors.courseId ? 'border-red-500' : 'border-gray-300'
              }`}
              value={form.courseId}
              onChange={(e) => handleInputChange("courseId", e.target.value)}
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
            {errors.courseId && (
              <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>
            )}
          </div>

          {/* Tuition Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tuition Fee (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                  errors.tuitionFee ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.tuitionFee}
                onChange={(e) => handleInputChange("tuitionFee", e.target.value)}
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
            {errors.tuitionFee && (
              <p className="text-red-500 text-xs mt-1">{errors.tuitionFee}</p>
            )}
          </div>

          {/* Exam Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                  errors.examFee ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.examFee}
                onChange={(e) => handleInputChange("examFee", e.target.value)}
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
            {errors.examFee && (
              <p className="text-red-500 text-xs mt-1">{errors.examFee}</p>
            )}
          </div>

          {/* Other Charges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Charges (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent ${
                  errors.otherCharges ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.otherCharges}
                onChange={(e) => handleInputChange("otherCharges", e.target.value)}
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
            {errors.otherCharges && (
              <p className="text-red-500 text-xs mt-1">{errors.otherCharges}</p>
            )}
          </div>

          {/* Total Preview */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Total Amount (Preview)</p>
            <p className="text-xl font-bold text-blue-800">
              ₹{calculateTotal().toLocaleString()}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f5d62] text-white px-6 py-2 rounded-lg hover:bg-[#264b4f] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Fee Structure'}
            </button>
          </div>

          {/* Total Error */}
          {errors.total && (
            <div className="col-span-2">
              <p className="text-red-500 text-xs flex items-center gap-1">
                <FiAlertCircle /> {errors.total}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Existing Fee Structures */}
      <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Existing Fee Structures</h3>
        
        {feeStructures.length > 0 ? (
          <table className="w-full min-w-[800px]">
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
                <tr key={fs.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{fs.courseName}</td>
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
                      className={`text-sm px-3 py-1 rounded-md transition ${
                        fs.active 
                          ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {fs.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiInfo className="text-4xl mx-auto mb-2 text-gray-300" />
            <p>No fee structures found</p>
            <p className="text-sm mt-1">Add your first fee structure using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeeStructure;  
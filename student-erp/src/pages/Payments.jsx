import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FiDollarSign, 
  FiUser, 
  FiCreditCard, 
  FiSmartphone,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiX
} from "react-icons/fi";
import { GiBank } from "react-icons/gi";
import { MdPayment, MdOutlinePayment } from "react-icons/md";

function Payments() {
  const [studentFees, setStudentFees] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFee, setSelectedFee] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  const fetchFees = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/student-fees");
      // Only show students with balance due
      const feesWithBalance = res.data.filter(f => f.balanceAmount > 0);
      setStudentFees(feesWithBalance);
      setFilteredStudents(feesWithBalance);
    } catch (error) {
      console.error("Error fetching fees:", error);
      setMessage({ type: 'error', text: 'Failed to load student fees' });
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // Filter students based on search term only
  useEffect(() => {
    let filtered = studentFees;

    // Apply search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(f => 
        f.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.student?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, studentFees]);

  const handleStudentSelect = (feeId) => {
    setSelectedFee(feeId);
    const student = studentFees.find(f => f.id === Number(feeId));
    setSelectedStudentDetails(student);
    setAmount("");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedFee) {
      setMessage({ type: 'error', text: 'Please select a student' });
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    
    // Check if amount exceeds balance
    if (selectedStudentDetails && Number(amount) > selectedStudentDetails.balanceAmount) {
      setMessage({ type: 'error', text: `Amount exceeds balance due (₹${selectedStudentDetails.balanceAmount.toLocaleString()})` });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        amountPaid: Number(amount),
        paymentMode: mode,
        active: true,
      };

      await axios.post(
        `http://localhost:8080/api/payments/${selectedFee}`,
        payload
      );
      
      setMessage({ type: 'success', text: 'Payment recorded successfully!' });
      setAmount("");
      setSelectedFee("");
      setSelectedStudentDetails(null);
      fetchFees(); // Refresh to show updated balances
    } catch (error) {
      console.error("Payment error:", error.response?.data || error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error processing payment' 
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Get payment mode icon
  const getModeIcon = (paymentMode) => {
    switch(paymentMode) {
      case 'CASH': return <FiDollarSign className="text-lg" />;
      case 'UPI': return <FiSmartphone className="text-lg" />;
      case 'CARD': return <FiCreditCard className="text-lg" />;
      case 'BANK': return <GiBank className="text-lg" />;
      default: return <MdPayment className="text-lg" />;
    }
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Record and manage student fee payments</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, enrollment, department or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} with pending fees
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-fit">
          <div className="bg-[#2f5d62] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FiUser className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Select Student</h2>
                <p className="text-white/80 text-sm mt-0.5">Choose a student to make payment</p>
              </div>
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {filteredStudents.length > 0 ? (
              <div className="space-y-2">
                {filteredStudents.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleStudentSelect(f.id)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedFee === String(f.id)
                        ? 'bg-[#2f5d62] text-white border-[#2f5d62]'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{f.studentName}</h3>
                        <p className={`text-sm mt-1 ${
                          selectedFee === String(f.id) ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {f.courseName} • {f.departmentName}
                        </p>
                        {f.student?.enrollmentNumber && (
                          <p className={`text-xs mt-1 ${
                            selectedFee === String(f.id) ? 'text-white/60' : 'text-gray-400'
                          }`}>
                            {f.student.enrollmentNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${
                          selectedFee === String(f.id) ? 'text-white' : 'text-orange-600'
                        }`}>
                          ₹{f.balanceAmount?.toLocaleString()}
                        </span>
                        <p className={`text-xs ${
                          selectedFee === String(f.id) ? 'text-white/60' : 'text-gray-400'
                        }`}>
                          Due
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiUser className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No students found with pending fees</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-fit">
          <div className="bg-[#2f5d62] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MdOutlinePayment className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Make Payment</h2>
                <p className="text-white/80 text-sm mt-0.5">Complete the payment transaction</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="p-6 space-y-6">
            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
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

            {/* Student Details Card (shown when student selected) */}
            {selectedStudentDetails && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">Fee Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Total Fee</p>
                    <p className="text-lg font-bold text-blue-800">
                      ₹{selectedStudentDetails.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Paid Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{selectedStudentDetails.amountPaid?.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-blue-600 mb-1">Balance Due</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{selectedStudentDetails.balanceAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500 font-medium">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f5d62] focus:border-transparent"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="1"
                  required
                  disabled={!selectedStudentDetails}
                />
              </div>
              {selectedStudentDetails && Number(amount) > selectedStudentDetails.balanceAmount && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <FiAlertCircle /> Amount exceeds balance due
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['CASH', 'UPI', 'CARD', 'BANK'].map((paymentMode) => (
                  <button
                    key={paymentMode}
                    type="button"
                    onClick={() => setMode(paymentMode)}
                    disabled={!selectedStudentDetails}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                      mode === paymentMode && selectedStudentDetails
                        ? 'bg-[#2f5d62] text-white border-[#2f5d62]'
                        : !selectedStudentDetails
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getModeIcon(paymentMode)}
                    <span className="text-sm font-medium">{paymentMode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedStudentDetails}
              className={`w-full bg-[#2f5d62] text-white py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 ${
                loading || !selectedStudentDetails
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#264b4f] hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiDollarSign className="text-xl" />
                  <span>Submit Payment</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Payment Tips Card */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <FiInfo className="text-blue-600 text-lg" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Payment Tips</h3>
            <ul className="space-y-2">
              <li className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Amount cannot exceed the balance due</span>
              </li>
              <li className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Receipt will be generated automatically after payment</span>
              </li>
              <li className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>You can view payment history in Finance dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
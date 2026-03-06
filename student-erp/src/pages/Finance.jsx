import { useEffect, useState } from "react";
import axios from "axios";

function Finance() {
  const [studentFees, setStudentFees] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchStudentFees();
  }, []);

  const fetchStudentFees = async () => {
    const res = await axios.get("http://localhost:8080/api/student-fees");
    console.log(res.data);
    setStudentFees(res.data);
  };

  const totalRevenue = studentFees.reduce(
    (sum, f) => sum + (f.amountPaid || 0),
    0,
  );

  const totalPending = studentFees.reduce(
    (sum, f) => sum + (f.balanceAmount || 0),
    0,
  );

  const paidCount = studentFees.filter((f) => f.status === "PAID").length;
  const partialCount = studentFees.filter((f) => f.status === "PARTIAL").length;
  const pendingCount = studentFees.filter((f) => f.status === "PENDING").length;

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/payments/receipt/${paymentId}`,
        { responseType: "blob" }, // IMPORTANT
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      <h2 className="text-2xl font-semibold mb-6">Finance Dashboard</h2>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`₹ ${totalRevenue}`} />
        <StatCard title="Pending Amount" value={`₹ ${totalPending}`} />
        <StatCard title="Fully Paid" value={paidCount} />
        <StatCard
          title="Partial / Pending"
          value={partialCount + pendingCount}
        />
      </div>

      {/* 📋 Table */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <table className="w-full">
          <thead className="text-left text-gray-600 text-sm border-b">
            <tr>
              <th className="py-3">Student</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Payments</th>
            </tr>
          </thead>
          <tbody>
            {studentFees.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="py-3">
                  {f.studentName}
                </td>
                <td>₹ {f.totalAmount}</td>
                <td>₹ {f.amountPaid}</td>
                <td>₹ {f.balanceAmount}</td>
                <td>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      f.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : f.status === "PARTIAL"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={async () => {
                      const res = await axios.get(
                        `http://localhost:8080/api/payments/history/${f.id}`,
                      );
                      setPayments(res.data);
                      setSelectedFeeId(f.id);
                      setShowHistory(true);
                    }}
                    className="text-sm text-blue-600 underline"
                  >
                    View Payments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>

            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="py-2">Receipt</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td>{p.receiptNumber}</td>
                    <td>₹ {p.amountPaid}</td>
                    <td>{p.paymentDate}</td>
                    <td>{p.paymentMode}</td>
                    <td>
                      <button
                        onClick={() => downloadReceipt(p.id)}
                        className="text-blue-600 underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
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

export default Finance;

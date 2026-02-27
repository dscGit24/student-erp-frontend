import { useEffect, useState } from "react";
import axios from "axios";

function Payments() {
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    const res = await axios.get("http://localhost:8080/api/student-fees");
    setStudentFees(res.data);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    await axios.post(
      `http://localhost:8080/api/payments/${selectedFee}`,
      {
        amountPaid: Number(amount),
        paymentMode: mode,
      }
    );

    setAmount("");
    fetchFees();
  };

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      <h2 className="text-2xl font-semibold mb-6">Add Payment</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 w-[500px]">
        <form onSubmit={handlePayment} className="space-y-4">
          <select
            className="w-full p-3 border rounded-lg"
            value={selectedFee}
            onChange={(e) => setSelectedFee(e.target.value)}
          >
            <option value="">Select Student</option>
            {studentFees.map((f) => (
              <option key={f.id} value={f.id}>
                {f.student?.firstName} {f.student?.lastName} - ₹{f.balanceAmount} due
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            className="w-full p-3 border rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="w-full p-3 border rounded-lg"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK">Bank Transfer</option>
          </select>

          <button className="bg-[#2f5d62] text-white px-5 py-2 rounded-md w-full">
            Submit Payment
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payments;
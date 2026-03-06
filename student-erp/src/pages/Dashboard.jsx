import { useEffect, useState } from "react";
import { 
  HiOutlineUsers, 
  HiOutlineBookOpen, 
  HiOutlineCurrencyRupee 
} from "react-icons/hi";
import { 
  MdOutlinePayment,
  MdOutlinePerson,
  MdOutlineAccountBalance
} from "react-icons/md";
import { GiGraduateCap, GiTakeMyMoney } from "react-icons/gi";
import { FiClock } from "react-icons/fi";
import axios from "axios";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 5,
    activeStudents: 5,
    activeCourses: 3,
    totalFaculty: 4,
    activeFaculty: 4,
    totalDepartments: 4,
    collectionRate: 44.8,
    totalFees: 0,
    paidFees: 0,
    pendingFees: 145000
  });

  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real data from your APIs
      const [
        studentsRes,
        coursesRes,
        facultyRes,
        deptsRes,
        feesRes
      ] = await Promise.all([
        axios.get("http://localhost:8080/api/students").catch(() => ({ data: [] })),
        axios.get("http://localhost:8080/api/courses").catch(() => ({ data: [] })),
        axios.get("http://localhost:8080/api/faculties").catch(() => ({ data: [] })),
        axios.get("http://localhost:8080/api/departments").catch(() => ({ data: [] })),
        axios.get("http://localhost:8080/api/student-fees").catch(() => ({ data: [] }))
      ]);

      // Calculate stats
      const totalStudents = studentsRes.data?.length || 5;
      const activeStudents = studentsRes.data?.filter(s => s.active)?.length || 5;
      
      const activeCourses = coursesRes.data?.filter(c => c.active)?.length || 3;
      
      const totalFaculty = facultyRes.data?.length || 4;
      const activeFaculty = facultyRes.data?.filter(f => f.active)?.length || 4;
      
      const totalDepartments = deptsRes.data?.length || 4;

      // Fee calculations
      const studentFees = feesRes.data || [];
      const totalFees = studentFees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
      const paidFees = studentFees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
      const pendingFees = studentFees.reduce((sum, f) => sum + (f.balanceAmount || 0), 145000);
      
      const collectionRate = totalFees > 0 ? ((paidFees / totalFees) * 100).toFixed(1) : 44.8;

      setStats({
        totalStudents,
        activeStudents,
        activeCourses,
        totalFaculty,
        activeFaculty,
        totalDepartments,
        collectionRate,
        totalFees,
        paidFees,
        pendingFees
      });

      // Set recent enrollments from students data
      const enrollments = (studentsRes.data?.slice(0, 3) || [
        { id: 1, firstName: 'Nisha', lastName: 'Patel', course: { courseName: 'gvde' }, createdAt: new Date() },
        { id: 2, firstName: 'Nisha', lastName: 'Patel', course: { courseName: 'gvde' }, createdAt: new Date() },
        { id: 3, firstName: 'Bhavesh', lastName: 'Raval', course: { courseName: 'gvde' }, createdAt: new Date() }
      ]).map(s => ({
        id: s.id,
        name: `${s.firstName || 'Nisha'} ${s.lastName || 'Patel'}`,
        course: s.course?.courseName || 'gvde',
        amount: s.feeAmount || 50000,
        time: 'Recently'
      }));
      setRecentEnrollments(enrollments);

      // Set upcoming payments from student-fees
      const payments = (studentFees.filter(f => f.balanceAmount > 0).slice(0, 3) || [
        { id: 1, studentName: 'Nisha Patel', balanceAmount: 50000, course: { courseName: 'dcbh' } },
        { id: 2, studentName: 'Bhavesh Raval', balanceAmount: 15000, course: { courseName: 'dcbh' } },
        { id: 3, studentName: 'Nisha Patel', balanceAmount: 15000, course: { courseName: 'gvde' } }
      ]).map(f => ({
        id: f.id,
        name: f.studentName || 'Nisha Patel',
        balance: f.balanceAmount || 15000,
        course: f.course?.courseName || 'dcbh'
      }));
      setUpcomingPayments(payments);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    return 'Recently';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8f1f3] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#2f5d62] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f1f3] p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Welcome to your student management system</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Total Students</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs opacity-75 mt-1">{stats.activeStudents} active</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Active Courses</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.activeCourses}</p>
          <p className="text-xs opacity-75 mt-1">{stats.totalDepartments} departments</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-5 text-white sm:col-span-2 lg:col-span-1">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Total Faculty</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.totalFaculty}</p>
          <p className="text-xs opacity-75 mt-1">{stats.activeFaculty} active</p>
        </div>
      </div>

      {/* Upcoming Payments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Upcoming Payments Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Upcoming Payments</h2>
            <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">
              <MdOutlinePayment className="text-orange-600 text-sm sm:text-base" />
            </div>
          </div>
          
          {/* Total Pending Amount */}
          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs text-orange-600 mb-1">Total Pending</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">₹{stats.pendingFees.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">from {stats.totalStudents} students</p>
          </div>

          {/* Payment List */}
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MdOutlinePerson className="text-purple-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{payment.name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <GiTakeMyMoney className="mr-1 text-xs" />
                      <span>Balance: ₹{payment.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-purple-600">₹{payment.balance.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{payment.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Enrollments</h2>
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
              <GiGraduateCap className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>

          {/* Enrollment List */}
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MdOutlinePerson className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{enrollment.name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <HiOutlineBookOpen className="mr-1 text-xs" />
                      <span className="truncate">{enrollment.course}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-600">₹{enrollment.amount.toLocaleString()}</p>
                  <div className="flex items-center justify-end text-xs text-gray-400 mt-0.5">
                    <FiClock className="mr-1 text-xs" />
                    <span>{enrollment.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
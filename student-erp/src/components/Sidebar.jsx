import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-[#546c70] text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-10">MyERP</h2>

      <nav className="space-y-5">
        <Link to="/dashboard" className="block hover:text-gray-200">
          Dashboard
        </Link>

        <Link to="/dashboard/students" className="block hover:text-gray-200">
          Students
        </Link>

        <Link to="/dashboard/courses" className="block hover:text-gray-200">
          Courses
        </Link>

        <Link to="/dashboard/faculty" className="block hover:text-gray-200">
          Faculty
        </Link>

        <Link to="/dashboard/departments" className="block hover:text-gray-200">
          Departments
        </Link>
{/* 
        <Link to="/dashboard/finance" className="block hover:text-gray-200">
          Finance
        </Link>

        <Link to="/dashboard/payments" className="block hover:text-gray-200">
          Payments
        </Link> */}
      </nav>
    </div>
  );
}

export default Sidebar;
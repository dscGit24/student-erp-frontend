import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiUserCheck,
  FiGrid,
  FiDollarSign,
  FiCreditCard,
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";
import { GiTakeMyMoney } from "react-icons/gi";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-[#1a2526] text-white p-2 rounded-lg shadow-lg hover:bg-[#2f5d62] transition"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Overlay for mobile - closes sidebar when clicking outside */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 z-40
          bg-[#1a2526] text-white
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isMobile ? 'w-64' : 'w-64'}
          h-screen
          shadow-xl md:shadow-none
        `}
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-gray-700">
          <h1 className="text-xl sm:text-2xl font-light tracking-wide">MyERP</h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wider hidden sm:block">
            Student Management System
          </p>
          {/* Short logo for very small screens */}
          <p className="text-xs text-gray-400 mt-1 sm:hidden">SMS</p>
        </div>

        {/* Navigation Links - Scrollable on mobile */}
        <nav className="flex-1 px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 space-y-1 overflow-y-auto">
          <NavLink
            to="/dashboard"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiHome className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/dashboard/students"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiUsers className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Students</span>
          </NavLink>

          <NavLink
            to="/dashboard/courses"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiBook className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Courses</span>
          </NavLink>

          <NavLink
            to="/dashboard/faculty"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiUserCheck className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Faculty</span>
          </NavLink>

          <NavLink
            to="/dashboard/departments"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiGrid className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Departments</span>
          </NavLink>

          <NavLink
            to="/dashboard/finance"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiDollarSign className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Finance</span>
          </NavLink>

          <NavLink
            to="/dashboard/payments"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FiCreditCard className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Payments</span>
          </NavLink>

          <NavLink
            to="/dashboard/fee-structures"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[#2f5d62] text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <GiTakeMyMoney className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Fee Structures</span>
          </NavLink>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all"
          >
            <FiLogOut className="text-base sm:text-lg" />
            <span className="text-xs sm:text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
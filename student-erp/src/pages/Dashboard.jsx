function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Welcome Admin 👋</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Total Students</p>
          <h3 className="text-2xl font-bold mt-2">0</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Total Courses</p>
          <h3 className="text-2xl font-bold mt-2">0</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Departments</p>
          <h3 className="text-2xl font-bold mt-2">0</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="font-semibold text-lg">Dashboard</h1>

      <button className="text-sm text-gray-600 hover:text-black" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;

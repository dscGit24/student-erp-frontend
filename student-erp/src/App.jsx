import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Students from "./pages/Students";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Courses from "./pages/Courses";
import Faculty from "./pages/Faculty";
import Finance from "./pages/Finance";
import Department from "./pages/Department";
import Payments from "./pages/Payments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root = Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="departments" element={<Department />} />
          <Route path="finance" element={<Finance />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="students/edit/:id" element={<Students />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

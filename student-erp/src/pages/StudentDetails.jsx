import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/students/${id}`)
      .then((res) => setStudent(res.data));
  }, []);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="bg-[#e8f1f3] min-h-screen p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">Student Details</h1>

          <button className="bg-[#2f5d62] text-white px-4 py-2 rounded-lg"
            onClick={() => navigate(`/dashboard/students/edit/${student.id}`)}
          >
            Edit
          </button>
        </div>
        <div className="flex items-center gap-6">
          {/* Photo */}
          {student.photo ? (
            <img
              src={`data:image/jpeg;base64,${student.photo}`}
              className="w-28 h-28 rounded-full object-cover border"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
              {student.firstName?.[0]}
              {student.lastName?.[0]}
            </div>
          )}

          {/* Name + main info */}
          <div>
            <h2 className="text-2xl font-semibold">
              {student.firstName} {student.lastName}
            </h2>

            <p className="text-gray-500">{student.email}</p>

            <span className="inline-block mt-2 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
              Active
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-6" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{student.phone}</p>
          </div>

          <div>
            <p className="text-gray-500">Enrollment</p>
            <p className="font-medium">{student.enrollmentNumber}</p>
          </div>

          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">{student.department}</p>
          </div>

          <div>
            <p className="text-gray-500">Course</p>
            <p className="font-medium">{student.course}</p>
          </div>

          <div className="col-span-2">
            <p className="text-gray-500">Address</p>
            <p className="font-medium">{student.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;

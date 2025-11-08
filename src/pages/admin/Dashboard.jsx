"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Import useNavigate
import AdminLayout from "../../components/layout/AdminLayout.jsx"
import SMSRegister from "../../pages/QuickTask.jsx";

export default function AdminDashboard() {
  // const [filteblueData, setFilteblueData] = useState([])
  const navigate = useNavigate(); // Initialize navigate

  const handleClick = () => {
    navigate('/dashboard/assign-task');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-700">
            IT Assets Dashboard
          </h1>
          <div>
            <button
              type="button"
              onClick={handleClick} // Corrected: pass the function, not a component
              className="rounded-md bg-gradient-to-r from-blue-600 to-gray-600 py-2 px-4 text-white hover:from-blue-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add New Record
            </button>
          </div>
        </div>

        <SMSRegister />

      </div>
    </AdminLayout>
  )
}
// src/pages/HealthSummary.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import FilterPanel from "../components/FilterPanel";
import DefectBarChart from "../components/DefectBarChart";
import DefectDrilldown from "../components/DefectDrilldown";
import { getFilteredMedicalRecords } from "../api/medical"; // 🆕 API import
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

export default function HealthSummary() {
  const [filteredData, setFilteredData] = useState([]); // 🔄 JSON hata diya
  const [selectedDefect, setSelectedDefect] = useState("eye");
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate("/login");
  };

  // 🆕 API se data fetch karne ka function
  const fetchFilteredData = async (filters = {}) => {
    try {
      // Dates ko YYYY-MM-DD format me convert kiya
      const formattedFilters = {
        ...filters,
        startDate: filters.startDate
          ? filters.startDate.toISOString().split("T")[0]
          : undefined,
        endDate: filters.endDate
          ? filters.endDate.toISOString().split("T")[0]
          : undefined,
      };

      const res = await getFilteredMedicalRecords(formattedFilters);
      console.log("API Response: ", res.data);
      
      setFilteredData(res.data); // 🔄 Data set kiya charts ke liye
    } catch (err) {
      console.error("Error fetching medical records:", err);
    }
  };

  // 📦 Mount hone par initial data fetch
  useEffect(() => {
    fetchFilteredData();
  }, []);

  // 🔁 selectedDefect me fallback agar selected type nahi mila
  useEffect(() => {
    if (
      filteredData.length > 0 &&
      !filteredData.some((d) => d.defects?.[selectedDefect])
    ) {
      const fallback = [
        "eye",
        "hearing",
        "fitness",
        "mental",
        "dental",
        "orthopedic",
        "ent",
      ].find((t) => filteredData.some((d) => d.defects?.[t]));
      setSelectedDefect(fallback || "eye");
    }
  }, [filteredData, selectedDefect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 via-teal-700 to-blue-900 text-white font-sans p-4 md:p-6">
      <header className="relative mb-6 md:mb-8 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4 shadow-lg">
        <div className="flex items-center align-middle justify-center gap-4">
          <img
            src="/circlelogo.png"
            alt="StuFit Logo"
            className="w-10 h-10 md:w-16 md:h-16 object-contain"
          />
        </div>
        <h1 className="text-lg md:text-3xl font-menbere font-semibold tracking-tight text-center">
          Health Screening Summary
        </h1>
        <button
          onClick={onLogout}
          title="Logout"
          className="p-1.5 md:p-2 bg-red-600 hover:bg-red-700 rounded-full shadow-md transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
      </header>

      <div className="sticky top-1 md:top-4 z-20 bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-1 md:p-4 mb-3 md:mb-6">
        <FilterPanel
          data={filteredData}
          setFilteredData={() => {}}
          onApplyFilters={fetchFilteredData}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 bg-white/20 rounded-xl shadow-lg p-4">
          <DefectBarChart data={filteredData} onBarClick={setSelectedDefect} />
        </div>
        <div className="lg:w-1/2 bg-white/20 rounded-xl shadow-lg p-4">
          <DefectDrilldown data={filteredData} defectType={selectedDefect} />
        </div>
      </div>
    </div>
  );
}

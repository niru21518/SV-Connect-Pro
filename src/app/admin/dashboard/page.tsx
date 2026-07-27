"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAllRegistrations, deleteRegistrationRecord } from "@/lib/firestoreService";
import { logoutAdmin, isAdminLoggedIn } from "@/lib/adminAuth";
import { RegistrationRecord } from "@/lib/types";
import { 
  Users, 
  Search, 
  Trash2, 
  Eye, 
  LogOut, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  X, 
  Calendar, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  FileCheck,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("ALL");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("ALL");

  // Modal states
  const [viewRecord, setViewRecord] = useState<RegistrationRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<RegistrationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Authentication check & load data
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const records = await fetchAllRegistrations();
      setRegistrations(records);
    } catch (err) {
      console.error("Error loading registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    setIsDeleting(true);
    try {
      await deleteRegistrationRecord(deleteRecord.id);
      setRegistrations((prev) => prev.filter((item) => item.id !== deleteRecord.id));
      if (viewRecord?.id === deleteRecord.id) {
        setViewRecord(null);
      }
      setDeleteRecord(null);
    } catch (err) {
      alert("Delete karne me error aaya.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter logic
  const filteredRegistrations = registrations.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobileNumber.includes(searchTerm) ||
      item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.villageTown.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      selectedStateFilter === "ALL" || item.state === selectedStateFilter;

    const matchesLang =
      selectedLanguageFilter === "ALL" || item.preferredLanguage === selectedLanguageFilter;

    return matchesSearch && matchesState && matchesLang;
  });

  // Extract unique states for filter
  const uniqueStates = Array.from(new Set(registrations.map((r) => r.state).filter(Boolean)));

  // Export CSV Helper
  const exportCSV = () => {
    if (filteredRegistrations.length === 0) return;
    const headers = [
      "Application ID",
      "Full Name",
      "Father's Name",
      "DOB",
      "Age",
      "Gender",
      "Mobile Number",
      "State",
      "District",
      "Village/Town",
      "PIN Code",
      "Qualification",
      "Occupation",
      "School / College",
      "Company Name",
      "Business Details",
      "Preferred Language",
      "Date Submitted",
    ];

    const rows = filteredRegistrations.map((r) => [
  `"${r.applicationId || r.id}"`,
  `"${r.fullName}"`,
  `"${r.fatherName}"`,
  `"${r.dob}"`,
  r.age,
  `"${r.gender}"`,
  `"${r.mobileNumber}"`,
  `"${r.state}"`,
  `"${r.district}"`,
  `"${r.villageTown}"`,
  `"${r.pinCode}"`,
  `"${r.qualification}"`,
  `"${r.occupation}"`,
  `"${r.schoolCollege || ""}"`,
  `"${r.companyName || ""}"`,
  `"${r.businessDetails || ""}"`,
  `"${r.preferredLanguage}"`,
  `"${new Date(r.createdAt).toLocaleDateString()}"`,
]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sv_connect_pro_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-12">
      {/* Top Navbar */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">SV Connect Pro</span>
              <span className="ml-2 text-xs bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-mono font-medium">
                Admin
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Registrations
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {registrations.length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                States Represented
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {uniqueStates.length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Search Results
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {filteredRegistrations.length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Name, Mobile, Village, State, District, Qualification..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-900 outline-none transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* State Filter */}
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-700 bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="ALL">All States ({registrations.length})</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguageFilter}
                onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-700 bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="ALL">All Languages</option>
                <option value="Assamese">Assamese</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>

              {/* Refresh */}
              <button
                onClick={loadData}
                title="Refresh Data"
                className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Export CSV */}
              <button
                onClick={exportCSV}
                disabled={filteredRegistrations.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm">Registrations load ho rahe hain...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-base font-semibold text-slate-700">Koi Registration nahi mila.</p>
              <p className="text-xs text-slate-400 mt-1">Search term ya filter change karke dekhein.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Name & Father</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">State & District</th>
                    <th className="py-3.5 px-4">Age / DOB</th>
                    <th className="py-3.5 px-4">Qualification</th>
                    <th className="py-3.5 px-4">Language</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredRegistrations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{rec.fullName}</div>
                        <div className="text-xs text-slate-500">S/o, D/o: {rec.fatherName}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {rec.mobileNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{rec.district}</div>
                        <div className="text-xs text-slate-500">{rec.state}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold mr-1">
                          {rec.age} yrs
                        </span>
                        <span className="text-xs text-slate-500">
    {rec.dob || `${rec.dobDay || ""}-${rec.dobMonth || ""}-${rec.dobYear || ""}`}
</span>
</td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-700">
                        {rec.qualification}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {rec.preferredLanguage}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setViewRecord(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>

                        <button
                          onClick={() => setDeleteRecord(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg">Registration Details</h3>
              </div>
              <button
                onClick={() => setViewRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Full Name</p>
                  <p className="text-base font-bold text-slate-900">{viewRecord.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Father's Name</p>
                  <p className="text-base font-semibold text-slate-800">{viewRecord.fatherName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Date of Birth & Age</p>
                  <p className="font-medium text-slate-800">
  {viewRecord.dob ||
    `${viewRecord.dobDay || ""}-${viewRecord.dobMonth || ""}-${viewRecord.dobYear || ""}`}
  {" "}
  ({viewRecord.age} Years)
</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Gender</p>
                  <p className="font-medium text-slate-800">{viewRecord.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Mobile Number</p>
                  <p className="font-mono font-bold text-blue-700">{viewRecord.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Preferred Language</p>
                  <p className="font-medium text-slate-800">{viewRecord.preferredLanguage}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">State & District</p>
                  <p className="font-medium text-slate-900">{viewRecord.district}, {viewRecord.state}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Village / Town & PIN</p>
                  <p className="font-medium text-slate-900">{viewRecord.villageTown} - {viewRecord.pinCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Qualification</p>
                  <p className="font-medium text-slate-900">{viewRecord.qualification}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Occupation</p>
                  <p className="font-medium text-slate-900">{viewRecord.occupation}</p>
                  {viewRecord.schoolCollege && (
  <div>
    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
      School / College
    </p>
    <p className="font-medium text-slate-900">
      {viewRecord.schoolCollege}
    </p>
  </div>
)}

{viewRecord.companyName && (
  <div>
    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
      Company Name
    </p>
    <p className="font-medium text-slate-900">
      {viewRecord.companyName}
    </p>
  </div>
)}

{viewRecord.businessDetails && (
  <div>
    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
      Business Details
    </p>
    <p className="font-medium text-slate-900">
      {viewRecord.businessDetails}
    </p>
  </div>
)}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between text-xs text-slate-500 gap-2">
                <div>
                  <span className="font-semibold">Declaration Status: </span>
                  <span className="text-emerald-600 font-medium">Accepted</span>
                </div>
                <div>
                  <span className="font-semibold">Submitted On: </span>
                  <span>{new Date(viewRecord.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setViewRecord(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl text-xs sm:text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-fadeIn">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Delete Registration?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Kya aap sach me <strong className="text-slate-900">{deleteRecord.fullName}</strong> ka registration delete karna chahte hain? Ye action Undo nahi ho sakta.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteRecord(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

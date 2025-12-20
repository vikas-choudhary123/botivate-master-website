import { useState, useEffect } from "react"
import { fetchUserDetailsApi, patchSystemAccessApi } from "../redux/api/settingApi";
import { fetchSystemsApi } from "../redux/api/systemsApi";
import { fetchAttendanceSummaryApi } from "../redux/api/attendenceApi";
import { Award, Target } from "lucide-react";

const HomePage = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [systemsList, setSystemsList] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [attendanceFilter, setAttendanceFilter] = useState("");


    const handleSystemAccessPatch = async (id, value) => {
        if (!value.trim()) return;

        await patchSystemAccessApi({
            id: id,
            system_access: value, // append handled in backend
        });

        // refresh users list after patch
        const users = await fetchUserDetailsApi();
        setAllUsers(users);
    };


    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                setLoading(true);

                const storedUsername = localStorage.getItem("user-name");

                const usersRes = await fetchUserDetailsApi();
                const users = Array.isArray(usersRes) ? usersRes : [];
                setAllUsers(users);

                const systemsData = await fetchSystemsApi();
                setSystemsList(Array.isArray(systemsData) ? systemsData : []);

                if (!storedUsername || users.length === 0) return;

                const matchedUser = users.find(
                    (u) =>
                        u?.user_name?.toLowerCase() === storedUsername.toLowerCase()
                );

                setUserDetails(matchedUser || null);

                localStorage.setItem(
                    "system_access",
                    JSON.stringify(
                        (matchedUser?.system_access || "")
                            .split(",")
                            .map((v) => v.trim().toUpperCase())
                            .filter(Boolean)
                    )
                );

                const attendanceRes = await fetchAttendanceSummaryApi();
                const attendanceList = Array.isArray(attendanceRes?.data?.data)
                    ? attendanceRes.data.data
                    : [];

                setAttendance(attendanceList);

                if (matchedUser?.employee_id) {
                    const matchedAttendance = attendanceList.find(
                        (a) =>
                            String(a.employee_id).trim() ===
                            String(matchedUser.employee_id).trim()
                    );
                    setAttendance(matchedAttendance || null);
                }
            } catch (error) {
                console.error("Error fetching employee details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeDetails();
    }, []);

    const attendanceMap = Array.isArray(attendance)
        ? attendance.reduce((acc, a) => {
            acc[String(a.employee_id).trim()] = a.status;
            return acc;
        }, {})
        : {};

    const filteredUsers = allUsers.filter((u) => {
        if (u.role === "admin") return false;

        const matchesSearch =
            u.employee_id?.toString().includes(search) ||
            u.user_name?.toLowerCase().includes(search.toLowerCase());

        const matchesDept =
            departmentFilter === "" || u.department === departmentFilter;

        const attendanceStatus =
            attendanceMap[u.employee_id] === "IN" ? "present" : "absent";

        const matchesAttendance =
            attendanceFilter === "" || attendanceFilter === attendanceStatus;

        return matchesSearch && matchesDept && matchesAttendance;
    });

    return (
        <div className="w-full">
            <section className="py-4 md:py-4 bg-white">
                <div className="container mx-auto px-4 md:px-8">
                    {localStorage.getItem("user-name")?.toLowerCase() === "admin" && (
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white bg-red-600 inline-block px-4 py-1 opacity-70 rounded mb-6">
                                Welcome To Sourabh Rolling Mill
                            </h2>
                            <div>
                                <p className="typing-effect text-2xl font-bold text-red-600 leading-relaxed inline-block">
                                    मजबूती और विश्वास है हम।  </p>
                            </div>
                            <div className="max-w-4xl mx-auto text-center mb-12">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                                    About Us
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Sourabh Rolling Mills Pvt. Ltd., a premium manufacturing unit of Pankaj Group,
                                    is located in Village Kanhera, Urla Industrial Area, Raipur, Chhattisgarh.
                                    As one of the leading companies within Pankaj Group,
                                    Sourabh Rolling Mills is synonymous with quality and innovation in the steel industry.
                                    Specializing in the production of billets, strips (Patra), and high-quality steel pipes,
                                    Sourabh Rolling Mills adheres to stringent BIS norms. Our facility boasts multiple automatic rolling mills,
                                    ensuring efficiency and precision in our manufacturing processes. The company employs over 2,700 direct and
                                    indirect dedicated and highly talented workforce members, fostering a culture of excellence and continuous improvement.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-md">
                                    <Target className="w-16 h-16 mx-auto text-red-600 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h3>
                                    <p className="text-gray-600">
                                        Mission creating happiness through achievements
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md">
                                    <Award className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">Our Vision</h3>
                                    <p className="text-gray-600">
                                        Vision becoming a humble man with high values and creative mind set.
                                    </p>
                                </div>
                            </div>
                            <style>
                                {`
                                .typing-effect {
                                    white-space: nowrap;
                                    overflow: hidden;
                                    width: 0;
                                    animation: typing 4s steps(60, end) forwards;
                                }

                                @keyframes typing {
                                    from { width: 0 }
                                    to { width: 80% }
                                }

                                @keyframes blink {
                                    0% { border-color: transparent }
                                    50% { border-color: #4b5563 }
                                    100% { border-color: transparent }
                                }
                                `}
                            </style>
                        </div>
                    )}
                    {localStorage.getItem("user-name")?.toLowerCase() !== "admin" && (
                        <div>
                            <div className="grid grid-cols md:grid-cols">
                                {/* Employee Card - Dynamic based on API data */}
                                <div className="flex flex-col-2 md:flex-row bg-gray-50 rounded-lg shadow-md overflow-hidden gap-10 items-center justify-center md:items-start md:justify-start md:text-left">
                                    <img
                                        src={
                                            userDetails?.employee_id
                                                ? `/employees/${userDetails.employee_id}.jpg`
                                                : "/user.png"
                                        }
                                        alt="Employee"
                                        className="w-34 md:w-1/3 h-34 md:h-auto object-cover"
                                        onError={(e) => {
                                            e.target.src = "/user.png";
                                        }}
                                    />

                                    <div className="flex flex-col text-sm md:text-base lg:text-xl xl:text-6xl">
                                        {loading ? (
                                            <div className="space-y-3">
                                                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-44 animate-pulse"></div>
                                            </div>
                                        ) : userDetails ? (
                                            <>
                                                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-6xl font-bold text-gray-800 mb-2">
                                                    {userDetails.user_name || "N/A"}
                                                </h3>
                                                <p className="text-gray-600 mb-1">
                                                    <span className="font-semibold">Employee ID:</span> {userDetails.employee_id || "N/A"}
                                                </p>
                                                <p className="text-gray-600 mb-1">
                                                    <span className="font-semibold">Department:</span> {userDetails.department || "N/A"}
                                                </p>
                                                <p className="text-gray-600 mb-1">
                                                    <span className="font-semibold">Phone:</span> {userDetails.number || "N/A"}
                                                </p>
                                                <p className="text-gray-600 mb-1">
                                                    <span className="font-semibold">Email:</span> {userDetails.email_id || "N/A"}
                                                </p>
                                                <p className="text-gray-600 mb-1">
                                                    <span className="font-semibold">Status:</span>
                                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${userDetails.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {userDetails.status || "N/A"}
                                                    </span>
                                                </p>
                                            </>
                                        ) : (
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Employee Details</h3>
                                                <p className="text-gray-600">Unable to load employee information</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6 text-center">
                                        <h3 className="text-md font-bold text-gray-800 mb-2">
                                            Today's Tasks
                                        </h3>

                                        <p className="text-yellow-600 font-semibold text-lg">
                                            Upcoming...<span className="text-green-600"></span>
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6 text-center">
                                        <h3 className="text-md font-bold text-gray-800 mb-2">
                                            Attendance
                                        </h3>

                                        {attendance ? (
                                            <div className="font-semibold text-xl text-yellow-600">
                                                {attendance.monthly_attendance}
                                                <span className="text-green-600">
                                                    /{new Date().getDate()}
                                                </span>

                                                <div className="text-gray-800 text-sm font-normal mt-1">
                                                    Today :{" "}
                                                    <span
                                                        className={
                                                            attendance.status === "IN"
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }
                                                    >
                                                        {attendance.status === "IN" ? "Present" : "Absent"}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-sm">
                                                Attendance not available
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-3">
                                        {/* Header */}
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-md font-bold text-gray-800">Overall Progress</h3>
                                            {/* <span className="text-blue-500">📊</span> */}
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* CIRCLE */}
                                            <div className="relative w-36 h-36">
                                                <svg className="w-full h-full rotate-[-90deg]">
                                                    {/* Background */}
                                                    <circle
                                                        cx="72"
                                                        cy="72"
                                                        r="60"
                                                        stroke="#a7b0c0ff"
                                                        strokeWidth="12"
                                                        fill="none"
                                                    />

                                                    {/* Completed */}
                                                    <circle
                                                        cx="72"
                                                        cy="72"
                                                        r="60"
                                                        stroke="#10b981"
                                                        strokeWidth="12"
                                                        fill="none"
                                                        strokeDasharray="377"
                                                        strokeDashoffset="57"
                                                        strokeLinecap="line"
                                                    />

                                                    {/* Pending */}
                                                    <circle
                                                        cx="72"
                                                        cy="72"
                                                        r="60"
                                                        stroke="#f59e0b"
                                                        strokeWidth="12"
                                                        fill="none"
                                                        strokeDasharray="377"
                                                        strokeDashoffset="321"
                                                        strokeLinecap="line"
                                                    />
                                                </svg>

                                                {/* CENTER TEXT */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-3xl font-bold text-indigo-600">00.0%</span>
                                                    <span className="text-xs text-gray-500">Overall</span>
                                                </div>
                                            </div>

                                            {/* LEGEND */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                                    <span className="font-medium">Completed:</span>
                                                    <span className="text-gray-600">0.0%</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                                    <span className="font-medium">Pending:</span>
                                                    <span className="text-gray-600">0.0%</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                                                    <span className="font-medium">Not Done:</span>
                                                    <span className="text-gray-600">0.0%</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                                    <span className="font-medium">Overdue:</span>
                                                    <span className="text-gray-600">0.0%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {localStorage.getItem("user-name")?.toLowerCase() === "admin" && (
                        <div className="w-full">
                            <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden p-4 md:p-6">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
                                    All Users ({filteredUsers.length})
                                </h1>

                                {allUsers.length === 0 ? (
                                    <p className="text-gray-600">No users found...</p>
                                ) : (
                                    <><div className="flex flex-col-2 md:flex-row gap-4 mb-4">

                                        {/* Search Box */}
                                        <input
                                            type="text"
                                            placeholder="Search by Employee ID or Username..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full md:w-1/3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />

                                        {/* Department Dropdown */}
                                        <select
                                            value={departmentFilter}
                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                            className="w-full md:w-1/4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        >
                                            <option value="">All Departments</option>
                                            {[...new Set(allUsers.map((u) => u.department))].map((dept) => (
                                                <option key={dept} value={dept}>
                                                    {dept}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={attendanceFilter}
                                            onChange={(e) => setAttendanceFilter(e.target.value)}
                                            className="w-full md:w-1/4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        >
                                            <option value="">All Attendance</option>
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                        <div className="relative max-h-[65vh] overflow-y-auto overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                                            <table className="min-w-full text-sm">
                                                {/* HEADER */}
                                                <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 backdrop-blur border-b">
                                                    <tr>
                                                        {[
                                                            "Employee ID",
                                                            "Username",
                                                            "Department",
                                                            "Attendance",
                                                            "Contact",
                                                            "System Access",
                                                            "Status",
                                                        ].map((h) => (
                                                            <th
                                                                key={h}
                                                                className="px-4 py-3 text-left font-semibold text-gray-700 tracking-wide uppercase text-xs"
                                                            >
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                {/* BODY */}
                                                <tbody className="divide-y divide-gray-100">
                                                    {filteredUsers.map((user, idx) => (
                                                        <tr
                                                            key={user.id}
                                                            className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                                                                } hover:bg-red-50`}
                                                        >
                                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                                {user.employee_id}
                                                            </td>

                                                            <td className="px-4 py-3 text-gray-700">
                                                                {user.user_name}
                                                            </td>

                                                            <td className="px-4 py-3 text-gray-600">
                                                                {user.user_access}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {attendanceMap[user.employee_id] === "IN" ? (
                                                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                                                        Present
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                                                        Absent
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-gray-600">
                                                                {user.number}
                                                            </td>

                                                            {/* SYSTEM ACCESS */}
                                                            <td className="px-4 py-3">
                                                                <select
                                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs
                           focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                                    defaultValue=""
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (!value) return;
                                                                        handleSystemAccessPatch(user.id, value);
                                                                        e.target.value = "";
                                                                    }}
                                                                >
                                                                    <option value="">Add system access</option>
                                                                    {systemsList.map((sys) => (
                                                                        <option key={sys.id} value={sys.systems}>
                                                                            {sys.systems}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {user.system_access?.split(",").map((access) => (
                                                                        <span
                                                                            key={access}
                                                                            className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                                                        >
                                                                            {access}
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleSystemAccessPatch(user.id, access)
                                                                                }
                                                                                className="text-red-500 hover:text-red-700"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>

                                                            {/* STATUS */}
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                  ${user.status?.toLowerCase() === "active"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-red-100 text-red-700"
                                                                        }`}
                                                                >
                                                                    {user.status || "N/A"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-12 md:py-20 bg-gradient-to-br from-gray-800 to-gray-900 text-white" >
                <div className="container mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Contact Info */}
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-semibold mb-4 text-red-400">Contact Us</h4>
                            <div className="space-y-3">
                                {localStorage.getItem("user-name")?.toLowerCase() === "admin" && (
                                    <div className="flex items-center justify-center md:justify-start">
                                        <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-gray-300">+917225061350 , </span>
                                        <span className="text-gray-300">+918839494655</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-center md:justify-start">
                                    <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-300">admin@sagartmt.com</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start">
                                    <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-300">Achholi Road Kanhera , Urla Industrial Area<br />Raipur C.G.</span>
                                </div>
                            </div>

                        </div>
                        {/* Google Map Embed */}
                        <div className="">
                            <h5 className="text-lg font-medium mb-4 text-red-400">Our Location</h5>
                            <div className="w-full h-48 md:h-64 lg:h-48">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d529.0000000000001!2d81.6093303!3d21.3333512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28e700143df22d%3A0x89321ea274817173!2sSourabh%20Rolling%20Mill%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Map Location"
                                ></iframe>
                            </div>
                        </div>

                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-700 my-8"></div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-gray-400">
                            &copy; {new Date().getFullYear()} Sagar Pipe. All rights reserved.
                        </p>
                        <p>
                            Powered By{" "}
                            <a href="https://botivate.in/" className="text-red-500 hover:underline">
                                Botivate
                            </a>
                        </p>

                    </div>
                </div>

            </section >
        </div >
    )
}
export default HomePage;
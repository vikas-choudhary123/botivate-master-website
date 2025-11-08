import { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";

export default function SystemForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for dropdown options from Master sheet
    const [nameOptions, setNameOptions] = useState([]);
    const [systemOptions, setSystemOptions] = useState([]);
    const [ipOptions, setIpOptions] = useState([]);
    const [extensionOptions, setExtensionOptions] = useState([]);
    const [mobileOptions, setMobileOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [jioOptions, setJioOptions] = useState([]);
    const [airtelOptions, setAirtelOptions] = useState([]);
    const [ideaOptions, setIdeaOptions] = useState([]);
    const [emailOptions, setEmailOptions] = useState([]);
    const [extensionOutsideOptions, setExtensionOutsideOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    // Form data state
    const [formData, setFormData] = useState({
        name: "",
        system: [],
        systemSpecs: "",
        ip: "",
        location: "",
        extension: "",
        mobile: "",
        jioNo: "",
        airtelNo: "",
        ideaNo: "",
        email: "",
        extensionOutside: "",
        department: "",

    });

    // State for checkbox selections
    const [selectedSystems, setSelectedSystems] = useState([]);
    const [showSystemDropdown, setShowSystemDropdown] = useState(false);

    // Fetch all data from Master sheet
    const fetchMasterData = async () => {
        try {
            const masterSheetId = "1poFyeN1S_1460vD2E8IrpgcDnBkpYgQ15OwEysVBb-M";
            const masterSheetName = "Master";

            const url = `https://docs.google.com/spreadsheets/d/${masterSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
                masterSheetName
            )}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch master data: ${response.status}`);
            }

            const text = await response.text();
            const jsonStart = text.indexOf("{");
            const jsonEnd = text.lastIndexOf("}");
            const jsonString = text.substring(jsonStart, jsonEnd + 1);
            const data = JSON.parse(jsonString);

            if (!data.table || !data.table.rows) {
                console.log("No master data found");
                return;
            }

            // Extract data from all required columns
            const names = [];
            const systems = [];
            const ips = [];
            const extensions = [];
            const mobiles = [];
            const locations = [];
            const jioNumbers = [];
            const airtelNumbers = [];
            const ideaNumbers = [];
            const emails = [];
            const extensionOutside = [];
            const department = [];


            // Process all rows starting from index 1 (skip header)
            data.table.rows.slice(0).forEach((row) => {
                // Column A - IP (index 0)
                if (row.c && row.c[0] && row.c[0].v) {
                    const value = row.c[0].v.toString().trim();
                    if (value !== "") ips.push(value);
                }

                // Column B - Email (index 1)
                if (row.c && row.c[1] && row.c[1].v) {
                    const value = row.c[1].v.toString().trim();
                    if (value !== "") emails.push(value);
                }

                // Column C - Jio No. (index 2)
                if (row.c && row.c[2] && row.c[2].v) {
                    const value = row.c[2].v.toString().trim();
                    if (value !== "") jioNumbers.push(value);
                }

                // Column D - Airtel No. (index 3)
                if (row.c && row.c[4] && row.c[4].v) {
                    const value = row.c[4].v.toString().trim();
                    if (value !== "") airtelNumbers.push(value);
                }

                // Column E - Idea No. (index 4)
                if (row.c && row.c[3] && row.c[3].v) {
                    const value = row.c[3].v.toString().trim();
                    if (value !== "") ideaNumbers.push(value);
                }

                // Column F - System (index 5)
                if (row.c && row.c[5] && row.c[5].v) {
                    const value = row.c[5].v.toString().trim();
                    if (value !== "") systems.push(value);
                }

                // Column G - Name (index 6)
                if (row.c && row.c[6] && row.c[6].v) {
                    const value = row.c[6].v.toString().trim();
                    if (value !== "") names.push(value);
                }

                // Column H - Location (index 7)
                if (row.c && row.c[7] && row.c[7].v) {
                    const value = row.c[7].v.toString().trim();
                    if (value !== "") locations.push(value);
                }

                // Column I - Extension (index 8)
                if (row.c && row.c[8] && row.c[8].v) {
                    const value = row.c[8].v.toString().trim();
                    if (value !== "") extensions.push(value);
                }

                // Column J - Mobile (index 9)
                if (row.c && row.c[9] && row.c[9].v) {
                    const value = row.c[9].v.toString().trim();
                    if (value !== "") mobiles.push(value);
                }

                if (row.c && row.c[10] && row.c[10].v) {
                    const value = row.c[10].v.toString().trim();
                    if (value !== "") extensionOutside.push(value);
                }

                if (row.c && row.c[11] && row.c[11].v) {
                    const value = row.c[11].v.toString().trim();
                    if (value !== "") department.push(value);
                }


            });

            // Remove duplicates and set state
            setNameOptions([...new Set(names)].sort());
            setSystemOptions([...new Set(systems)].sort());
            setIpOptions([...new Set(ips)].sort());
            setExtensionOptions([...new Set(extensions)].sort());
            setMobileOptions([...new Set(mobiles)].sort());
            setLocationOptions([...new Set(locations)].sort());
            setJioOptions([...new Set(jioNumbers)].sort());
            setAirtelOptions([...new Set(airtelNumbers)].sort());
            setIdeaOptions([...new Set(ideaNumbers)].sort());
            setEmailOptions([...new Set(emails)].sort());
            setExtensionOutsideOptions([...new Set(extensionOutside)].sort());
            setDepartmentOptions([...new Set(department)].sort());

            console.log("Master sheet data loaded successfully");
        } catch (error) {
            console.error("Error fetching master sheet data:", error);
            // Set default options if fetch fails
            setNameOptions(["User 1", "User 2"]);
            setSystemOptions(["System 1", "System 2"]);
            setIpOptions(["192.168.1.1", "192.168.1.2"]);
            setExtensionOptions(["1001", "1002"]);
            setMobileOptions(["9876543210", "9876543211"]);
            setLocationOptions(['SRMPL', 'AAPL', 'GGIPL', 'PIL', 'CO']);
            setJioOptions(["9876543210", "9876543211"]);
            setAirtelOptions(["9876543210", "9876543211"]);
            setIdeaOptions(["9876543210", "9876543211"]);
            setEmailOptions(["user1@example.com", "user2@example.com"]);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSystemCheckboxChange = (system) => {
        setSelectedSystems(prev => {
            const newSelectedSystems = prev.includes(system)
                ? prev.filter(item => item !== system)
                : [...prev, system];

            // Update form data with selected systems
            setFormData(prevFormData => ({
                ...prevFormData,
                system: newSelectedSystems
            }));

            return newSelectedSystems;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare data for submission according to column mapping
            const submissionData = {
                sheetName: "Data",
                name: formData.name,
                system: selectedSystems.join(", "),
                systemSpecs: formData.systemSpecs,
                ip: formData.ip,
                location: formData.location,
                extension: formData.extension,
                mobile: formData.mobile,
                jioNo: formData.jioNo,
                airtelNo: formData.airtelNo,
                ideaNo: formData.ideaNo,
                email: formData.email,
                extensionOutside: formData.extensionOutside,
                department: formData.department
            };

            console.log("Submitting data:", submissionData);

            // Build URL parameters
            const params = new URLSearchParams();
            Object.keys(submissionData).forEach(key => {
                params.append(key, submissionData[key]);
            });

            // Submit to Google Sheets using URL parameters
            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbw-VcRnwXvGfYw6Avi5MgB0XvBYViPod0dDQkf8MDeNZsqto2_RzR6pJm5DpgO3zsd1/exec",
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                }
            );

            const result = await response.json();

            if (result.success) {
                alert("Data submitted successfully!");

                // Reset form
                setFormData({
                    name: "",
                    system: [],
                    systemSpecs: "",
                    ip: "",
                    location: "",
                    extension: "",
                    mobile: "",
                    jioNo: "",
                    airtelNo: "",
                    ideaNo: "",
                    email: "",
                    extensionOutside: "",
                    department: ""
                });
                setSelectedSystems([]);
            } else {
                throw new Error(result.error || "Failed to submit data");
            }

        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit data. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Simple Dropdown Component
    const DropdownField = ({ id, name, value, options, onChange, label, placeholder }) => (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-md border border-gray-200 p-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );

    // System Dropdown with Checkboxes Component
    const SystemDropdownWithCheckboxes = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                System
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowSystemDropdown(!showSystemDropdown)}
                    className="w-full rounded-md border border-gray-200 p-2 text-left focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
                >
                    {selectedSystems.length > 0
                        ? `${selectedSystems.length} system(s) selected`
                        : "Select systems"}
                </button>

                {showSystemDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 space-y-2">
                            {systemOptions.map((system, index) => (
                                <label key={index} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSystems.includes(system)}
                                        onChange={() => handleSystemCheckboxChange(system)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{system}</span>
                                </label>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 p-2">
                            <button
                                type="button"
                                onClick={() => setShowSystemDropdown(false)}
                                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {selectedSystems.length > 0 && (
                <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Selected systems:</p>
                    <div className="flex flex-wrap gap-1">
                        {selectedSystems.map((system, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {system}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto p-4">
                <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-500">
                    IT Assets User Form
                </h1>

                <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Details
                        </h2>
                        <p className="text-gray-600">
                            Fill in the system information details.
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Row 1: Name and System */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DropdownField
                                id="name"
                                name="name"
                                value={formData.name}
                                options={nameOptions}
                                onChange={handleChange}
                                label="Name"
                                placeholder="Select Name"
                            />

                            <SystemDropdownWithCheckboxes />
                        </div>

                        {/* System Specs moved right after System dropdown */}
                        <div className="space-y-2">
                            <label htmlFor="systemSpecs" className="block text-sm font-medium text-gray-700">
                                System Specs
                            </label>
                            <textarea
                                id="systemSpecs"
                                name="systemSpecs"
                                value={formData.systemSpecs}
                                onChange={handleChange}
                                placeholder="Enter system specifications/remarks"
                                rows={3}
                                className="w-full rounded-md border border-gray-200 p-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                            />
                        </div>

                        {/* Row 2: IP and Location */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DropdownField
                                id="ip"
                                name="ip"
                                value={formData.ip}
                                options={ipOptions}
                                onChange={handleChange}
                                label="IP"
                                placeholder="Select IP"
                            />

                            <DropdownField
                                id="location"
                                name="location"
                                value={formData.location}
                                options={locationOptions}
                                onChange={handleChange}
                                label="Location"
                                placeholder="Select Location"
                            />
                        </div>

                        {/* Row 3: Extension and Mobile */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DropdownField
                                id="extension"
                                name="extension"
                                value={formData.extension}
                                options={extensionOptions}
                                onChange={handleChange}
                                label="Extension"
                                placeholder="Select Extension"
                            />

                            <DropdownField
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                options={mobileOptions}
                                onChange={handleChange}
                                label="Mobile"
                                placeholder="Select Mobile"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DropdownField
                                id="extensionOutside"
                                name="extensionOutside"
                                value={formData.extensionOutside}
                                options={extensionOutsideOptions}
                                onChange={handleChange}
                                label="Extension Outside"
                                placeholder="Select Outside Extension"
                            />

                            <DropdownField
                                id="department"
                                name="department"
                                value={formData.department}
                                options={departmentOptions}
                                onChange={handleChange}
                                label="Department"
                                placeholder="Select Department"
                            />
                        </div>

                        {/* Row 4: Jio No. and Airtel No. */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DropdownField
                                id="jioNo"
                                name="jioNo"
                                value={formData.jioNo}
                                options={jioOptions}
                                onChange={handleChange}
                                label="Jio Number"
                                placeholder="Select Jio Number"
                            />

                            <DropdownField
                                id="airtelNo"
                                name="airtelNo"
                                value={formData.airtelNo}
                                options={airtelOptions}
                                onChange={handleChange}
                                label="Airtel No"
                                placeholder="Select Airtel Number"
                            />
                        </div>

                        {/* Row 5: Idea No. and Email */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DropdownField
                                id="ideaNo"
                                name="ideaNo"
                                value={formData.ideaNo}
                                options={ideaOptions}
                                onChange={handleChange}
                                label="Idea No"
                                placeholder="Select Idea Number"
                            />

                            <DropdownField
                                id="email"
                                name="email"
                                value={formData.email}
                                options={emailOptions}
                                onChange={handleChange}
                                label="Email"
                                placeholder="Select Email"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    name: "",
                                    system: [],
                                    systemSpecs: "",
                                    ip: "",
                                    location: "",
                                    extension: "",
                                    mobile: "",
                                    jioNo: "",
                                    airtelNo: "",
                                    ideaNo: "",
                                    email: ""
                                });
                                setSelectedSystems([]);
                            }}
                            className="rounded-md border border-gray-200 py-2 px-6 text-gray-700 hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-gradient-to-r from-blue-600 to-gray-600 py-2 px-8 text-white hover:from-blue-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Data"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
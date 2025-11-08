"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { CheckCircle2, Upload, X, Search, History, ArrowLeft, Edit, Trash2, Eye, Save, XCircle } from "lucide-react"

// Configuration object - Move all configurations here
const CONFIG = {
    // Google Apps Script URL
    APPS_SCRIPT_URL:
        "https://script.google.com/macros/s/AKfycbw-VcRnwXvGfYw6Avi5MgB0XvBYViPod0dDQkf8MDeNZsqto2_RzR6pJm5DpgO3zsd1/exec",

    // Google Drive folder ID for file uploads
    DRIVE_FOLDER_ID: "",

    // Sheet names
    SOURCE_SHEET_NAME: "Data",
    TARGET_SHEET_NAME: "DELEGATION DONE",

    // Page configuration
    PAGE_CONFIG: {
        title: "",
        description: "Showing all Assets",
        historyDescription: "Read-only view of completed tasks with submission history",
    },
}

// Debounce hook for search optimization
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

function DelegationDataPage() {
    const [accountData, setAccountData] = useState([])
    const [selectedItems, setSelectedItems] = useState(new Set())
    const [successMessage, setSuccessMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showHistory, setShowHistory] = useState(false)
    const [editingRow, setEditingRow] = useState(null)
    const [editedData, setEditedData] = useState({})
    const [viewingRow, setViewingRow] = useState(null)

    // Debounced search term for better performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    const formatDateToDDMMYYYY = useCallback((date) => {
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }, [])

    const isEmpty = useCallback((value) => {
        return value === null || value === undefined || (typeof value === "string" && value.trim() === "")
    }, [])

    const parseGoogleSheetsDate = useCallback(
        (dateStr) => {
            if (!dateStr) return ""

            // If it's already in DD/MM/YYYY format, return as is
            if (typeof dateStr === "string" && dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                // Ensure proper padding for DD/MM/YYYY format
                const parts = dateStr.split("/")
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, "0")
                    const month = parts[1].padStart(2, "0")
                    const year = parts[2]
                    return `${day}/${month}/${year}`
                }
                return dateStr
            }

            // Handle Google Sheets Date() format
            if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
                const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateStr)
                if (match) {
                    const year = Number.parseInt(match[1], 10)
                    const month = Number.parseInt(match[2], 10)
                    const day = Number.parseInt(match[3], 10)
                    return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`
                }
            }

            // Handle other date formats
            try {
                const date = new Date(dateStr)
                if (!isNaN(date.getTime())) {
                    return formatDateToDDMMYYYY(date)
                }
            } catch (error) {
                console.error("Error parsing date:", error)
            }

            // If all else fails, return the original string
            return dateStr
        },
        [formatDateToDDMMYYYY],
    )

    const parseDateFromDDMMYYYY = useCallback((dateStr) => {
        if (!dateStr || typeof dateStr !== "string") return null
        const parts = dateStr.split("/")
        if (parts.length !== 3) return null
        return new Date(parts[2], parts[1] - 1, parts[0])
    }, [])

    const sortDateWise = useCallback(
        (a, b) => {
            const dateStrA = a["col6"] || ""
            const dateStrB = b["col6"] || ""
            const dateA = parseDateFromDDMMYYYY(dateStrA)
            const dateB = parseDateFromDDMMYYYY(dateStrB)
            if (!dateA) return 1
            if (!dateB) return -1
            return dateA.getTime() - dateB.getTime()
        },
        [parseDateFromDDMMYYYY],
    )

    const resetFilters = useCallback(() => {
        setSearchTerm("")
    }, [])

    // Get color based on data from column R
    const getRowColor = useCallback((colorCode) => {
        if (!colorCode) return "bg-white"

        const code = colorCode.toString().toLowerCase()
        switch (code) {
            case "gray":
                return "bg-gray-50 border-l-4 border-gray-400"
            case "yellow":
                return "bg-yellow-50 border-l-4 border-yellow-400"
            case "green":
                return "bg-green-50 border-l-4 border-green-400"
            case "blue":
                return "bg-blue-50 border-l-4 border-blue-400"
            default:
                return "bg-white"
        }
    }, [])

    // Optimized filtered data with debounced search
    const filteredAccountData = useMemo(() => {
        const filtered = debouncedSearchTerm
            ? accountData.filter((account) =>
                Object.values(account).some(
                    (value) => value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
                ),
            )
            : accountData

        return filtered.sort(sortDateWise)
    }, [accountData, debouncedSearchTerm, sortDateWise])

    const handleEdit = useCallback((account) => {
        console.log("Editing account:", account);
        setEditingRow(account._id);
        // Initialize editedData with all current values - don't use fallback values
        setEditedData({
            col1: account["col1"] || "",
            col2: account["col2"] || "",
            col3: account["col3"] || "",
            col4: account["col4"] || "",
            col5: account["col5"] || "",
            col6: account["col6"] || "",
            col7: account["col7"] || "",
            col8: account["col8"] || "",
            col9: account["col9"] || "",
            col10: account["col10"] || "",
            col11: account["col11"] || "",
            col12: account["col12"] || "",
            col13: account["col13"] || "",
            col14: account["col14"] || ""
        });
    }, []);

    const handleSave = useCallback(async () => {
        try {
            setLoading(true);

            console.log("=== SAVE DEBUG INFO ===");
            console.log("Editing Row ID:", editingRow);
            console.log("Edited Data:", editedData);
            console.log("Seq No:", editedData["col14"]);

            if (!editedData["col14"]) {
                throw new Error("Seq No. not found for this record");
            }

            // Prepare update data - use the CORRECT field names that match Apps Script
            const updateData = {
                action: "update",
                sheetName: CONFIG.SOURCE_SHEET_NAME,
                seqNo: editedData["col14"],
                updates: {
                    name: editedData["col1"] || "",           // Name -> Column B
                    system: editedData["col2"] || "",         // System -> Column C  
                    specification: editedData["col3"] || "",  // Specification -> Column D
                    ipAddress: editedData["col4"] || "",      // IP Address -> Column E
                    location: editedData["col5"] || "",       // Location -> Column F
                    extension: editedData["col6"] || "",      // Extension -> Column G
                    mobile: editedData["col7"] || "",         // Mobile -> Column H
                    jioNo: editedData["col8"] || "",          // Jio No -> Column I
                    airtelNo: editedData["col9"] || "",       // Airtel No -> Column J
                    ideaNo: editedData["col10"] || "",        // Idea No -> Column K
                    email: editedData["col11"] || "",         // Email -> Column L
                    outsideExtension: editedData["col12"] || "", // Outside Extension -> Column M
                    department: editedData["col13"] || ""     // Department -> Column N
                }
            };

            console.log("Sending to server:", updateData);

            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=update&data=${encodeURIComponent(JSON.stringify(updateData))}`
            });

            const result = await response.json();
            console.log("Server response:", result);

            if (result.success) {
                setAccountData(prev => prev.map(item =>
                    item._id === editingRow ? { ...item, ...editedData } : item
                ));
                setSuccessMessage("Data updated successfully!");
                setEditingRow(null);
                setEditedData({});
            } else {
                throw new Error(result.error || "Failed to update data");
            }
        } catch (error) {
            console.error("Error updating data:", error);
            setError("Failed to update data: " + error.message);
        } finally {
            setLoading(false);
        }
    }, [editingRow, editedData]);

    const handleCancelEdit = useCallback(() => {
        setEditingRow(null)
        setEditedData({})
    }, [])

    const handleDelete = useCallback(async (account) => {
        if (!confirm("Are you sure you want to delete this record?")) {
            return
        }

        try {
            setLoading(true)
            const seqNo = account["col14"]

            if (!seqNo) {
                throw new Error("Seq No. not found for this record")
            }

            // Send delete request to Google Apps Script
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=delete&sheetName=${CONFIG.SOURCE_SHEET_NAME}&seqNo=${encodeURIComponent(seqNo)}`
            })

            const result = await response.json()
            console.log("Delete response:", result)

            if (result.success) {
                // Remove from local state
                setAccountData(prev => prev.filter(item => item._id !== account._id))
                setSuccessMessage("Record deleted successfully!")
            } else {
                throw new Error(result.error || "Failed to delete record")
            }
        } catch (error) {
            console.error("Error deleting record:", error)
            setError("Failed to delete record: " + error.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const handleView = useCallback((account) => {
        setViewingRow(account)
    }, [])

    const handleCloseView = useCallback(() => {
        setViewingRow(null)
    }, [])

    const handleInputChange = useCallback((field, value) => {
        console.log("Updating field:", field, "with value:", value);
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const fetchSheetData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${CONFIG.SOURCE_SHEET_NAME}&action=fetch`)

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`)
            }

            const text = await response.text()
            let data
            try {
                data = JSON.parse(text)
            } catch (parseError) {
                const jsonStart = text.indexOf("{")
                const jsonEnd = text.lastIndexOf("}")
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonString = text.substring(jsonStart, jsonEnd + 1)
                    data = JSON.parse(jsonString)
                } else {
                    throw new Error("Invalid JSON response from server")
                }
            }

            const accounts = []

            let rows = []
            if (data.table && data.table.rows) {
                rows = data.table.rows
            } else if (Array.isArray(data)) {
                rows = data
            } else if (data.values) {
                rows = data.values.map((row) => ({ c: row.map((val) => ({ v: val })) }))
            }

            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) return // Skip header row

                let rowValues = []
                if (row.c) {
                    rowValues = row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : ""))
                } else if (Array.isArray(row)) {
                    rowValues = row
                } else {
                    return
                }

                const googleSheetsRowIndex = rowIndex + 1
                const taskId = rowValues[1] || ""
                const stableId = taskId
                    ? `task_${taskId}_${googleSheetsRowIndex}`
                    : `row_${googleSheetsRowIndex}_${Math.random().toString(36).substring(2, 15)}`

                const rowData = {
                    _id: stableId,
                    _rowIndex: googleSheetsRowIndex,
                    _taskId: taskId,
                }

                // Map all columns
                for (let i = 0; i < 18; i++) {
                    if (i === 0) {
                        rowData[`col${i}`] = rowValues[i] ? parseGoogleSheetsDate(String(rowValues[i])) : ""
                    } else {
                        rowData[`col${i}`] = rowValues[i] || ""
                    }
                }

                accounts.push(rowData)
            })

            setAccountData(accounts)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching sheet data:", error)
            setError("Failed to load account data: " + error.message)
            setLoading(false)
        }
    }, [parseGoogleSheetsDate])

    useEffect(() => {
        fetchSheetData()
    }, [fetchSheetData])

    const toggleHistory = useCallback(() => {
        setShowHistory((prev) => !prev)
        resetFilters()
    }, [resetFilters])

    const selectedItemsCount = selectedItems.size

    // Render editable input field
    const renderEditableField = (field, value, placeholder = "—") => (
        <input
            type="text"
            value={value || ""} // This will show empty string if value is null/undefined
            onChange={(e) => {
                console.log("Input changed:", field, e.target.value);
                handleInputChange(field, e.target.value);
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
        />
    );

    // Render mobile table row
    const renderMobileTableRow = (account) => {
        const isEditing = editingRow === account._id
        const rowColorClass = getRowColor(account["col17"])

        return (
            <tr key={account._id} className={`border-b border-gray-200 ${rowColorClass}`}>
                <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex space-x-1">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="text-green-600 hover:text-green-800"
                                    title="Save"
                                >
                                    <Save size={14} />
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                    title="Cancel"
                                >
                                    <XCircle size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleEdit(account)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(account)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleView(account)}
                                    className="text-green-600 hover:text-green-800"
                                    title="View"
                                >
                                    <Eye size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {account["col14"] || "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                        renderEditableField("col1", editedData["col1"])
                    ) : (
                        <span>{account["col1"] || "—"}</span>
                    )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                        renderEditableField("col13", editedData["col13"])
                    ) : (
                        <span>{account["col13"] || "—"}</span>
                    )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                        renderEditableField("col2", editedData["col2"])
                    ) : (
                        <span>{account["col2"] || "—"}</span>
                    )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                        renderEditableField("col3", editedData["col3"])
                    ) : (
                        <span>{account["col3"] || "—"}</span>
                    )}
                </td>
            </tr>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-500">
                    {CONFIG.PAGE_CONFIG.title}
                </h1>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                    </div>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        {successMessage}
                    </div>
                    <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                        <X className="h-5 w-5 mr-2 text-red-500" />
                        {error}
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-gray-400 border-b border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <p className="text-white text-m">
                            {CONFIG.PAGE_CONFIG.description}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="bg-white text-black-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                                {filteredAccountData.length}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500 mb-4"></div>
                        <p className="text-gray-600">Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-gray-50 p-4 rounded-md text-gray-800 text-center">
                        {error}{" "}
                        <button className="underline ml-2" onClick={() => window.location.reload()}>
                            Try again
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Desktop Table */}
                        <div className="hidden md:block relative">
                            <div className="overflow-y-auto max-h-96">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Actions
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Seq No.
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Name
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Department
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                System
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Specification
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                IP Address
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Location
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Extension
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Outside Extension
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Mobile
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Jio No.
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Airtel No
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Idea No.
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Email
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAccountData.length > 0 ? (
                                            filteredAccountData.map((account) => {
                                                const isEditing = editingRow === account._id
                                                const rowColorClass = getRowColor(account["col17"])
                                                return (
                                                    <tr
                                                        key={account._id}
                                                        className={`hover:bg-gray-50 ${rowColorClass}`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-2">
                                                                {isEditing ? (
                                                                    <>
                                                                        <button
                                                                            onClick={handleSave}
                                                                            className="text-green-600 hover:text-green-800"
                                                                            title="Save"
                                                                        >
                                                                            <Save size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelEdit}
                                                                            className="text-red-600 hover:text-red-800"
                                                                            title="Cancel"
                                                                        >
                                                                            <XCircle size={16} />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleEdit(account)}
                                                                            className="text-blue-600 hover:text-blue-800"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(account)}
                                                                            className="text-red-600 hover:text-red-800"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleView(account)}
                                                                            className="text-green-600 hover:text-green-800"
                                                                            title="View"
                                                                        >
                                                                            <Eye size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{account["col14"] || "—"}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col1", editedData["col1"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col1"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col13", editedData["col13"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col13"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col2", editedData["col2"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col2"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col3", editedData["col3"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col3"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col4", editedData["col4"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col4"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col5", editedData["col5"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col5"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col6", editedData["col6"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col6"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col12", editedData["col12"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col12"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col7", editedData["col7"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col7"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col8", editedData["col8"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col8"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col9", editedData["col9"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col9"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col10", editedData["col10"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col10"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col11", editedData["col11"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col11"] || "—"}</div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={15} className="px-6 py-4 text-center text-gray-500">
                                                    {searchTerm ? "No tasks matching your search" : "No pending tasks found"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Table View */}
                        <div className="md:hidden block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Actions
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Seq No.
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Name
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Department
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                System
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Specification
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                IP Address
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Location
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Extension
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Outside Extension
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Mobile
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Jio No.
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Airtel No
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Idea No.
                                            </th>
                                            <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                                                Email
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAccountData.length > 0 ? (
                                            filteredAccountData.map((account) => {
                                                const isEditing = editingRow === account._id
                                                const rowColorClass = getRowColor(account["col17"])
                                                return (
                                                    <tr
                                                        key={account._id}
                                                        className={`hover:bg-gray-50 ${rowColorClass}`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-2">
                                                                {isEditing ? (
                                                                    <>
                                                                        <button
                                                                            onClick={handleSave}
                                                                            className="text-green-600 hover:text-green-800"
                                                                            title="Save"
                                                                        >
                                                                            <Save size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelEdit}
                                                                            className="text-red-600 hover:text-red-800"
                                                                            title="Cancel"
                                                                        >
                                                                            <XCircle size={16} />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleEdit(account)}
                                                                            className="text-blue-600 hover:text-blue-800"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(account)}
                                                                            className="text-red-600 hover:text-red-800"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleView(account)}
                                                                            className="text-green-600 hover:text-green-800"
                                                                            title="View"
                                                                        >
                                                                            <Eye size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{account["col14"] || "—"}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col1", editedData["col1"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col1"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col13", editedData["col13"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col13"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col2", editedData["col2"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col2"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col3", editedData["col3"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col3"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col4", editedData["col4"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col4"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col5", editedData["col5"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col5"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col6", editedData["col6"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col6"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col12", editedData["col12"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col12"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col7", editedData["col7"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col7"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col8", editedData["col8"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col8"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col9", editedData["col9"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col9"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col10", editedData["col10"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col10"] || "—"}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                renderEditableField("col11", editedData["col11"])
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{account["col11"] || "—"}</div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={15} className="px-6 py-4 text-center text-gray-500">
                                                    {searchTerm ? "No tasks matching your search" : "No pending tasks found"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {viewingRow && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-400 to-gray-400 p-4 rounded-t-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white text-lg font-semibold">View Details</h3>
                                <button
                                    onClick={handleCloseView}
                                    className="text-white hover:text-gray-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seq No.</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col14"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col1"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col13"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">System</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col2"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Specification</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col3"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col4"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col5"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Extension</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col6"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Outside Extension</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col12"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col7"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jio No.</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col8"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Airtel No</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col9"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Idea No.</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col10"] || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{viewingRow["col11"] || "—"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-end">
                            <button
                                onClick={handleCloseView}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DelegationDataPage
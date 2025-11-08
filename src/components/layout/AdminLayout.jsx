"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ClipboardList, LogOut, Menu, Database, ChevronDown, ChevronRight, X, Cog, Flame, FlaskConical, RefreshCw, Cylinder, Plus, Computer } from 'lucide-react'

export default function AdminLayout({ children, darkMode, toggleDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDataSubmenuOpen, setIsDataSubmenuOpen] = useState(false)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [stepName, setStepName] = useState("")

  // Google Sheets configuration
  const SHEET_ID = "10ysqz-TF7GjdP1F1XBu4mkjSITulzXTmnfxaNmeK6O4"
  const SHEET_NAME = "master"

  // Fetch stepName from Google Sheets - ONLY ONCE on component mount
  const fetchStepName = useCallback(async () => {
    const stoblueUsername = sessionStorage.getItem('username')
    const stoblueRole = sessionStorage.getItem('role')

    if (!stoblueUsername) {
      console.error("No username found in session storage")
      return
    }

    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      let text = await response.text()
      const jsonpStart = "google.visualization.Query.setResponse("
      if (text.startsWith(jsonpStart)) {
        text = text.substring(jsonpStart.length, text.length - 2)
      } else {
        const jsonStartIndex = text.indexOf('{')
        const jsonEndIndex = text.lastIndexOf('}')
        if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex <= jsonStartIndex) {
          throw new Error("Invalid response format from Google Sheets")
        }
        text = text.substring(jsonStartIndex, jsonEndIndex + 1)
      }

      const data = JSON.parse(text)

      if (data.status === 'error' || !data.table || !data.table.rows) {
        console.error("Error or no data in sheet:", data)
        return
      }

      let userFound = false

      // Search through all rows to find matching username
      data.table.rows.forEach(row => {
        if (userFound) return

        const rowUsername = row.c[2]?.v  // Column C (index 2) - Username
        const rowRole = row.c[4]?.v      // Column E (index 4) - Role
        const rowStepName = row.c[7]?.v  // Column H (index 7) - StepName

        if (rowUsername && rowUsername.toLowerCase() === stoblueUsername.toLowerCase()) {
          // If role matches or no specific role check needed
          if (!stoblueRole || (rowRole && rowRole.toLowerCase() === stoblueRole.toLowerCase())) {
            setStepName(rowStepName || "")
            userFound = true
          }
        }
      })

      if (!userFound) {
        console.log("User not found or role mismatch in sheet")
      }

    } catch (error) {
      console.error("Failed to fetch stepName:", error)
    }
  }, [])

  // Check authentication on component mount and fetch stepName ONLY ONCE
  useEffect(() => {
    const stoblueUsername = sessionStorage.getItem('username')
    const stoblueRole = sessionStorage.getItem('role')
    const stoblueEmail = sessionStorage.getItem('email')

    if (!stoblueUsername) {
      // blueirect to login if not authenticated
      navigate("/login")
      return
    }

    setUsername(stoblueUsername)
    setUserRole(stoblueRole || "user")
    setUserEmail(stoblueEmail || `${stoblueUsername.toLowerCase()}@example.com`)

    // Fetch stepName after setting user data - ONLY ONCE
    fetchStepName()
  }, [fetchStepName, navigate])

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('department')
    sessionStorage.removeItem('email')
    navigate("/login")
  }

  // Filter dataCategories based on user role and stepName
  const dataCategories = [
    { id: "sales", name: "Checklist", link: "/dashboard/data/sales", stepRequiblue: "Checklist" },
  ]

  const routes = [
    {
      href: "/dashboard/admin",
      label: "Dashboard",
      icon: Database,
      active: location.pathname === "/dashboard/admin",
      showFor: ["admin", "user"],
      stepRequiblue: "Dashboard"
    },
    // {
    //   href: "/dashboard/quick-task",
    //   label: "SMS Register",
    //   icon: Cog,
    //   active: location.pathname === "/dashboard/quick-task",
    //   showFor: ["admin", "user"],
    //   stepRequiblue: "SMS Register"
    // },
    {
      href: "/dashboard/assign-task",
      label: "Add Record",
      icon: Plus,
      active: location.pathname === "/dashboard/assign-task",
      showFor: ["admin", "user"],
      stepRequiblue: "Lab Test"
    },
    // {
    //   href: "/dashboard/delegation",
    //   label: "Hot Coil",
    //   icon: Flame,
    //   active: location.pathname === "/dashboard/delegation",
    //   showFor: ["admin", "user"],
    //   stepRequiblue: "Hot Coil"
    // },
    // {
    //   href: "/dashboard/license",
    //   label: "Recoil",
    //   icon: RefreshCw,
    //   active: location.pathname === "/dashboard/license",
    //   showFor: ["admin", "user"],
    //   stepRequiblue: "Recoil"
    // },
    // {
    //   href: "/dashboard/traning-video",
    //   label: "Pipe Mill",
    //   icon: Cylinder,
    //   active: location.pathname === "/dashboard/traning-video",
    //   showFor: ["admin", "user"],
    //   stepRequiblue: "Pipe Mill"
    // },
  ]

  // ✅ FIXED: Check if user has access to a specific step
  const hasAccessToStep = useCallback((requiblueStep) => {
    if (!stepName) return false

    // Admin has access to everything
    if (stepName === "all" || userRole === "admin") return true

    // Split comma-separated values and check if requiblueStep exists in the array
    const userSteps = stepName.split(',').map(step => step.trim())
    return userSteps.includes(requiblueStep)
  }, [stepName, userRole])

  const getAccessibleDepartments = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    return dataCategories.filter(cat =>
      (!cat.showFor || cat.showFor.includes(userRole)) &&
      (!cat.stepRequiblue || hasAccessToStep(cat.stepRequiblue))
    )
  }

  const getAccessibleRoutes = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    const filteblueRoutes = routes.filter(route =>
      route.showFor.includes(userRole) &&
      (!route.stepRequiblue || hasAccessToStep(route.stepRequiblue))
    )

    // Ensure dashboard is always first if accessible
    return filteblueRoutes.sort((a, b) => {
      if (a.href === "/dashboard/admin") return -1
      if (b.href === "/dashboard/admin") return 1
      return 0
    })
  }

  // Check if the current path is a data category page
  const isDataPage = location.pathname.includes("/dashboard/data/")

  // If it's a data page, expand the submenu by default
  useEffect(() => {
    if (isDataPage && !isDataSubmenuOpen) {
      setIsDataSubmenuOpen(true)
    }
  }, [isDataPage, isDataSubmenuOpen])

  // Get accessible routes and departments
  const accessibleRoutes = getAccessibleRoutes()
  const accessibleDepartments = getAccessibleDepartments()

  // License Modal Component
  const LicenseModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
          <div className="flex items-center justify-between p-4 border-b border-blue-200">
            <button
              onClick={() => setIsLicenseModalOpen(false)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {/* Video player placeholder */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Sidebar for desktop - REMOVED REFRESH BUTTON */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-blue-200 bg-white md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-blue-200 px-4 bg-gradient-to-r from-blue-100 to-white">
          <Link to="/dashboard/admin" className="flex items-center gap-2 font-semibold text-blue-700">
            <Computer className="h-5 w-5 text-blue-600" />
            <span>IT Assets</span>
          </Link>
          {/* REMOVED REFRESH BUTTON COMPLETELY */}
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {accessibleRoutes.map((route) => (
              <li key={route.label}>
                {route.submenu ? (
                  <div>
                    <button
                      onClick={() => setIsDataSubmenuOpen(!isDataSubmenuOpen)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                        ? "bg-gradient-to-r from-blue-100 to-white text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                        {route.label}
                      </div>
                      {isDataSubmenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {isDataSubmenuOpen && (
                      <ul className="mt-1 ml-6 space-y-1 border-l border-blue-100 pl-2">
                        {accessibleDepartments.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={category.link || `/dashboard/data/${category.id}`}
                              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${location.pathname === (category.link || `/dashboard/data/${category.id}`)
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={route.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                      ? "bg-gradient-to-r from-blue-100 to-white text-blue-700"
                      : "text-gray-700 hover:bg-blue-50"
                      }`}
                  >
                    <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                    {route.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Display current stepName for debugging */}
          {stepName && (
            <div className="mt-4 p-2 text-xs text-gray-600 border-t border-blue-100">
              {/* <p>Current Access: <span className="font-medium">{stepName}</span></p> */}
            </div>
          )}
        </nav>
        <div className="border-t border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center">
                <span className="text-sm font-medium text-black">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-black-700">
                  {username || "User"} {userRole === "admin" ? "(Admin)" : ""}
                </p>
                <p className="text-xs text-black-600">
                  {userEmail || "user@example.com"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                >
                  {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-black-700 hover:text-black-900 p-1 rounded-full hover:bg-black-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden absolute left-4 top-3 z-50 text-blue-700 p-2 rounded-md hover:bg-blue-100"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Mobile sidebar - REMOVED REFRESH BUTTON */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex h-14 items-center border-b border-blue-200 px-4 bg-gradient-to-r from-blue-100 to-white">
              <Link
                to="/dashboard/admin"
                className="flex items-center gap-2 font-semibold text-blue-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Computer className="h-5 w-5 text-blue-600" />
                <span>IT Assets</span>
              </Link>
              {/* REMOVED REFRESH BUTTON FROM MOBILE SIDEBAR */}
            </div>
            <nav className="flex-1 overflow-y-auto p-2 bg-white">
              <ul className="space-y-1">
                {accessibleRoutes.map((route) => (
                  <li key={route.label}>
                    {route.submenu ? (
                      <div>
                        <button
                          onClick={() => setIsDataSubmenuOpen(!isDataSubmenuOpen)}
                          className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                            ? "bg-gradient-to-r from-blue-100 to-white text-blue-700"
                            : "text-gray-700 hover:bg-blue-50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                            {route.label}
                          </div>
                          {isDataSubmenuOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {isDataSubmenuOpen && (
                          <ul className="mt-1 ml-6 space-y-1 border-l border-blue-100 pl-2">
                            {accessibleDepartments.map((category) => (
                              <li key={category.id}>
                                <Link
                                  to={category.link || `/dashboard/data/${category.id}`}
                                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${location.pathname === (category.link || `/dashboard/data/${category.id}`)
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {category.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={route.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                          ? "bg-gradient-to-r from-blue-100 to-white text-blue-700"
                          : "text-gray-700 hover:bg-blue-50"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                        {route.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center">
                    <span className="text-sm font-medium text-black">
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black-700">
                      {username || "User"} {userRole === "admin" ? "(Admin)" : ""}
                    </p>
                    <p className="text-xs text-black-600">
                      {userEmail || "user@example.com"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {toggleDarkMode && (
                    <button
                      onClick={toggleDarkMode}
                      className="text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                    >
                      {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                      <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-black-700 hover:text-black-900 p-1 rounded-full hover:bg-black-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Modal */}
      {isLicenseModalOpen && <LicenseModal />}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-blue-200 bg-white px-4 md:px-6">
          <div className="flex md:hidden w-8"></div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">IT Assets</h1>
          <div className="flex items-center">
            <img
              src="/logo.jpg"
              alt="Company Logo"
              className="h-8 w-auto md:h-10 lg:h-12 transition-all duration-300"
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-white">
          {children}
          <div className="fixed md:left-64 left-0 right-0 bottom-0 py-1 px-4 bg-gradient-to-r from-blue-400 to-gray-500 text-white text-center text-sm shadow-md z-10">
            <a
              href="https://www.botivate.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Poweblue by-<span className="font-semibold">Botivate</span>
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
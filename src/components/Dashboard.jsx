"use client"

import { useState } from "react"
import Sidebar from "./Sidebar.jsx"
import Navbar from "./Navbar.jsx"
import DashboardContent from "./DashboardContent.jsx"
import NewsPage from "./pages/NewsPage.jsx"
import EventsPage from "./pages/EventsPage.jsx"
import WebsiteEssentialsPage from "./pages/WebsiteEssentialsPage.jsx"
import GalleryPage from "./pages/GalleryPage.jsx"
import UsersPage from "./pages/UsersPage.jsx"
import AnalyticsPage from "./pages/AnalyticsPage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import VacancyPage from "./pages/VacancyPage.jsx"
import ResourcePage from "./pages/ResourcePage.jsx"
import RND from "./pages/RND.jsx"

function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState("Dashboard")

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <DashboardContent />
      case "News":
        return <NewsPage />
      case "Events":
        return <EventsPage />
      case "Resources":
        return <ResourcePage />
      case "R&D":
        return <RND/>
      case "Website Essentials":
        return <WebsiteEssentialsPage />
      case "Gallery":
        return <GalleryPage />
      case "Users":
        return <UsersPage />
      case "Analytics":
        return <AnalyticsPage />
      case "Settings":
        return <SettingsPage />
      case "Vacancies":
        return <VacancyPage />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <Navbar user={user} onLogout={onLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">{renderCurrentPage()}</main>
      </div>
    </div>
  )
}

export default Dashboard

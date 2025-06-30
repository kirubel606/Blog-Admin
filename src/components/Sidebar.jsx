"use client"

import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Globe,
  ImageIcon,
  Settings,
  Users,
  BarChart3,
  Briefcase,
  ChartBarBig,
  MessageCircleCode,
  MessageCircleQuestion,
  MessageSquareQuote,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BrainCircuit,
} from "lucide-react"
import { useAuth } from "../context/AuthContext" // adjust path


function Sidebar({ isOpen, onToggle, currentPage, onPageChange }) {
  const {user} = useAuth();
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  ...(user.is_admin ? [{ icon: Users, label: "Users" }] : []),
  { icon: Newspaper, label: "News" },
  { icon: Calendar, label: "Events" },
  { icon: BookOpen, label: "Resources" },
  { icon: BrainCircuit, label: "R&D" },
  { icon: ImageIcon, label: "Gallery" },
  { icon: Briefcase, label: "Vacancies" },
  {icon: ChartBarBig, label: "Categories"},
  {icon: MessageCircleCode, label: "Collaborations"},
  {icon: MessageCircleQuestion, label: "FAQ"},
  {icon: MessageSquareQuote, label: "Quotes"},
  { icon: Settings, label: "Settings" },
];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-[#2a2d7a] text-white transition-all duration-300 z-40 ${isOpen ? "w-64" : "w-16"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white  rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-white text-lg">AdminHub</span>
          </div>
        )}
        <button onClick={onToggle} className="p-0 rounded-lg hover:bg-white/10 transition-colors">
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.label

            return (
              <li key={item.label}>
                <button
                  onClick={() => onPageChange(item.label)}
                  className={`w-full flex items-center space-x-3 px-2 py-2 rounded-xl transition-all duration-200 group ${
                    isActive ? "bg-[#FF6B00] text-[#1a1d4e] shadow-lg" : "hover:bg-white/10 text-white hover:text-white"
                  }`}
                  title={!isOpen ? item.label : ""}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#1a1d4e]" : "text-white group-hover:text-white"}`} />
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>


    </div>
  )
}

export default Sidebar

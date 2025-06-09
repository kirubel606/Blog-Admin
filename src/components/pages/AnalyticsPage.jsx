"use client"

import { useState } from "react"
import { TrendingUp, Users, Eye, Clock, Download, BarChart3 } from "lucide-react"

const analyticsData = {
  overview: [
    { label: "Total Visitors", value: "45,678", change: "+12.5%", trend: "up", icon: Users },
    { label: "Page Views", value: "123,456", change: "+8.2%", trend: "up", icon: Eye },
    { label: "Avg. Session", value: "3m 24s", change: "-2.1%", trend: "down", icon: Clock },
    { label: "Bounce Rate", value: "34.2%", change: "-5.3%", trend: "down", icon: TrendingUp },
  ],
  topPages: [
    { page: "/", views: 12450, percentage: 35.2 },
    { page: "/products", views: 8930, percentage: 25.3 },
    { page: "/about", views: 5670, percentage: 16.1 },
    { page: "/contact", views: 3240, percentage: 9.2 },
    { page: "/blog", views: 2890, percentage: 8.2 },
  ],
  trafficSources: [
    { source: "Direct", visitors: 15678, percentage: 34.3 },
    { source: "Google Search", visitors: 12340, percentage: 27.0 },
    { source: "Social Media", visitors: 8950, percentage: 19.6 },
    { source: "Email", visitors: 5430, percentage: 11.9 },
    { source: "Referrals", visitors: 3280, percentage: 7.2 },
  ],
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7days")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your website performance and user behavior</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F7941D] focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="bg-[#F7941D] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.overview.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-[#F7941D] to-[#181B5E]">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Visitors Overview</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Visitors chart would be displayed here</p>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Traffic Sources</h2>
          <div className="space-y-4">
            {analyticsData.trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    <span className="text-sm text-gray-600">{source.visitors.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#F7941D] to-[#181B5E] h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Pages</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Page</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Views</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Percentage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Performance</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topPages.map((page, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{page.page}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{page.views.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{page.percentage}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#F7941D] to-[#181B5E] h-2 rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

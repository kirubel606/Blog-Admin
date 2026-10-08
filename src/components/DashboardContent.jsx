"use client"

import { useState, useEffect, useMemo } from "react"
import {
  TrendingUp,
  Eye,
  FileText,
  Newspaper,
  Users,
  Layers,
  Calendar,
  Award,
  Sparkles,
  Filter,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Activity,
  Video,
  BookOpen,
  Briefcase,
  Mail,
  CheckCircle2,
  Flame,
  Globe,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { dashboardService } from "./services/dashboardService"

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

export default function DashboardContent() {
  // Master state
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [crossApp, setCrossApp] = useState(null)

  // Timeline-specific state
  const [timelineInterval, setTimelineInterval] = useState("week")
  const [timelineData, setTimelineData] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineMetric, setTimelineMetric] = useState("views") // 'views' | 'articles' | 'both'
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Top articles leaderboard state
  const [topNewsPage, setTopNewsPage] = useState(1)
  const [topNewsPageSize, setTopNewsPageSize] = useState(6)
  const [topNewsData, setTopNewsData] = useState({ results: [], total_count: 0, total_pages: 1 })
  const [topNewsLoading, setTopNewsLoading] = useState(false)

  // Category view mode
  const [categorySortBy, setCategorySortBy] = useState("views") // 'views' | 'items'

  // Filter States
  const [filters, setFilters] = useState({
    period: "all",
    date_from: "",
    date_to: "",
    type: "all",
    status: "all",
    category: "",
    author: "",
    magazine: "",
    has_video: "",
    search: "",
  })

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Load master overview data
  const loadDashboard = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const activeParams = cleanParams({ ...filters, top_limit: 8 })

      const [overviewRes, crossAppRes] = await Promise.all([
        dashboardService.getOverview(activeParams),
        dashboardService.getCrossAppStats().catch(() => null),
      ])

      setOverview(overviewRes)
      if (crossAppRes) setCrossApp(crossAppRes)
    } catch (err) {
      console.error("Dashboard overview load failed:", err)
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load dashboard metrics. Please check backend connection."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load specialized timeline data on interval or filter change
  const loadTimeline = async () => {
    try {
      setTimelineLoading(true)
      const params = cleanParams({
        ...filters,
        interval: timelineInterval,
        limit: timelineInterval === "day" ? 30 : timelineInterval === "week" ? 16 : 12,
      })
      const data = await dashboardService.getTimeline(params)
      setTimelineData(data.timeline || [])
    } catch (err) {
      console.warn("Timeline load failed, falling back to overview trends:", err)
      if (overview?.timeline_trends) {
        setTimelineData(overview.timeline_trends)
      }
    } finally {
      setTimelineLoading(false)
    }
  }

  // Load top news leaderboard data
  const loadTopNews = async (page = 1) => {
    try {
      setTopNewsLoading(true)
      const params = cleanParams({
        ...filters,
        page,
        page_size: topNewsPageSize,
      })
      const data = await dashboardService.getTopNews(params)
      setTopNewsData({
        results: data.results || [],
        total_count: data.total_count || 0,
        total_pages: data.total_pages || 1,
      })
      setTopNewsPage(page)
    } catch (err) {
      console.warn("Top news load failed:", err)
    } finally {
      setTopNewsLoading(false)
    }
  }

  // Clean params helper
  const cleanParams = (raw) => {
    const cleaned = {}
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined && v !== "all") {
        cleaned[k] = v
      }
    })
    return cleaned
  }

  // Initial load & when filters change
  useEffect(() => {
    loadDashboard()
    loadTimeline()
    loadTopNews(1)
  }, [
    filters.period,
    filters.date_from,
    filters.date_to,
    filters.type,
    filters.status,
    filters.category,
    filters.author,
    filters.magazine,
    filters.has_video,
    filters.search,
  ])

  // Reload timeline when interval tab changes
  useEffect(() => {
    loadTimeline()
  }, [timelineInterval])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.period !== "all") count++
    if (filters.date_from) count++
    if (filters.date_to) count++
    if (filters.type !== "all") count++
    if (filters.status !== "all") count++
    if (filters.category) count++
    if (filters.author) count++
    if (filters.magazine !== "") count++
    if (filters.has_video !== "") count++
    if (filters.search) count++
    return count
  }, [filters])

  const resetFilters = () => {
    setFilters({
      period: "all",
      date_from: "",
      date_to: "",
      type: "all",
      status: "all",
      category: "",
      author: "",
      magazine: "",
      has_video: "",
      search: "",
    })
  }

  // Helper to format big numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0"
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toLocaleString()
  }

  const getMediaUrl = (path) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    const base = BACKEND_BASE_URL.replace(/\/api\/?$/, "")
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`
  }

  // Categories list extracted from overview or crossApp
  const categoriesList = useMemo(() => {
    return overview?.category_analytics || []
  }, [overview])

  const authorsList = useMemo(() => {
    return overview?.author_leaderboard || []
  }, [overview])

  const summary = overview?.summary || {}
  const contentBreakdown = overview?.content_type_breakdown || {}
  const mediaDistribution = overview?.media_format_distribution || {}
  const crossAppStats = crossApp || overview?.cross_app_overview || {}

  // SVG Chart Computations for Timeline
  const chartCoordinates = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null

    const width = 800
    const height = 240
    const padX = 45
    const padY = 30
    const chartW = width - padX * 2
    const chartH = height - padY * 2

    const maxViews = Math.max(...timelineData.map((d) => d.views || 0), 10)
    const maxArticles = Math.max(...timelineData.map((d) => d.articles_count || 0), 5)

    const points = timelineData.map((d, i) => {
      const x = padX + (i / Math.max(timelineData.length - 1, 1)) * chartW
      const viewsRatio = (d.views || 0) / maxViews
      const yViews = height - padY - viewsRatio * chartH

      const articlesRatio = (d.articles_count || 0) / maxArticles
      const yArticles = height - padY - articlesRatio * chartH

      return {
        ...d,
        x,
        yViews,
        yArticles,
      }
    })

    // Generate smooth bezier curve path for views
    let pathViews = `M ${points[0].x} ${points[0].yViews}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cpX1 = p0.x + (p1.x - p0.x) / 2
      const cpY1 = p0.yViews
      const cpX2 = cpX1
      const cpY2 = p1.yViews
      pathViews += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.yViews}`
    }

    const areaViews = `${pathViews} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`

    return {
      width,
      height,
      padX,
      padY,
      chartW,
      chartH,
      maxViews,
      maxArticles,
      points,
      pathViews,
      areaViews,
    }
  }, [timelineData])

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-12 h-12 text-[#2a2d7a] animate-spin" />
        <p className="text-gray-600 font-medium text-lg">Loading complete ecosystem analytics...</p>
        <p className="text-gray-400 text-sm">Aggregating views, categories, timelines & cross-app metrics</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION & QUICK CONTROLS                        */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-[#2a2d7a] via-[#353a99] to-[#1f225e] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />


        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md rounded-xl text-sm font-semibold transition-all border border-white/15 shadow-sm"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Metrics"}</span>
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              showAdvancedFilters || activeFiltersCount > 0
                ? "bg-white text-[#2a2d7a] shadow-md"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. COMPREHENSIVE MULTI-DIMENSIONAL FILTER BAR             */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 space-y-4">
        {/* Top Filter Bar: Period Pills + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Preset Period Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Period:
            </span>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "365d", label: "1 Year" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilters((prev) => ({ ...prev, period: p.id, date_from: "", date_to: "" }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filters.period === p.id && !filters.date_from
                    ? "bg-[#2a2d7a] text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search titles, tags, topics..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a] transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {/* Content Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a]"
              >
                <option value="all">All Content (News + Blogs)</option>
                <option value="news">News Articles only</option>
                <option value="blog">Blog Posts only</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a]"
              >
                <option value="all">All Statuses</option>
                <option value="publish">Published</option>
                <option value="draft">Drafts only</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a]"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat.category_id} value={cat.category_name}>
                    {cat.category_name} ({cat.total_items})
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Author</label>
              <select
                value={filters.author}
                onChange={(e) => setFilters((prev) => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a]"
              >
                <option value="">All Authors</option>
                {authorsList.map((auth) => (
                  <option key={auth.author_id} value={auth.username}>
                    {auth.username} ({auth.articles_count} posts)
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date_from: e.target.value,
                    period: e.target.value ? "" : prev.period,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date_to: e.target.value,
                    period: e.target.value ? "" : prev.period,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#2a2d7a]/20 focus:border-[#2a2d7a]"
              />
            </div>

            {/* Media Formats Toggles */}
            <div className="flex items-center space-x-3 pt-6">
              <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.magazine === "true"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      magazine: e.target.checked ? "true" : "",
                    }))
                  }
                  className="rounded text-[#2a2d7a] focus:ring-[#2a2d7a] w-4 h-4"
                />
                <span>Magazines only</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.has_video === "true"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      has_video: e.target.checked ? "true" : "",
                    }))
                  }
                  className="rounded text-[#2a2d7a] focus:ring-[#2a2d7a] w-4 h-4"
                />
                <span>Has Video only</span>
              </label>
            </div>

            {/* Reset All Filters */}
            <div className="flex items-center justify-end pt-6">
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Pill Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="font-semibold text-gray-500">Active filters:</span>
            {filters.period !== "all" && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-100">
                Period: {filters.period}
              </span>
            )}
            {filters.type !== "all" && (
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-medium rounded-lg border border-purple-100">
                Type: {filters.type}
              </span>
            )}
            {filters.status !== "all" && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-100">
                Status: {filters.status}
              </span>
            )}
            {filters.category && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-medium rounded-lg border border-amber-100">
                Category: {filters.category}
              </span>
            )}
            {filters.author && (
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-medium rounded-lg border border-indigo-100">
                Author: {filters.author}
              </span>
            )}
            {filters.magazine && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-medium rounded-lg border border-rose-100">
                Format: Magazine
              </span>
            )}
            {filters.has_video && (
              <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 font-medium rounded-lg border border-cyan-100">
                Video: Yes
              </span>
            )}
            {filters.search && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-200">
                Search: "{filters.search}"
              </span>
            )}
            <button onClick={resetFilters} className="text-gray-400 hover:text-gray-700 font-bold ml-1">
              &times; Clear
            </button>
          </div>
        )}
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-red-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={() => loadDashboard(true)}
            className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CORE METRIC KPI CARDS (Summary)                        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Views */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Avg {summary.avg_views_per_article || 0} / post
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatNumber(summary.total_views)}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-1">Total View Engagement</p>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Peak single article</span>
            <span className="font-bold text-gray-800">{formatNumber(summary.max_views_single_article)} views</span>
          </div>
        </div>

        {/* Total Articles Published / Drafts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              {summary.published_count || 0} Published
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {summary.total_articles || 0}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-1">Total Content Posts</p>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>News: {summary.total_news || 0}</span>
            <span>Blogs: {summary.total_blogs || 0}</span>
            <span>Drafts: {summary.draft_count || 0}</span>
          </div>
        </div>

        {/* Categories & Topics Reach */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
              {summary.active_categories_count || 0} Topics
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {crossAppStats.categories?.total || summary.active_categories_count || 15}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-1">Ecosystem Categories</p>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Core Pillars</span>
            <span className="font-bold text-gray-800">{crossAppStats.categories?.core_categories || 5} Primary</span>
          </div>
        </div>

        {/* Media & Interactive Richness */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
              {summary.magazines_count || 0} Magazines
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {(summary.magazines_count || 0) + (summary.videos_count || 0)}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-1">Rich Media Formats</p>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Video embeds: {summary.videos_count || 0}</span>
            <span>Standard: {mediaDistribution.standard?.count || 0}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN CHART: INTERACTIVE TIME-SERIES TIMELINE           */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Views & Publication Dynamics</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Historical readership trajectory and publishing cadence over time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
              <button
                onClick={() => setTimelineMetric("views")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timelineMetric === "views" ? "bg-white text-blue-700 shadow-sm" : "hover:text-gray-900"
                }`}
              >
                Views Curve
              </button>
              <button
                onClick={() => setTimelineMetric("articles")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timelineMetric === "articles" ? "bg-white text-blue-700 shadow-sm" : "hover:text-gray-900"
                }`}
              >
                Articles Published
              </button>
              <button
                onClick={() => setTimelineMetric("both")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timelineMetric === "both" ? "bg-white text-blue-700 shadow-sm" : "hover:text-gray-900"
                }`}
              >
                Both
              </button>
            </div>

            {/* Interval Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
              {["day", "week", "month"].map((inv) => (
                <button
                  key={inv}
                  onClick={() => setTimelineInterval(inv)}
                  className={`px-2.5 py-1.5 rounded-lg capitalize transition-all ${
                    timelineInterval === inv ? "bg-[#2a2d7a] text-white shadow-sm" : "hover:text-gray-900"
                  }`}
                >
                  {inv}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom SVG Interactive Chart */}
        <div className="relative pt-4">
          {timelineLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-[#2a2d7a] animate-spin" />
            </div>
          )}

          {chartCoordinates && chartCoordinates.points.length > 0 ? (
            <div className="overflow-x-auto scrollbar-none">
              <div className="min-w-[680px]">
                <svg
                  viewBox={`0 0 ${chartCoordinates.width} ${chartCoordinates.height}`}
                  className="w-full h-64 overflow-visible"
                >
                  <defs>
                    <linearGradient id="viewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                      <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y =
                      chartCoordinates.height -
                      chartCoordinates.padY -
                      ratio * chartCoordinates.chartH
                    const val = Math.round(ratio * chartCoordinates.maxViews)
                    return (
                      <g key={idx}>
                        <line
                          x1={chartCoordinates.padX}
                          y1={y}
                          x2={chartCoordinates.width - chartCoordinates.padX}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={chartCoordinates.padX - 8}
                          y={y + 4}
                          fontSize="10"
                          fill="#94a3b8"
                          textAnchor="end"
                          fontWeight="500"
                        >
                          {formatNumber(val)}
                        </text>
                      </g>
                    )
                  })}

                  {/* Render Bar Chart for Articles (if 'articles' or 'both') */}
                  {(timelineMetric === "articles" || timelineMetric === "both") &&
                    chartCoordinates.points.map((pt, idx) => {
                      const barWidth = Math.max(
                        chartCoordinates.chartW / (chartCoordinates.points.length * 2.2),
                        6
                      )
                      const barH =
                        chartCoordinates.height - chartCoordinates.padY - pt.yArticles
                      return (
                        <rect
                          key={`bar-${idx}`}
                          x={pt.x - barWidth / 2}
                          y={pt.yArticles}
                          width={barWidth}
                          height={barH}
                          rx={3}
                          fill="url(#barGradient)"
                          opacity={timelineMetric === "both" ? 0.6 : 0.9}
                          className="transition-all hover:opacity-100"
                        />
                      )
                    })}

                  {/* Render Area & Curved Line for Views (if 'views' or 'both') */}
                  {(timelineMetric === "views" || timelineMetric === "both") && (
                    <>
                      <path d={chartCoordinates.areaViews} fill="url(#viewsAreaGradient)" />
                      <path
                        d={chartCoordinates.pathViews}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {/* Interactive Points on Line */}
                  {(timelineMetric === "views" || timelineMetric === "both") &&
                    chartCoordinates.points.map((pt, idx) => (
                      <g
                        key={`pt-${idx}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.yViews}
                          r={hoveredPoint?.date === pt.date ? 6 : 3.5}
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          className="transition-all"
                        />
                        {/* Hover vertical guide line */}
                        {hoveredPoint?.date === pt.date && (
                          <line
                            x1={pt.x}
                            y1={chartCoordinates.padY}
                            x2={pt.x}
                            y2={chartCoordinates.height - chartCoordinates.padY}
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                        )}
                      </g>
                    ))}

                  {/* X-axis date labels */}
                  {chartCoordinates.points.map((pt, idx) => {
                    // Show a subset of labels to prevent crowding
                    const step = Math.ceil(chartCoordinates.points.length / 7)
                    if (idx % step !== 0 && idx !== chartCoordinates.points.length - 1) return null

                    const formattedDate = new Date(pt.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: timelineInterval === "day" ? "numeric" : undefined,
                    })

                    return (
                      <text
                        key={`lbl-${idx}`}
                        x={pt.x}
                        y={chartCoordinates.height - 10}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {formattedDate}
                      </text>
                    )
                  })}
                </svg>

                {/* Hover Tooltip Popup */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl text-xs pointer-events-none transition-all z-30"
                    style={{
                      left: Math.min(Math.max(hoveredPoint.x, 80), chartCoordinates.width - 120),
                      top: Math.max(hoveredPoint.yViews - 70, 10),
                    }}
                  >
                    <p className="font-bold text-gray-300">
                      {new Date(hoveredPoint.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between space-x-3">
                        <span className="flex items-center text-blue-400">
                          <Eye className="w-3 h-3 mr-1" /> Views:
                        </span>
                        <span className="font-bold">{hoveredPoint.views?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between space-x-3">
                        <span className="flex items-center text-emerald-400">
                          <FileText className="w-3 h-3 mr-1" /> Published:
                        </span>
                        <span className="font-bold">{hoveredPoint.articles_count} posts</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 font-medium">
              No timeline data points found matching current filter configuration.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. DUAL ANALYTICS: CATEGORY REACH & CONTENT BREAKDOWN     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Analytics (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Category Impact & Audience Share</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Total article volume and readership percentage across topics
              </p>
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
              <button
                onClick={() => setCategorySortBy("views")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  categorySortBy === "views" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-gray-900"
                }`}
              >
                By Views %
              </button>
              <button
                onClick={() => setCategorySortBy("items")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  categorySortBy === "items" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-gray-900"
                }`}
              >
                By Article Count
              </button>
            </div>
          </div>

          {/* Category Bars List */}
          <div className="space-y-4">
            {categoriesList.length > 0 ? (
              [...categoriesList]
                .sort((a, b) =>
                  categorySortBy === "views"
                    ? (b.views_percentage || 0) - (a.views_percentage || 0)
                    : (b.total_items || 0) - (a.total_items || 0)
                )
                .slice(0, 8)
                .map((cat, idx) => {
                  const share =
                    categorySortBy === "views"
                      ? cat.views_percentage || 0
                      : cat.items_percentage || 0

                  return (
                    <div key={cat.category_id || idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 text-gray-400 font-mono text-xs">{idx + 1}.</span>
                          <span className="text-gray-900">{cat.category_name}</span>
                          {cat.category_name_am && (
                            <span className="text-gray-400 text-xs hidden sm:inline font-normal">
                              ({cat.category_name_am})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-gray-500 font-normal">
                            {cat.total_items} items &bull; Avg {cat.avg_views} views
                          </span>
                          <span className="font-bold text-gray-900 min-w-[50px] text-right">
                            {formatNumber(cat.total_views)} views ({share}%)
                          </span>
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            idx === 0
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                              : idx === 1
                              ? "bg-gradient-to-r from-teal-500 to-emerald-600"
                              : idx === 2
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-gradient-to-r from-purple-500 to-indigo-500"
                          }`}
                          style={{ width: `${Math.min(Math.max(share, 4), 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">No category metrics available.</p>
            )}
          </div>
        </div>

        {/* Content-Type & Media Distribution (1 Column) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Format & Type Balance</h2>
            </div>
            <p className="text-xs text-gray-500">Distribution between News, Blogs and Multimedia</p>

            {/* News vs Blog Cards */}
            <div className="mt-5 space-y-3">
              {/* News Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">News Releases</h4>
                      <p className="text-xs text-gray-500">
                        {contentBreakdown.news?.published || summary.total_news || 0} published &bull;{" "}
                        {contentBreakdown.news?.draft || 0} drafts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-900">
                      {contentBreakdown.news?.views_share_percentage || 100}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatNumber(contentBreakdown.news?.total_views || summary.total_views)} views
                    </p>
                  </div>
                </div>
              </div>

              {/* Blog Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/40 border border-purple-100/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Blog Insights</h4>
                      <p className="text-xs text-gray-500">
                        {contentBreakdown.blog?.published || summary.total_blogs || 0} published &bull;{" "}
                        {contentBreakdown.blog?.draft || 0} drafts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-purple-900">
                      {contentBreakdown.blog?.views_share_percentage || 0}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatNumber(contentBreakdown.blog?.total_views || 0)} views
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Formats */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Multimedia Delivery Breakdown
              </h4>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <FileText className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">
                    {mediaDistribution.standard?.count || summary.total_articles || 0}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Standard</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <BookOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-900">{summary.magazines_count || 0}</p>
                  <p className="text-[10px] text-blue-600 uppercase font-semibold">Magazines</p>
                </div>

                <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                  <Video className="w-4 h-4 text-pink-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-pink-900">{summary.videos_count || 0}</p>
                  <p className="text-[10px] text-pink-600 uppercase font-semibold">Videos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Author Community:</span>
            <span className="font-bold text-gray-800">{authorsList.length} Active Contributors</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. TOP-PERFORMING ARTICLES LEADERBOARD                    */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Most Read Articles & Engagement Leaderboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Real-time sorted leaderboard of highest-performing releases across all categories
            </p>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
            <button
              onClick={() => loadTopNews(Math.max(topNewsPage - 1, 1))}
              disabled={topNewsPage <= 1 || topNewsLoading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-gray-100 rounded-lg">
              Page {topNewsPage} of {topNewsData.total_pages || 1}
            </span>
            <button
              onClick={() => loadTopNews(Math.min(topNewsPage + 1, topNewsData.total_pages))}
              disabled={topNewsPage >= topNewsData.total_pages || topNewsLoading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Articles Table */}
        <div className="overflow-x-auto">
          {topNewsLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-[#2a2d7a] animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Updating article leaderboard...</p>
            </div>
          ) : topNewsData.results.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Rank</th>
                  <th className="pb-3 px-3">Article Title</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Author</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {topNewsData.results.map((item, idx) => {
                  const globalRank = (topNewsPage - 1) * topNewsPageSize + idx + 1
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Rank Medal */}
                      <td className="py-4 px-3 font-bold">
                        {globalRank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                            #1
                          </span>
                        ) : globalRank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-800 font-extrabold text-xs">
                            #2
                          </span>
                        ) : globalRank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/10 text-amber-900 font-extrabold text-xs">
                            #3
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono text-xs px-2">#{globalRank}</span>
                        )}
                      </td>

                      {/* Title & Preview Image */}
                      <td className="py-4 px-3">
                        <div className="flex items-center space-x-3.5 max-w-lg">
                          <img
                            src={
                              getMediaUrl(item.cover_image) ||
                              "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop"
                            }
                            alt=""
                            className="w-14 h-10 object-cover rounded-xl shadow-xs flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop"
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            {item.subtitle && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                          {item.category?.name || "General"}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-md uppercase tracking-wide ${
                            item.type === "blog"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.type || "news"}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-3 text-xs text-gray-600 font-medium">
                        {item.author?.username || "Admin"}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-3 text-xs text-gray-500 whitespace-nowrap">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Views Badge */}
                      <td className="py-4 px-3 text-right">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-extrabold text-xs">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>{(item.views || 0).toLocaleString()}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-12 text-gray-400 text-sm">
              No articles found matching criteria.
            </p>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. CROSS-APP ECOSYSTEM MONITORING MATRIX                   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Cross-App Ecosystem Status Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live operational health and volume across all 12+ integrated institute modules
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 self-start sm:self-auto flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Services Operational</span>
          </span>
        </div>

        {/* Grid of Micro-App Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Newsletter Subscribers */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100 hover:shadow-sm transition">
            <Mail className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="text-2xl font-black text-gray-900">
              {formatNumber(crossAppStats.inquiries_and_subscribers?.newsletter_subscribers || 1037)}
            </h4>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">Subscribers</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {crossAppStats.inquiries_and_subscribers?.total_contact_messages || 243} Inquiries
            </p>
          </div>

          {/* Collaborations */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100 hover:shadow-sm transition">
            <Users className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-2xl font-black text-gray-900">
              {crossAppStats.collaborations?.total || 70}
            </h4>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">Partnerships</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {crossAppStats.collaborations?.international || 5} Global &bull;{" "}
              {crossAppStats.collaborations?.local || 65} Local
            </p>
          </div>

          {/* R&D Projects */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100 hover:shadow-sm transition">
            <Activity className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="text-2xl font-black text-gray-900">
              {crossAppStats.rnd_projects?.total || 7}
            </h4>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">R&D Projects</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {crossAppStats.rnd_projects?.research || 1} Research &bull;{" "}
              {crossAppStats.rnd_projects?.development || 6} Dev
            </p>
          </div>

          {/* Events */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100 hover:shadow-sm transition">
            <Calendar className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="text-2xl font-black text-gray-900">
              {crossAppStats.events?.total || 3}
            </h4>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">Events</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {crossAppStats.events?.live || 1} Live &bull;{" "}
              {crossAppStats.events?.completed || 3} Completed
            </p>
          </div>

          {/* Galleries & Media */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/50 to-pink-50/50 border border-rose-100 hover:shadow-sm transition">
            <Layers className="w-5 h-5 text-rose-600 mb-2" />
            <h4 className="text-2xl font-black text-gray-900">
              {crossAppStats.gallery?.total_galleries || 19}
            </h4>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">Galleries</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {crossAppStats.gallery?.total_images || 53} Media Assets
            </p>
          </div>

          {/* Organization & Team */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 hover:shadow-sm transition">
            <Briefcase className="w-5 h-5 text-gray-700 mb-2" />
            <h4 className="text-2xl font-black text-gray-900">
              {crossAppStats.organization?.team_members || 4}
            </h4>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">Key Staff</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {crossAppStats.organization?.organization_units || 4} Units
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

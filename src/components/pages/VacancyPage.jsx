"use client"

import { useState } from "react"
import { Plus, X, ExternalLink } from "lucide-react"
import VacancyForm from "./VacancyForm"

// Mock data - replace with actual API calls
const mockVacancies = [
  {
    id: 1,
    title: "Senior Software Engineer",
    description: "We are looking for an experienced software engineer to join our team...",
    google_form_link: "https://forms.google.com/example1",
    location: "New York, NY",
    deadline: "2024-04-15",
    created_at: "2024-03-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Product Designer",
    description: "Join our design team to create beautiful and functional products...",
    google_form_link: "https://forms.google.com/example2",
    location: "Remote",
    deadline: "2024-04-30",
    created_at: "2024-03-10T14:30:00Z"
  }
]

function VacancyPage() {
  const [showVacancyForm, setShowVacancyForm] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState(null)

  const handleVacancySubmit = (formData) => {
    // Handle form submission
    console.log(formData)
    setShowVacancyForm(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vacancies</h1>
          <p className="text-gray-600 mt-1">Manage job openings and applications</p>
        </div>
        <button
          onClick={() => setShowVacancyForm(true)}
          className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Post Vacancy
        </button>
      </div>

      {/* Vacancies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVacancies.map((vacancy) => (
          <div
            key={vacancy.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Vacancy Header */}
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{vacancy.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Posted on {formatDate(vacancy.created_at)}
              </p>
            </div>

            {/* Vacancy Details */}
            <div className="p-4 space-y-3">
              {vacancy.location && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {vacancy.location}
                </p>
              )}
              {vacancy.deadline && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Deadline:</span> {formatDate(vacancy.deadline)}
                </p>
              )}
              <p className="text-sm text-gray-600 line-clamp-3">
                {vacancy.description}
              </p>
            </div>

            {/* Vacancy Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <button
                onClick={() => setSelectedVacancy(vacancy)}
                className="text-sm text-secondary hover:text-[#FF8533] font-medium"
              >
                View Details
              </button>
              <a
                href={vacancy.google_form_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:text-[#FF8533] font-medium flex items-center"
              >
                Apply Now
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Vacancy Form Modal */}
      {showVacancyForm && (
        <VacancyForm
          onClose={() => setShowVacancyForm(false)}
          onSubmit={handleVacancySubmit}
        />
      )}

      {/* Vacancy Detail Modal */}
      {selectedVacancy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedVacancy.title}</h2>
              <button
                onClick={() => setSelectedVacancy(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedVacancy.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Location</h3>
                    <p className="mt-1 text-gray-900">{selectedVacancy.location}</p>
                  </div>
                )}
                {selectedVacancy.deadline && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Application Deadline</h3>
                    <p className="mt-1 text-gray-900">{formatDate(selectedVacancy.deadline)}</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Job Description</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedVacancy.description}</p>
              </div>
              <div className="pt-4 border-t">
                <a
                  href={selectedVacancy.google_form_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VacancyPage 
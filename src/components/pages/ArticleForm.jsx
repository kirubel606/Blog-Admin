import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import axios from 'axios'
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

function ArticleForm({ article, onClose, onSubmit }) {
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    cover_image: null,
    images: [],
    tags: "",
    status: "draft",
    hasVideo: false,
    iframe: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const apiUrl = `${BACKEND_BASE_URL}/categories/`
      try {
        const res = await axios.get(apiUrl)
        setCategories(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("Error fetching categories:", err)
        setCategories([])
      } finally {
        setCatLoading(false)
      }
    }
    fetchCategories()
  }, [])
  
  

  // Populate form when editing an article
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        category: article.category?.id || article.category || "",
        content: article.content || "",
        cover_image: article.cover_image || null,
        images: article.images || [],
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ""),
        status: article.status === "publish" ? "published" : (article.status || "draft"),
        hasVideo: !!article.iframe,
        iframe: article.iframe || ""
      })
    }
  }, [article])
  // 💥 NEW: sync category once both article & categories are loaded
// 💥 FIXED: sync category once both article & categories are loaded
useEffect(() => {
  if (article && categories.length) {
    // article.category is the category NAME string
    const catName = article.category

    // find the category object by name
    const matched = categories.find(cat => cat.name === catName)

    if (matched) {
      // set the formData.category to the matched id (as string for the <select>)
      setFormData(prev => ({
        ...prev,
        category: matched.id.toString()
      }))
    } else {
      console.warn(`Category "${catName}" not found in fetched list`)
    }
  }
}, [article, categories])


const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)

  try {
    // Find the selected category object by ID
    const selectedCat = categories.find(
      c => c.id.toString() === formData.category
    )
    const categoryValue = selectedCat
      ? selectedCat.name
      : formData.category  // fallback if something odd happened

    // Convert status back to API format
    const submitData = {
      ...formData,
      category: categoryValue,
      status: formData.status === "published" ? "publish" : formData.status
    }

    await onSubmit(submitData)
  } catch (error) {
    console.error('Form submission error:', error)
    setError('Failed to save article. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}


  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover image must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Cover image must be an image file')
        return
      }

      setFormData(prev => ({
        ...prev,
        cover_image: file
      }))
      setError(null)
    }
  }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB')
        return false
      }
      if (!file.type.startsWith('image/')) {
        setError('All files must be images')
        return false
      }
      return true
    })

    if (validFiles.length !== files.length) {
      return // Error message already set above
    }

    setFormData(prev => ({
      ...prev,
      images: validFiles
    }))
    setError(null)
  }

  const getCoverImageSrc = () => {
    if (formData.cover_image instanceof File) {
      return URL.createObjectURL(formData.cover_image)
    }
    if (typeof formData.cover_image === 'string' && formData.cover_image) {
      if (formData.cover_image.startsWith('http')) {
        return formData.cover_image
      }
      return BACKEND_BASE_URL+`${formData.cover_image}`
    }
    return null
  }

  const getImageSrc = (image) => {
    if (image instanceof File) {
      return URL.createObjectURL(image)
    }
    if (typeof image === 'object' && image.image) {
      if (image.image.startsWith('http')) {
        return image.image
      }
      return BACKEND_BASE_URL+`${image.image}`
    }
    if (typeof image === 'string') {
      if (image.startsWith('http')) {
        return image
      }
      return BACKEND_BASE_URL+`${image}`
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {article ? 'Edit Article' : 'Create New Article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter article title"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} required disabled={isSubmitting || catLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Video Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasVideo"
                checked={formData.hasVideo}
                onChange={(e) => setFormData(prev => ({ ...prev, hasVideo: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="hasVideo" className="ml-2 block text-sm font-medium text-gray-700">
                Include Video
              </label>
            </div>

            {formData.hasVideo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Embed Code
                </label>
                <textarea
                  value={formData.iframe}
                  onChange={(e) => setFormData(prev => ({ ...prev, iframe: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Paste your video embed iframe code here"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
                disabled={isSubmitting}
              />
              {formData.cover_image && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={getCoverImageSrc()}
                    alt="Cover preview"
                    className="h-32 w-auto object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, cover_image: null }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images
            </label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
                disabled={isSubmitting}
              />
              {formData.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageSrc(image)}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index)
                          setFormData(prev => ({ ...prev, images: newImages }))
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content - WYSIWYG Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <CKEditor
                editor={ClassicEditor}
                data={formData.content}
                onChange={(event, editor) => {
                  const data = editor.getData()
                  setFormData(prev => ({ ...prev, content: data }))
                }}
                config={{
                  // Explicit heading levels so Enter creates separate <h2>, <h3>, <h4> blocks
                  heading: {
                    options: [
                      { model: 'paragraph', view: 'p',  title: 'Paragraph' },
                      { model: 'heading2',  view: 'h2', title: 'Heading 2' },
                      { model: 'heading3',  view: 'h3', title: 'Heading 3' },
                      { model: 'heading4',  view: 'h4', title: 'Heading 4' },
                    ]
                  },
                  toolbar: [
                    'heading', '|',
                    'bold', 'italic', 'link', '|',
                    'bulletedList', 'numberedList', '|',
                    'outdent', 'indent', '|',
                    'blockQuote', '|',
                    'undo', 'redo'
                  ],
                  placeholder: 'Write your article content here...',
                  height: '400px'
                }}
                onReady={editor => {
                  // Set editor height and text color
                  editor.editing.view.change(writer => {
                    writer.setStyle(
                      'min-height',
                      '400px',
                      editor.editing.view.document.getRoot()
                    )
                    writer.setStyle(
                      'color',
                      '#1f2937',
                      editor.editing.view.document.getRoot()
                    )
                  })
                }}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Use the rich text editor to format your article content with headings, lists, links, and more.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter tags separated by commas"
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isSubmitting}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : article 
                    ? 'Update Article' 
                    : formData.status === "draft" 
                      ? "Save as Draft" 
                      : "Publish Article"
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArticleForm
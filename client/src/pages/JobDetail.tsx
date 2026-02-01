import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

interface Job {
  id: string
  title: string
  description: string
  category_id: string
  job_type: string
  payment_type: string
  budget_min: number | null
  budget_max: number | null
  hourly_rate: number | null
  estimated_hours: number | null
  is_remote: boolean
  required_workers: number
  start_date: string
  status: string
  city?: string
  state?: string
  contractor?: {
    id: string
    first_name: string
    last_name: string
    company_name?: string
  }
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useSelector((state: RootState) => state.auth)

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/v1/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setJob(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !job) return

    setApplying(true)
    setError('')

    try {
      const response = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter,
          proposedRate: proposedRate ? parseFloat(proposedRate) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application')
      }

      setApplied(true)
      setShowApplyModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    }

    setApplying(false)
  }

  const formatBudget = () => {
    if (!job) return ''
    if (job.hourly_rate) {
      return `$${job.hourly_rate}/hr`
    }
    if (job.budget_min && job.budget_max) {
      if (job.budget_min === job.budget_max) {
        return `$${job.budget_min}`
      }
      return `$${job.budget_min} - $${job.budget_max}`
    }
    return 'Contact for price'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Job not found
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                job.status === 'published' ? 'bg-green-100 text-green-800' :
                job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status.replace('_', ' ')}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              {job.contractor && (
                <p className="text-gray-600 mt-2">
                  Posted by {job.contractor.company_name || `${job.contractor.first_name} ${job.contractor.last_name}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{formatBudget()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {job.payment_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Job Type</h3>
              <p className="text-gray-900 capitalize">{job.job_type.replace('_', ' ')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Workers Needed</h3>
              <p className="text-gray-900">{job.required_workers}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
              <p className="text-gray-900">{new Date(job.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <p className="text-gray-900">
                {job.is_remote ? 'Remote' : `${job.city || ''}, ${job.state || ''}`}
              </p>
            </div>
            {job.estimated_hours && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Hours</h3>
                <p className="text-gray-900">{job.estimated_hours} hours</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {applied ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Application submitted successfully!
            </div>
          ) : user ? (
            user.role === 'worker' ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium text-lg"
              >
                Apply for this Job
              </button>
            ) : (
              <p className="text-center text-gray-500">Only workers can apply for jobs</p>
            )
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-3">Login to apply for this job</p>
              <a
                href="/login"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Login
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for this Job</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleApply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  required
                  placeholder="Introduce yourself and explain why you're a good fit for this job..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {job.payment_type === 'hourly' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Proposed Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    placeholder={job.hourly_rate?.toString() || '25'}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

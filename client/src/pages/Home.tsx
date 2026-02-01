import { Link } from 'react-router-dom'

export default function Home() {
  const categories = [
    { name: 'General Labor', icon: '🔧' },
    { name: 'Construction', icon: '🏗️' },
    { name: 'Plumbing', icon: '🚿' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Painting', icon: '🎨' },
    { name: 'Landscaping', icon: '🌳' },
    { name: 'Cleaning', icon: '🧹' },
    { name: 'Moving', icon: '📦' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Skilled Workers Near You
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Connect with reliable day laborers and contractors for any job, big or small.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/jobs"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Find Work
              </Link>
              <Link
                to="/register"
                className="bg-primary-700 hover:bg-primary-900 text-white px-8 py-3 rounded-lg font-semibold text-lg border border-primary-400"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/jobs?category=${category.name.toLowerCase().replace(' ', '_')}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center"
            >
              <span className="text-4xl mb-3 block">{category.icon}</span>
              <span className="text-gray-800 font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Job</h3>
              <p className="text-gray-600">Describe what you need done and set your budget.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Applications</h3>
              <p className="text-gray-600">Receive applications from qualified workers nearby.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Hire & Pay Securely</h3>
              <p className="text-gray-600">Choose your worker and pay securely through the platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600">10,000+</div>
            <div className="text-gray-600 mt-2">Active Workers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600">50,000+</div>
            <div className="text-gray-600 mt-2">Jobs Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600">4.8/5</div>
            <div className="text-gray-600 mt-2">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}

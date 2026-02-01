import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Job {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  hourly_rate: number | null
  latitude: number
  longitude: number
  city?: string
  state?: string
  status: string
}

function LocationMarker({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap()

  useEffect(() => {
    map.locate()

    map.on('locationfound', (e) => {
      map.flyTo(e.latlng, 12)
      onLocationFound(e.latlng.lat, e.latlng.lng)
    })
  }, [map, onLocationFound])

  return null
}

export default function MapView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [radius, setRadius] = useState(50)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  // Default center (Los Angeles)
  const defaultCenter: [number, number] = [34.0522, -118.2437]

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async (lat?: number, lng?: number, radiusKm?: number) => {
    setLoading(true)
    try {
      let url = '/api/v1/jobs'
      if (lat && lng) {
        url = `/api/v1/jobs/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm || radius}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.data?.jobs) {
        // Filter jobs with valid coordinates
        const jobsWithCoords = data.data.jobs.filter(
          (job: Job) => job.latitude && job.longitude
        )
        setJobs(jobsWithCoords)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
    setLoading(false)
  }

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation([lat, lng])
    fetchJobs(lat, lng, radius)
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    if (userLocation) {
      fetchJobs(userLocation[0], userLocation[1], newRadius)
    }
  }

  const formatBudget = (job: Job) => {
    if (job.hourly_rate) {
      return `$${job.hourly_rate}/hr`
    }
    if (job.budget_min && job.budget_max) {
      return `$${job.budget_min} - $${job.budget_max}`
    }
    return 'Contact for price'
  }

  const jobIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Jobs Near You</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Radius:</span>
              <select
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </label>
            <span className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${jobs.length} jobs found`}
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={defaultCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker onLocationFound={handleLocationFound} />

          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Your location</Popup>
            </Marker>
          )}

          {/* Job markers */}
          {jobs.map((job) => (
            <Marker
              key={job.id}
              position={[job.latitude, job.longitude]}
              icon={jobIcon}
              eventHandlers={{
                click: () => setSelectedJob(job),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-gray-900">{job.title}</h3>
                  <p className="text-primary-600 font-medium">{formatBudget(job)}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Job Panel */}
        {selectedJob && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-lg p-4 z-[1000]">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-2">
              {selectedJob.status}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
            <p className="text-2xl font-bold text-primary-600 mt-1">{formatBudget(selectedJob)}</p>
            <p className="text-gray-600 mt-2">{selectedJob.description}</p>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium">
                Apply Now
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

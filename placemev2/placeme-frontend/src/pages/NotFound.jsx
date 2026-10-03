import { Link } from 'react-router-dom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-launchpad-light flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        {/* Suggestions */}
        <div className="space-y-3 mb-8">
          <p className="text-sm text-gray-600">You might want to try:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check the URL and try again</li>
            <li>• Return to the home page</li>
            <li>• Contact support if you think this is a mistake</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary text-center">
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline text-center"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound

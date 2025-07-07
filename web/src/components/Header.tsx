import { Link } from '@tanstack/react-router'
import { Lightbulb, Home } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-black hover:text-gray-800 transition-all"
            >
              <Lightbulb className="h-6 w-6 text-black" />
              Notes
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-800 transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
                activeProps={{ className: "text-gray-800 font-medium bg-gray-100" }}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Simple note-taking
          </div>
        </nav>
      </div>
    </header>
  )
}

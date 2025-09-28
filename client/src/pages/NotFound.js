import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-primary-600">404</span>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Page not found
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            <p>If you think this is an error, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
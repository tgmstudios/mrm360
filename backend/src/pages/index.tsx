import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>MRM360 Backend</title>
        <meta name="description" content="MRM360 Management System Backend" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MRM360</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Management System Backend
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/docs"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  API Documentation
                </Link>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  OpenAPI Spec
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to MRM360
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A comprehensive management system backend built with Next.js, TypeScript, and modern web technologies.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Authentication */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">OIDC Authentication</h3>
                      <p className="text-sm text-gray-500">
                        Secure authentication via Authentik OIDC with role-based access control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Management */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">RESTful API</h3>
                      <p className="text-sm text-gray-500">
                        Comprehensive REST API with automatic Swagger documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Tasks */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Background Jobs</h3>
                      <p className="text-sm text-gray-500">
                        Asynchronous task processing with BullMQ and Redis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">PostgreSQL + Prisma</h3>
                      <p className="text-sm text-gray-500">
                        Type-safe database operations with Prisma ORM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">CASL Permissions</h3>
                      <p className="text-sm text-gray-500">
                        Fine-grained permission system with CASL abilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TypeScript */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">TypeScript</h3>
                      <p className="text-sm text-gray-500">
                        Full type safety and modern JavaScript features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="mt-20 bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">API Endpoints</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/users</code> - User management</li>
                    <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/teams</code> - Team management</li>
                    <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/events</code> - Event management</li>
                    <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/groups</code> - Group management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Documentation</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <Link href="/docs" className="text-blue-600 hover:text-blue-800">Interactive API Docs</Link></li>
                    <li>• <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">OpenAPI Specification</a></li>
                    <li>• <a href="/README.md" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">README</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                © 2024 MRM360. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

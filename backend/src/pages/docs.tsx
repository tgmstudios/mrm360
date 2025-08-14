import { useEffect, useState } from 'react';
import Head from 'next/head';

// TypeScript declarations for global Swagger objects
declare global {
  interface Window {
    SwaggerUIBundle: any;
  }
}

export default function DocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the OpenAPI specification
    console.log('Fetching API spec from /api/docs...');
    fetch('/api/docs')
      .then(res => {
        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(spec => {
        console.log('Received spec:', spec);
        setSwaggerSpec(spec);
      })
      .catch(err => {
        console.error('Failed to load API spec:', err);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (swaggerSpec && typeof window !== 'undefined') {
      // Load Swagger UI CSS dynamically
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
      document.head.appendChild(link);

      // Load Swagger UI JS dynamically
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js';
      script.onload = () => {
        // Initialize Swagger UI
        if (window.SwaggerUIBundle) {
          console.log('Initializing Swagger UI...');
          const ui = window.SwaggerUIBundle({
            spec: swaggerSpec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis
            ],
            plugins: [
              window.SwaggerUIBundle.plugins.DownloadUrl
            ]
          });
          console.log('Swagger UI initialized:', ui);
        }
      };
      document.head.appendChild(script);

      // Cleanup function
      return () => {
        if (link.parentNode) link.parentNode.removeChild(link);
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [swaggerSpec]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error Loading API Documentation</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!swaggerSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>MRM360 API Documentation</title>
        <meta name="description" content="API documentation for MRM360 backend services" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MRM360 API Documentation</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Interactive API documentation and testing interface
                </p>
              </div>
              <div className="flex space-x-3">
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Raw OpenAPI Spec
                </a>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to App
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div id="swagger-ui" className="swagger-ui"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Our Store
          </h1>
          <p className="text-lg text-gray-600">
            Experience the power of TailwindCSS v4 in this modern e-commerce
            application
          </p>
        </header>

        {/* Test basic TailwindCSS v4 features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card with standard buttons */}
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
            <h3 className="font-semibold text-xl mb-3">Standard Buttons</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Primary Button
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors border">
                Secondary Button
              </button>
              <button className="w-full px-4 py-2 bg-transparent text-blue-500 rounded-md hover:bg-blue-50 transition-colors border border-blue-500">
                Outline Button
              </button>
              <button className="w-full px-4 py-2 bg-transparent text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                Ghost Button
              </button>
            </div>
          </div>

          {/* Card with colors */}
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
            <h3 className="font-semibold text-xl mb-3">Colors</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-500 text-white rounded">
                Primary Background
              </div>
              <div className="p-3 bg-gray-100 text-gray-900 rounded">
                Secondary Background
              </div>
              <div className="p-3 bg-red-500/50 text-red-900 rounded">
                Error with Opacity
              </div>
              <div className="p-3 bg-green-500 text-white rounded">
                Success Background
              </div>
            </div>
          </div>

          {/* Card with shadows */}
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
            <h3 className="font-semibold text-xl mb-3">Shadows</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded shadow-sm">Small Shadow</div>
              <div className="p-4 bg-white rounded shadow-md">
                Medium Shadow
              </div>
              <div className="p-4 bg-white rounded shadow-lg">Large Shadow</div>
              <div className="p-4 bg-white/20 backdrop-blur-md border border-white/20 rounded">
                Glass Effect
              </div>
            </div>
          </div>
        </div>

        {/* Test form and badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
            <h3 className="font-semibold text-xl mb-4">Form Elements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Your message"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Submit
              </button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
            <h3 className="font-semibold text-xl mb-4">Badges & Status</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-2.5 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                Primary
              </span>
              <span className="px-2.5 py-0.5 bg-gray-500 text-white text-xs font-semibold rounded-full">
                Secondary
              </span>
              <span className="px-2.5 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                Success
              </span>
              <span className="px-2.5 py-0.5 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                Warning
              </span>
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                Error
              </span>
            </div>

            {/* Loading skeleton example */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </div>
        </div>

        {/* Navigation example */}
        <nav className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap gap-6 justify-center">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
            >
              Home
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
            >
              Products
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
            >
              Contact
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}

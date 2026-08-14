import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          KAVACH
        </h1>
        <p className="text-xl text-gray-600">
          Zero-Knowledge Evidence & Legal Compliance Engine
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/student/submit" className="group block h-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              Report an Incident &rarr;
            </h2>
            <p className="text-gray-600 flex-grow">
              Securely compile your digital evidence (WhatsApp, Screenshots). 
              Your data is encrypted directly in your browser. Our servers cannot read it.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600">
              Access Student Portal
            </div>
          </div>
        </Link>

        <Link href="/admin/dashboard" className="group block h-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:red-500 transition-all duration-300 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
              ICC / HR Admin Portal &rarr;
            </h2>
            <p className="text-gray-600 flex-grow">
              Access the secure dashboard to decrypt submitted evidence vaults using 
              the strictly provided 16-character offline keys.
            </p>
            <div className="mt-6 inline-flex items-center text-sm font-semibold text-red-600">
              Access Admin Dashboard
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-16 text-sm text-gray-400 font-mono">
        System Status: <span className="text-green-500">Secure Context Active (AES-256-GCM)</span>
      </div>
    </div>
  );
}

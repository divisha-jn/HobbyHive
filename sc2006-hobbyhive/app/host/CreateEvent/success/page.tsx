export default function EventSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#A8F0EB]">
      <div className="bg-white shadow-xl rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-teal-600 mb-4">🎉 Event Created!</h1>
        <p className="text-gray-700 mb-6">Your event was successfully created.</p>
        <a
          href="/MyEvents"
          className="inline-block bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition"
        >
          Go to My Events
        </a>
      </div>
    </div>
  );
}


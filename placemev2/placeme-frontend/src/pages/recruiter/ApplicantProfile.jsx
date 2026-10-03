export default function ApplicantProfile() {
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border shadow-sm p-8">

        <div className="flex items-center gap-6">

          <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-3xl font-bold">
            J
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              John Doe
            </h1>

            <p className="text-slate-500">
              Computer Science Engineering
            </p>
          </div>

        </div>

      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-8">

        <h2 className="text-xl font-semibold mb-4">
          Academic Details
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p className="text-slate-500">CGPA</p>
            <p className="font-medium">8.7</p>
          </div>

          <div>
            <p className="text-slate-500">Branch</p>
            <p className="font-medium">CSE</p>
          </div>

        </div>

      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-8">

        <h2 className="text-xl font-semibold mb-4">
          Skills
        </h2>

        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-600">
            React
          </span>

          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-600">
            Django
          </span>

          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-600">
            Python
          </span>
        </div>

      </div>

    </div>
  )
}
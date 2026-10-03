import { useEffect, useState } from 'react'
import { tpoApi } from '../../services/tpoApi'

const TpoEnrollments = () => {
	const [enrollments, setEnrollments] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchEnrollments()
	}, [])

	const fetchEnrollments = async () => {
		try {
			const res = await tpoApi.getEnrollments()
			setEnrollments(res.data.results || res.data || [])
		} catch (err) {
			console.log(err)
			alert('Failed to load enrollments')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Enrollments</h1>
				<p className="text-slate-500">Course enrollments</p>
			</div>

			<div className="bg-white rounded-2xl border overflow-hidden">
				<table className="w-full">
					<thead className="bg-slate-100">
						<tr>
							<th className="p-4 text-left">Student</th>
							<th className="p-4 text-left">Course</th>
							<th className="p-4 text-left">Progress</th>
						</tr>
					</thead>

					<tbody>
						{loading ? (
							<tr>
								<td className="p-6 text-center" colSpan="3">
									Loading...
								</td>
							</tr>
						) : (
							enrollments.map((en) => (
								<tr key={en.id} className="border-t">
									<td className="p-4">{en.student_name || en.student?.name}</td>
									<td className="p-4">{en.course?.title || en.course_title}</td>
									<td className="p-4">{en.progress_percentage || en.progress || '—'}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default TpoEnrollments

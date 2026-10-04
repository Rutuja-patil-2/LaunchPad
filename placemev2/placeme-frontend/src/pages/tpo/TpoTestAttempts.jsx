import { useEffect, useState } from 'react'
import { tpoapi } from '../../services/tpoapi'

const TpoTestAttempts = () => {
	const [attempts, setAttempts] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchAttempts()
	}, [])

	const fetchAttempts = async () => {
		try {
			const res = await tpoapi.getAttempts()
			setAttempts(res.data.results || res.data || [])
		} catch (err) {
			console.log(err)
			alert('Failed to load attempts')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Test Attempts</h1>
				<p className="text-slate-500">Review student-reported scores and server-evaluated results</p>
			</div>

			<div className="bg-white rounded-2xl border overflow-hidden">
				<table className="w-full">
					<thead className="bg-slate-100">
						<tr>
							<th className="p-4 text-left">Student</th>
							<th className="p-4 text-left">Test</th>
							<th className="p-4 text-left">Reported score</th>
							<th className="p-4 text-left">Evaluation</th>
						</tr>
					</thead>

					<tbody>
						{loading ? (
							<tr>
								<td className="p-6 text-center" colSpan="4">
									Loading...
								</td>
							</tr>
						) : (
							attempts.map((a) => (
								<tr key={a.id} className="border-t">
									<td className="p-4">{a.student_name || a.student?.name}</td>
									<td className="p-4">{a.test?.title || a.test_title}</td>
									<td className="p-4">
										{a.score}/{a.max_score} ({a.percentage}%)
									</td>
									<td className="p-4">
										<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
											a.is_passed
											? 'bg-emerald-100 text-emerald-700'
											: 'bg-red-100 text-red-700'
										}`}>
											{a.is_passed ? 'Passed' : 'Not passed'}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default TpoTestAttempts

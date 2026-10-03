import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoApi } from '../../services/tpoApi'
import * as Icons from 'lucide-react'

const EditMockTest = () => {
	const navigate = useNavigate()
	const { id } = useParams()

	const [loading, setLoading] = useState(true)
	const [formData, setFormData] = useState({
		course: '',
		title: '',
		description: '',
		difficulty: 'medium',
		total_questions: 10,
		duration_minutes: 60,
		passing_percentage: 50,
		test_url: '',
		is_active: true,
	})

	useEffect(() => {
		if (id) fetchTest()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	const fetchTest = async () => {
		try {
			const res = await tpoApi.getMockTest(id)
			setFormData(res.data)
		} catch (err) {
			console.log('Failed to load mock test', err)
			alert('Failed to load mock test')
		} finally {
			setLoading(false)
		}
	}

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await tpoApi.updateMockTest(id, formData)
			navigate('/tpo/mock-tests')
		} catch (err) {
			console.log(err)
			alert('Failed to update mock test')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Edit Mock Test</h1>
				<p className="text-slate-500">Update test details</p>
			</div>

			{loading ? (
				<p>Loading...</p>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="text-sm font-medium">Title</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							className="w-full border p-3 rounded-lg"
							required
						/>
					</div>

					<div>
						<label className="text-sm font-medium">Description</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							className="w-full border p-3 rounded-lg"
						/>
					</div>

					<div>
						<label className="text-sm font-medium">Test URL</label>
						<input
							type="url"
							name="test_url"
							value={formData.test_url || ''}
							onChange={handleChange}
							className="w-full border p-3 rounded-lg"
							placeholder="https://example.com/test"
							required
						/>
						<p className="mt-1 text-xs text-slate-500">
							Students will open this link to take the assessment.
						</p>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<label>Total Questions</label>
							<input
								type="number"
								name="total_questions"
								value={formData.total_questions}
								onChange={handleChange}
								className="w-full border p-3 rounded-lg"
							/>
						</div>

						<div>
							<label>Duration (min)</label>
							<input
								type="number"
								name="duration_minutes"
								value={formData.duration_minutes}
								onChange={handleChange}
								className="w-full border p-3 rounded-lg"
							/>
						</div>

						<div>
							<label>Passing %</label>
							<input
								type="number"
								name="passing_percentage"
								value={formData.passing_percentage}
								onChange={handleChange}
								className="w-full border p-3 rounded-lg"
							/>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							name="is_active"
							checked={formData.is_active}
							onChange={handleChange}
						/>
						<label>Active</label>
					</div>

					<div className="flex gap-3">
						<button
							type="submit"
							className="bg-brand-600 text-white px-5 py-3 rounded-lg flex items-center gap-2"
						>
							<Icons.Check size={16} /> Update Test
						</button>

						<button
							type="button"
							onClick={() => navigate('/tpo/mock-tests')}
							className="border px-5 py-3 rounded-lg"
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	)
}

export default EditMockTest

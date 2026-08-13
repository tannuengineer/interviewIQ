import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App'
import { FaArrowLeft } from 'react-icons/fa'

function InterviewHistory() {

    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {

        const getInterviews = async () => {
            try {

                const result = await axios.get(
                    ServerUrl + "/api/interview/get-interview",
                    { withCredentials: true }
                )

                console.log(result.data)
                setInterviews(result.data)

            } catch (error) {
                console.log(error)
            }
        }

        getInterviews()

    }, [])

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10'>

            <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>

                {/* Header */}
                <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>

                    <button
                        onClick={() => navigate("/")}
                        className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'
                    >
                        <FaArrowLeft />
                    </button>

                    <div>

                        <h1 className='text-3xl font-bold text-gray-800'>
                            Interview History
                        </h1>

                        <p className='text-gray-500 mt-2'>
                            Track your past interviews and performance reports
                        </p>

                    </div>

                </div>

                {/* Interviews */}
                {interviews.length === 0 ? (

                    <div className='bg-white p-10 rounded-2xl shadow text-center'>

                        <p className='text-gray-500'>
                            No interviews found. Start your first Interview.
                        </p>

                    </div>

                ) : (

                    <div className='grid gap-6'>

                        {/* Interview cards */}
                        {interviews.map((item, index) => (

                            <div
                                key={index}
                                onClick={()=>navigate(`/report/${item._id}`)}
                                className='bg-white p-6 rounded-2xl shadow-md
                                hover:shadow-xl transition-all duration-300
                                cursor-pointer border border-gray-100'
                            >

                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>

                                    <div>

                                        <h3 className='text-lg font-semibold text-gray-800'>
                                            {item.role}
                                        </h3>

                                        <p className='text-gray-500 text-sm mt-1'>
                                            {item.experience} • {item.mode}
                                        </p>

                                        <p className='text-xs text-gray-400 mt-2'>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>

                                    </div>

                                    <div className='flex items-center gap-6'>

                                        {/* Score */}
                                        <div className="text-right">

                                            <p className='text-xl font-bold text-emerald-600'>
                                                {item.finalScore || 0}/10
                                            </p>

                                            <p className='text-xs text-gray-400'>
                                                Overall Score
                                            </p>

                                        </div>

                                        {/* Status badge */}
                                        <span
                                            className={`px-4 py-1 rounded-full text-xs font-medium ${
                                                item.status === "completed"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {item.status}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    )
}

export default InterviewHistory
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import {
    FaArrowLeft,
    FaChartLine,
    FaTrophy,
    FaClipboardCheck,
    FaCalendarAlt,
    FaBriefcase,
    FaChevronDown,
    FaChevronUp,
    FaCheckCircle,
} from "react-icons/fa";

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openInterview, setOpenInterview] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const getInterviews = async () => {
            try {
                setLoading(true);

                const result = await axios.get(
                    ServerUrl + "/api/interview/get-interview",
                    {
                        withCredentials: true,
                    }
                );

                console.log("Interview History:", result.data);

                const data = Array.isArray(result.data)
                    ? result.data
                    : result.data?.interviews || [];

                setInterviews(data);
            } catch (error) {
                console.log("Interview History Error:", error);
            } finally {
                setLoading(false);
            }
        };

        getInterviews();
    }, []);

    // ==============================
    // ANALYTICS
    // ==============================

    const analytics = useMemo(() => {
        const scores = interviews.map(
            (item) => Number(item.finalScore) || 0
        );

        const total = interviews.length;

        const completed = interviews.filter(
            (item) => item.status === "completed"
        ).length;

        const average =
            scores.length > 0
                ? scores.reduce((sum, score) => sum + score, 0) /
                  scores.length
                : 0;

        const best =
            scores.length > 0 ? Math.max(...scores) : 0;

        return {
            total,
            completed,
            average,
            best,
        };
    }, [interviews]);

    // ==============================
    // GRAPH DATA
    // ==============================

    const graphData = useMemo(() => {
        return interviews
            .slice()
            .reverse()
            .map((item, index) => ({
                score: Number(item.finalScore) || 0,
                label: `#${index + 1}`,
            }));
    }, [interviews]);

    const graphWidth = 800;
    const graphHeight = 280;

    const graphPoints = graphData.map((item, index) => {
        const x =
            graphData.length === 1
                ? graphWidth / 2
                : 40 +
                  (index / (graphData.length - 1)) *
                      (graphWidth - 80);

        const y =
            graphHeight -
            30 -
            (item.score / 10) *
                (graphHeight - 60);

        return {
            ...item,
            x,
            y,
        };
    });

    const linePath = graphPoints
        .map((point, index) => {
            return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
        })
        .join(" ");

    // ==============================
    // HELPERS
    // ==============================

    const getScoreColor = (score) => {
        if (score >= 8) return "text-emerald-600";
        if (score >= 6) return "text-blue-600";
        if (score >= 4) return "text-yellow-600";
        return "text-red-500";
    };

    const getScoreBadge = (score) => {
        if (score >= 8)
            return "bg-emerald-100 text-emerald-700";

        if (score >= 6)
            return "bg-blue-100 text-blue-700";

        if (score >= 4)
            return "bg-yellow-100 text-yellow-700";

        return "bg-red-100 text-red-700";
    };

    // ==============================
    // GET QUESTIONS
    // ==============================

    const getQuestions = (item) => {
        if (Array.isArray(item.questions)) {
            return item.questions;
        }

        if (Array.isArray(item.interviewQuestions)) {
            return item.interviewQuestions;
        }

        if (Array.isArray(item.questionAnswers)) {
            return item.questionAnswers;
        }

        return [];
    };

    // ==============================
    // GET ANSWER
    // ==============================

    const getAnswer = (item, question, index) => {
        // If question object already contains answer
        if (typeof question === "object") {
            return (
                question.answer ||
                question.userAnswer ||
                question.response ||
                "No answer recorded"
            );
        }

        // Separate answers array
        if (Array.isArray(item.answers)) {
            return item.answers[index] || "No answer recorded";
        }

        if (Array.isArray(item.userAnswers)) {
            return (
                item.userAnswers[index] ||
                "No answer recorded"
            );
        }

        return "No answer recorded";
    };

    // ==============================
    // GET QUESTION TEXT
    // ==============================

    const getQuestionText = (question) => {
        if (typeof question === "string") {
            return question;
        }

        return (
            question?.question ||
            question?.text ||
            question?.questionText ||
            "Question unavailable"
        );
    };

    // ==============================
    // QUESTION SCORE
    // ==============================

    const getQuestionScore = (question) => {
        if (typeof question === "object") {
            return (
                question.score ??
                question.rating ??
                question.marks ??
                null
            );
        }

        return null;
    };

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-gray-500">
                        Loading your interview history...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-10 px-4">

            <div className="w-full max-w-6xl mx-auto">

                {/* ================= HEADER ================= */}

                <div className="flex items-start gap-4 mb-10">

                    <button
                        onClick={() => navigate("/")}
                        className="mt-1 p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:-translate-x-1 transition-all"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>

                    <div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                            Interview Analytics
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Track your performance, questions and
                            answers from previous interviews.
                        </p>

                    </div>

                </div>


                {/* ================= STATS ================= */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    {/* Total */}

                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">

                        <div className="p-3 w-fit rounded-xl bg-blue-50">
                            <FaClipboardCheck className="text-blue-600 text-xl" />
                        </div>

                        <p className="text-3xl font-bold text-gray-800 mt-4">
                            {analytics.total}
                        </p>

                        <p className="text-sm text-gray-500">
                            Total Interviews
                        </p>

                    </div>


                    {/* Average */}

                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">

                        <div className="p-3 w-fit rounded-xl bg-emerald-50">
                            <FaChartLine className="text-emerald-600 text-xl" />
                        </div>

                        <p className="text-3xl font-bold text-emerald-600 mt-4">
                            {analytics.average.toFixed(1)}
                            <span className="text-lg text-gray-400">
                                /10
                            </span>
                        </p>

                        <p className="text-sm text-gray-500">
                            Average Score
                        </p>

                    </div>


                    {/* Best */}

                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">

                        <div className="p-3 w-fit rounded-xl bg-yellow-50">
                            <FaTrophy className="text-yellow-500 text-xl" />
                        </div>

                        <p className="text-3xl font-bold text-yellow-600 mt-4">
                            {analytics.best}
                            <span className="text-lg text-gray-400">
                                /10
                            </span>
                        </p>

                        <p className="text-sm text-gray-500">
                            Best Score
                        </p>

                    </div>


                    {/* Completed */}

                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">

                        <div className="p-3 w-fit rounded-xl bg-purple-50">
                            <FaCheckCircle className="text-purple-600 text-xl" />
                        </div>

                        <p className="text-3xl font-bold text-purple-600 mt-4">
                            {analytics.completed}
                        </p>

                        <p className="text-sm text-gray-500">
                            Completed
                        </p>

                    </div>

                </div>


                {/* ================= GRAPH ================= */}

                {interviews.length > 0 && (

                    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5 md:p-8 mb-10">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="p-3 rounded-xl bg-emerald-50">
                                <FaChartLine className="text-emerald-600" />
                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">
                                    Performance Trend
                                </h2>

                                <p className="text-sm text-gray-500">
                                    See how your interview score is improving
                                </p>

                            </div>

                        </div>


                        <div className="w-full overflow-x-auto">

                            <svg
                                viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                                className="w-full min-w-[600px] h-[280px]"
                            >

                                {/* Grid */}

                                {[0, 2, 4, 6, 8, 10].map(
                                    (value) => {

                                        const y =
                                            graphHeight -
                                            30 -
                                            (value / 10) *
                                                (graphHeight - 60);

                                        return (
                                            <g key={value}>

                                                <line
                                                    x1="40"
                                                    y1={y}
                                                    x2="780"
                                                    y2={y}
                                                    stroke="#e5e7eb"
                                                    strokeDasharray="5 5"
                                                />

                                                <text
                                                    x="8"
                                                    y={y + 4}
                                                    fontSize="12"
                                                    fill="#9ca3af"
                                                >
                                                    {value}
                                                </text>

                                            </g>
                                        );
                                    }
                                )}


                                {/* Line */}

                                {graphPoints.length > 1 && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}


                                {/* Points */}

                                {graphPoints.map(
                                    (point, index) => (

                                        <g key={index}>

                                            <circle
                                                cx={point.x}
                                                cy={point.y}
                                                r="7"
                                                fill="white"
                                                stroke="#10b981"
                                                strokeWidth="4"
                                            />

                                            <text
                                                x={point.x}
                                                y={point.y - 15}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontWeight="600"
                                                fill="#374151"
                                            >
                                                {point.score}
                                            </text>

                                            <text
                                                x={point.x}
                                                y={graphHeight - 8}
                                                textAnchor="middle"
                                                fontSize="11"
                                                fill="#9ca3af"
                                            >
                                                {point.label}
                                            </text>

                                        </g>

                                    )
                                )}

                            </svg>

                        </div>

                    </div>
                )}


                {/* ================= HISTORY ================= */}

                <div className="mb-5">

                    <h2 className="text-2xl font-bold text-gray-800">
                        Previous Interviews
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        Click an interview to see the questions and
                        answers.
                    </p>

                </div>


                {/* ================= EMPTY ================= */}

                {interviews.length === 0 ? (

                    <div className="bg-white p-12 rounded-3xl shadow-md border border-gray-100 text-center">

                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">

                            <FaClipboardCheck className="text-emerald-600 text-2xl" />

                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mt-5">
                            No interviews yet
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Start your first AI interview and
                            your history will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                        >
                            Start Interview
                        </button>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {interviews.map((item, index) => {

                            const score =
                                Number(item.finalScore) || 0;

                            const questions =
                                getQuestions(item);

                            const isOpen =
                                openInterview === item._id;

                            return (

                                <div
                                    key={item._id || index}
                                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                                >

                                    {/* ================= CARD HEADER ================= */}

                                    <div
                                        onClick={() =>
                                            setOpenInterview(
                                                isOpen
                                                    ? null
                                                    : item._id
                                            )
                                        }
                                        className="p-5 md:p-6 cursor-pointer hover:bg-gray-50 transition"
                                    >

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                            {/* Left */}

                                            <div className="flex items-start gap-4">

                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">

                                                    <FaBriefcase className="text-emerald-600" />

                                                </div>

                                                <div>

                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {item.role ||
                                                            "Interview"}
                                                    </h3>

                                                    <p className="text-gray-500 text-sm mt-1">
                                                        {item.experience ||
                                                            "Experience"}{" "}
                                                        •{" "}
                                                        {item.mode ||
                                                            "AI Interview"}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">

                                                        <FaCalendarAlt />

                                                        {item.createdAt
                                                            ? new Date(
                                                                  item.createdAt
                                                              ).toLocaleDateString(
                                                                  "en-IN",
                                                                  {
                                                                      day: "numeric",
                                                                      month: "short",
                                                                      year: "numeric",
                                                                  }
                                                              )
                                                            : "Date unavailable"}

                                                    </div>

                                                </div>

                                            </div>


                                            {/* Right */}

                                            <div className="flex items-center justify-between lg:justify-end gap-6">

                                                <div className="text-right">

                                                    <p
                                                        className={`text-2xl font-bold ${getScoreColor(
                                                            score
                                                        )}`}
                                                    >
                                                        {score}
                                                        <span className="text-sm text-gray-400">
                                                            /10
                                                        </span>
                                                    </p>

                                                    <p className="text-xs text-gray-400">
                                                        Overall Score
                                                    </p>

                                                </div>


                                                <span
                                                    className={`px-4 py-2 rounded-full text-xs font-semibold ${getScoreBadge(
                                                        score
                                                    )}`}
                                                >
                                                    {item.status ||
                                                        "completed"}
                                                </span>


                                                <div className="text-gray-400">

                                                    {isOpen ? (
                                                        <FaChevronUp />
                                                    ) : (
                                                        <FaChevronDown />
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* ================= QUESTIONS & ANSWERS ================= */}

                                    {isOpen && (

                                        <div className="border-t border-gray-100 bg-gray-50 p-5 md:p-7">

                                            <div className="flex items-center justify-between mb-6">

                                                <div>

                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        Interview Questions
                                                    </h3>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Questions asked by AI
                                                        and your responses
                                                    </p>

                                                </div>

                                                <span className="px-3 py-1 rounded-full bg-white border text-xs text-gray-500">
                                                    {questions.length}{" "}
                                                    Questions
                                                </span>

                                            </div>


                                            {questions.length === 0 ? (

                                                <div className="bg-white rounded-xl p-6 text-center">

                                                    <p className="text-gray-500 text-sm">
                                                        Questions and answers
                                                        are not available for
                                                        this interview.
                                                    </p>

                                                </div>

                                            ) : (

                                                <div className="space-y-5">

                                                    {questions.map(
                                                        (
                                                            question,
                                                            qIndex
                                                        ) => {

                                                            const questionText =
                                                                getQuestionText(
                                                                    question
                                                                );

                                                            const answer =
                                                                getAnswer(
                                                                    item,
                                                                    question,
                                                                    qIndex
                                                                );

                                                            const qScore =
                                                                getQuestionScore(
                                                                    question
                                                                );

                                                            return (

                                                                <div
                                                                    key={
                                                                        qIndex
                                                                    }
                                                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                                                                >

                                                                    {/* Question */}

                                                                    <div className="p-5">

                                                                        <div className="flex items-start justify-between gap-4">

                                                                            <div className="flex gap-3">

                                                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                                                    Q
                                                                                    {qIndex +
                                                                                        1}
                                                                                </div>

                                                                                <div>

                                                                                    <p className="font-semibold text-gray-800 leading-relaxed">
                                                                                        {questionText}
                                                                                    </p>

                                                                                </div>

                                                                            </div>


                                                                            {qScore !==
                                                                                null && (
                                                                                <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                                                                    {
                                                                                        qScore
                                                                                    }
                                                                                    /10
                                                                                </span>
                                                                            )}

                                                                        </div>


                                                                        {/* Answer */}

                                                                        <div className="mt-5 ml-11">

                                                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                                                                Your
                                                                                Answer
                                                                            </p>

                                                                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">

                                                                                <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                                                                                    {answer}
                                                                                </p>

                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            );
                                                        }
                                                    )}

                                                </div>

                                            )}


                                            {/* Report Button */}

                                            <div className="mt-6 flex justify-end">

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/report/${item._id}`
                                                        )
                                                    }
                                                    className="px-5 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
                                                >
                                                    View Full Report
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            );
                        })}

                    </div>

                )}

            </div>

        </div>
    );
}

export default InterviewHistory;
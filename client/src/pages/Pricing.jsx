import React, { useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ServerUrl } from "../App";

function Pricing() {
    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState("free");
    const [loadingPlan, setLoadingPlan] = useState(null);

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "0",
            credits: 100,
            description:
                "Perfect for beginners starting interview preparation.",
            features: [
                "100 AI Interview Credits",
                "Basic Performance Report",
                "Voice Interview Access",
                "Limited History Tracking",
            ],
            default: true,
        },
        {
            id: "basic",
            name: "Starter Pack",
            price: "100",
            credits: 150,
            description:
                "Great for focused practice and skill improvement.",
            features: [
                "150 AI Interview Credits",
                "Detailed Feedback",
                "Performance Analytics",
                "Full Interview History",
            ],
        },
        {
            id: "pro",
            name: "Pro Pack",
            price: "500",
            credits: 650,
            description:
                "Best value for serious job preparation.",
            features: [
                "650 AI Interview Credits",
                "Advanced AI Feedback",
                "Skill Trend Analysis",
                "Priority AI Processing",
            ],
            badge: "Best Value",
        },
    ];

    const handlePayment = async (plan) => {
        try {
            setLoadingPlan(plan.id);

            const amount =
                plan.id === "basic"
                    ? 100
                    : plan.id === "pro"
                    ? 500
                    : 0;

            // Create Razorpay order
            const result = await axios.post(
                ServerUrl + "/api/payment/order",
                {
                    planId: plan.id,
                    amount: amount,
                    credits: plan.credits,
                },
                {
                    withCredentials: true,
                }
            );

            console.log("Order Created:", result.data);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,

                amount: result.data.amount,

                currency: "INR",

                name: "InterviewIQ.AI",

                description: `${plan.name} - ${plan.credits} Credits`,

                order_id: result.data.id,

                handler: async function (response) {
                    console.log("Payment Successful:", response);

                    // Payment verification
                    try {
                        const verifyResult = await axios.post(
                            ServerUrl + "/api/payment/verify",
                            {
                                razorpay_order_id:
                                    response.razorpay_order_id,

                                razorpay_payment_id:
                                    response.razorpay_payment_id,

                                razorpay_signature:
                                    response.razorpay_signature,

                                planId: plan.id,

                                credits: plan.credits,
                            },
                            {
                                withCredentials: true,
                            }
                        );

                        console.log(
                            "Payment Verified:",
                            verifyResult.data
                        );

                        alert(
                            `${plan.credits} credits added successfully!`
                        );

                        navigate("/");

                    } catch (error) {
                        console.log(
                            "Payment Verification Error:",
                            error
                        );

                        alert(
                            "Payment successful, but verification failed."
                        );
                    }
                },

                modal: {
                    ondismiss: function () {
                        console.log("Payment popup closed");
                        setLoadingPlan(null);
                    },
                },

                theme: {
                    color: "#10b981",
                },
            };

            // Check Razorpay
            if (!window.Razorpay) {
                alert(
                    "Razorpay is not loaded. Please refresh the page."
                );
                setLoadingPlan(null);
                return;
            }

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                console.log(
                    "Payment Failed:",
                    response.error
                );

                alert(
                    response.error?.description ||
                        "Payment failed. Please try again."
                );

                setLoadingPlan(null);
            });

            rzp.open();

        } catch (error) {
            console.log("Payment Error:", error);

            if (error.response) {
                console.log(
                    "Server Response:",
                    error.response.data
                );

                alert(
                    error.response.data?.message ||
                        "Something went wrong while creating payment."
                );
            } else {
                alert(
                    "Unable to connect to server. Please try again."
                );
            }

            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6">

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">

                <button
                    onClick={() => navigate("/")}
                    className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
                >
                    <FaArrowLeft className="text-gray-600" />
                </button>

                <div className="text-center w-full">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Choose Your Plan
                    </h1>

                    <p className="text-gray-500 mt-3 text-lg">
                        Flexible pricing to match your interview
                        preparation goals.
                    </p>

                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {plans.map((plan) => {

                    const isSelected =
                        selectedPlan === plan.id;

                    return (
                        <motion.div
                            key={plan.id}

                            whileHover={
                                !plan.default
                                    ? { scale: 1.05 }
                                    : {}
                            }

                            onClick={() => {
                                if (!plan.default) {
                                    setSelectedPlan(plan.id);
                                }
                            }}

                            className={`relative rounded-3xl p-8 transition-all duration-300 border
                                ${
                                    isSelected
                                        ? "border-emerald-600 shadow-2xl bg-white"
                                        : "border-gray-200 bg-white shadow-md"
                                }
                                ${
                                    plan.default
                                        ? "cursor-default"
                                        : "cursor-pointer"
                                }
                            `}
                        >

                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                                    {plan.badge}
                                </div>
                            )}

                            {/* Default Tag */}
                            {plan.default && (
                                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                                    Default
                                </div>
                            )}

                            {/* Plan Name */}
                            <h3 className="text-xl font-semibold text-gray-800">
                                {plan.name}
                            </h3>

                            {/* Price */}
                            <div className="mt-4">

                                <span className="text-3xl font-bold text-emerald-600">
                                    ₹{plan.price}
                                </span>

                                <p className="text-gray-500 mt-1">
                                    {plan.credits} Credits
                                </p>

                            </div>

                            {/* Description */}
                            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                                {plan.description}
                            </p>

                            {/* Features */}
                            <div className="mt-6 space-y-3 text-left">

                                {plan.features.map(
                                    (feature, i) => (

                                        <div
                                            key={i}
                                            className="flex items-center gap-3"
                                        >

                                            <FaCheckCircle className="text-emerald-500 text-sm" />

                                            <span className="text-gray-700 text-sm">
                                                {feature}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>

                            {/* Select / Payment Button */}
                            {!plan.default && (
                                <button
                                    disabled={
                                        loadingPlan !== null
                                    }

                                    onClick={(e) => {
                                        e.stopPropagation();

                                        if (!isSelected) {
                                            setSelectedPlan(
                                                plan.id
                                            );
                                        } else {
                                            handlePayment(plan);
                                        }
                                    }}

                                    className={`w-full mt-8 py-3 rounded-xl font-semibold transition
                                        ${
                                            isSelected
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                                        }
                                    `}
                                >
                                    {loadingPlan === plan.id
                                        ? "Processing..."
                                        : isSelected
                                        ? "Proceed to Pay"
                                        : "Select Plan"}
                                </button>
                            )}

                        </motion.div>
                    );
                })}

            </div>
        </div>
    );
}

export default Pricing;
import React from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaCheckCircle,
  FaTrophy,
  FaBullseye,
  FaComments,
  FaBrain,
  FaStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  buildStyles,
  CircularProgressbar,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Step3Report({ report }) {
  const navigate = useNavigate();

  // -----------------------------
  // LOADING
  // -----------------------------

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 font-semibold">
            Generating your interview report...
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // DATA
  // -----------------------------

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const score = Number(finalScore) || 0;

  const percentage = Math.min(
    Math.max((score / 10) * 100, 0),
    100
  );

  // -----------------------------
  // PERFORMANCE
  // -----------------------------

  let performanceText = "";
  let shortTagline = "";

  if (score >= 8) {
    performanceText = "Excellent Performance";
    shortTagline =
      "You're showing strong interview readiness.";
  } else if (score >= 5) {
    performanceText = "Good Performance";
    shortTagline =
      "You have a good foundation with room to improve.";
  } else {
    performanceText = "Keep Improving";
    shortTagline =
      "Focus on confidence, clarity and technical depth.";
  }

  // -----------------------------
  // SKILLS
  // -----------------------------

  const skills = [
    {
      label: "Confidence",
      value: Number(confidence) || 0,
      icon: <FaBrain />,
    },
    {
      label: "Communication",
      value: Number(communication) || 0,
      icon: <FaComments />,
    },
    {
      label: "Correctness",
      value: Number(correctness) || 0,
      icon: <FaBullseye />,
    },
  ];

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

const downloadPDF = async () => {
  const element = document.getElementById("report-content");

  if (!element) {
    alert("Report content not found.");
    return;
  }

  try {
    console.log("📄 Generating PDF...");

    // ==========================================
    // CREATE CLONE
    // ==========================================

    const clone = element.cloneNode(true);

    // PDF clone ko screen ke bahar rakhenge
    clone.style.position = "absolute";
    clone.style.left = "-99999px";
    clone.style.top = "0";
    clone.style.width = `${element.offsetWidth}px`;
    clone.style.background = "#ffffff";

    document.body.appendChild(clone);

    // ==========================================
    // REMOVE DOWNLOAD BUTTON FROM PDF
    // ==========================================

    const cloneButton =
      clone.querySelector("#download-button");

    if (cloneButton) {
      cloneButton.remove();
    }

    // ==========================================
    // REMOVE ALL STYLE TAGS
    // ==========================================

    clone.querySelectorAll("style").forEach((style) => {
      style.remove();
    });

    // ==========================================
    // REMOVE TAILWIND GENERATED PROBLEMATIC
    // COLOR VALUES
    // ==========================================

    const elements = clone.querySelectorAll("*");

    elements.forEach((el) => {
      // Reset problematic styles
      el.style.setProperty(
        "color",
        "#111827",
        "important"
      );

      el.style.setProperty(
        "background-image",
        "none",
        "important"
      );

      el.style.setProperty(
        "box-shadow",
        "none",
        "important"
      );

      // Background
      const tag = el.tagName.toLowerCase();

      if (
        tag === "div" ||
        tag === "section" ||
        tag === "article"
      ) {
        el.style.setProperty(
          "background-color",
          "#ffffff",
          "important"
        );
      }

      // Borders
      el.style.setProperty(
        "border-color",
        "#e5e7eb",
        "important"
      );
    });

    // ==========================================
    // SPECIAL COLORS
    // ==========================================

    // Emerald text
    clone
      .querySelectorAll(
        ".text-emerald-600, .text-emerald-700"
      )
      .forEach((el) => {
        el.style.setProperty(
          "color",
          "#059669",
          "important"
        );
      });

    // Emerald backgrounds
    clone
      .querySelectorAll(
        ".bg-emerald-50, .bg-emerald-100"
      )
      .forEach((el) => {
        el.style.setProperty(
          "background-color",
          "#ecfdf5",
          "important"
        );
      });

    // Dark sections
    clone
      .querySelectorAll(".bg-gray-900")
      .forEach((el) => {
        el.style.setProperty(
          "background-color",
          "#111827",
          "important"
        );

        el.style.setProperty(
          "color",
          "#ffffff",
          "important"
        );
      });

    // ==========================================
    // WAIT FOR RENDER
    // ==========================================

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    // ==========================================
    // CONVERT HTML → CANVAS
    // ==========================================

    const canvas = await html2canvas(clone, {
      scale: 2,

      useCORS: true,

      allowTaint: true,

      backgroundColor: "#ffffff",

      logging: false,

      foreignObjectRendering: false,

      imageTimeout: 15000,
    });

    // ==========================================
    // CREATE PDF
    // ==========================================

    const imgData =
      canvas.toDataURL(
        "image/jpeg",
        0.95
      );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 8;

    const usableWidth =
      pageWidth - margin * 2;

    const imgWidth = usableWidth;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    // ==========================================
    // MULTIPLE PAGES
    // ==========================================

    let heightLeft = imgHeight;

    let position = margin;

    pdf.addImage(
      imgData,
      "JPEG",
      margin,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -=
      pageHeight - margin * 2;

    while (heightLeft > 0) {
      position =
        -(imgHeight - heightLeft) +
        margin;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -=
        pageHeight - margin * 2;
    }

    // ==========================================
    // SAVE
    // ==========================================

    pdf.save(
      `InterviewIQ-Report-${score.toFixed(1)}-10.pdf`
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }

    console.log(
      " PDF downloaded successfully! ✅"
    );

  } catch (error) {

    console.error(
      " PDF DOWNLOAD ERROR:",
      error
    );

    // Cleanup
    const clones =
      document.querySelectorAll(
        "#report-content"
      );

    if (clones.length > 1) {
      clones[clones.length - 1].remove();
    }

    alert(
      "PDF download nahi ho payi. Please try again."
    );
  }
};

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 sm:px-6 lg:px-10 py-8">

      {/* =====================================================
          REPORT CONTENT
      ====================================================== */}

      <div
        id="report-content"
        className="max-w-7xl mx-auto bg-white"
      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          <div className="flex items-start gap-4">

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/history")}
              className="mt-1 w-11 h-11 flex items-center
              justify-center rounded-xl bg-white border
              border-gray-200 shadow-sm hover:shadow-md
              hover:bg-gray-50 transition"
            >
              <FaArrowLeft className="text-gray-700" />
            </motion.button>

            <div>

              <div className="flex items-center gap-2">

                <span className="px-3 py-1 rounded-full
                bg-emerald-100 text-emerald-700
                text-xs font-bold">
                  AI ANALYSIS
                </span>

              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl
              font-extrabold text-gray-900 mt-3">
                Interview Analytics
              </h1>

              <p className="text-gray-500 mt-1">
                Your personalized AI-powered performance report
              </p>

            </div>
          </div>

          {/* DOWNLOAD BUTTON */}

          <motion.button
            id="download-button"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={downloadPDF}
            className="flex items-center justify-center gap-3
            px-6 py-3.5 rounded-xl
            bg-gradient-to-r from-emerald-600
            to-teal-500 text-white font-bold
            shadow-lg shadow-emerald-200
            hover:shadow-xl hover:shadow-emerald-200
            transition-all"
          >
            <FaDownload />

            Download Report
          </motion.button>

        </div>

        {/* =====================================================
            HERO SCORE
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem]
          bg-gradient-to-br from-emerald-600
          via-emerald-500 to-teal-500
          p-6 sm:p-10 shadow-2xl shadow-emerald-100
          text-white"
        >

          <div className="absolute -top-24 -right-24
          w-72 h-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-32 -left-20
          w-72 h-72 rounded-full bg-white/10" />

          <div className="relative grid grid-cols-1
          lg:grid-cols-2 gap-10 items-center">

            <div>

              <div className="flex items-center gap-2 mb-4">

                <FaTrophy className="text-yellow-300" />

                <span className="text-sm font-semibold
                text-emerald-50">
                  OVERALL INTERVIEW SCORE
                </span>

              </div>

              <h2 className="text-3xl sm:text-4xl
              font-extrabold">
                {performanceText}
              </h2>

              <p className="mt-3 text-emerald-50
              max-w-lg leading-relaxed">
                {shortTagline}
              </p>

              <div className="mt-7 flex items-center gap-3">

                <div className="px-4 py-2 rounded-xl
                bg-white/15 backdrop-blur-sm">

                  <span className="text-sm text-emerald-50">
                    Final Score
                  </span>

                  <div className="text-2xl font-extrabold">
                    {score.toFixed(1)}

                    <span className="text-lg font-medium">
                      /10
                    </span>
                  </div>

                </div>

                <div className="px-4 py-2 rounded-xl
                bg-white/15 backdrop-blur-sm">

                  <span className="text-sm text-emerald-50">
                    Questions
                  </span>

                  <div className="text-2xl font-extrabold">
                    {questionWiseScore.length}
                  </div>

                </div>

              </div>

            </div>

            {/* SCORE CIRCLE */}

            <div className="flex justify-center lg:justify-end">

              <div className="w-48 h-48 sm:w-56 sm:h-56
              rounded-full bg-white/10 backdrop-blur-sm
              p-4 shadow-inner">

                <CircularProgressbar
                  value={percentage}
                  text={`${score.toFixed(1)}/10`}
                  styles={buildStyles({
                    pathColor: "#ffffff",
                    trailColor:
                      "rgba(255,255,255,0.20)",
                    textColor: "#ffffff",
                    textSize: "17px",
                    pathTransitionDuration: 1.5,
                  })}
                />

              </div>

            </div>

          </div>
        </motion.div>

        {/* =====================================================
            SKILL CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3
        gap-5 mt-7">

          {skills.map((skill, index) => {

            const value = Math.min(
              Math.max(skill.value, 0),
              10
            );

            const percent = (value / 10) * 100;

            return (
              <motion.div
                key={skill.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                className="bg-white rounded-2xl
                border border-gray-100 p-6
                shadow-lg hover:shadow-xl
                transition-shadow"
              >

                <div className="flex items-center
                justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl
                    bg-emerald-50 text-emerald-600
                    flex items-center justify-center">
                      {skill.icon}
                    </div>

                    <div>

                      <h3 className="font-bold text-gray-800">
                        {skill.label}
                      </h3>

                      <p className="text-xs text-gray-400">
                        Score out of 10
                      </p>

                    </div>

                  </div>

                  <span className="text-2xl font-extrabold
                  text-emerald-600">
                    {value.toFixed(1)}
                  </span>

                </div>

                <div className="mt-5">

                  <div className="h-2.5 bg-gray-100
                  rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${percent}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: index * 0.2,
                      }}
                      className="h-full rounded-full
                      bg-gradient-to-r from-emerald-500
                      to-teal-400"
                    />

                  </div>

                </div>

              </motion.div>
            );
          })}

        </div>

        {/* =====================================================
            AI INSIGHT
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-7 rounded-2xl bg-white
          border border-gray-100 shadow-lg p-6"
        >

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 shrink-0
            rounded-xl bg-emerald-100
            text-emerald-600 flex items-center
            justify-center">
              <FaStar />
            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                AI Performance Insight
              </h2>

              <p className="text-gray-500 mt-2 leading-relaxed">

                {shortTagline} Your overall score of{" "}

                <span className="font-bold text-emerald-600">
                  {score.toFixed(1)}/10
                </span>{" "}

                reflects your performance across confidence,
                communication and answer correctness.

              </p>

            </div>

          </div>

        </motion.div>

        {/* =====================================================
            QUESTION PERFORMANCE
        ====================================================== */}

        <div className="mt-8">

          <div className="mb-5">

            <h2 className="text-2xl font-extrabold text-gray-900">
              Question Performance
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Detailed breakdown of your answers
            </p>

          </div>

          <div className="grid grid-cols-1
          sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {questionWiseScore.length > 0 ? (

              questionWiseScore.map((item, index) => {

                const qScore =
                  Number(item?.score) || 0;

                const qPercent = Math.min(
                  Math.max((qScore / 10) * 100, 0),
                  100
                );

                return (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="bg-white rounded-2xl
                    border border-gray-100
                    shadow-md p-5
                    hover:-translate-y-1
                    hover:shadow-lg
                    transition-all"
                  >

                    <div className="flex items-center
                    justify-between">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl
                        bg-gray-900 text-white
                        flex items-center justify-center
                        font-bold text-sm">
                          Q{index + 1}
                        </div>

                        <div>

                          <p className="font-bold text-gray-800">
                            Question {index + 1}
                          </p>

                          <p className="text-xs text-gray-400">
                            Performance
                          </p>

                        </div>

                      </div>

                      <div className="text-right">

                        <div className="text-lg font-extrabold
                        text-emerald-600">

                          {qScore.toFixed(1)}

                          <span className="text-xs text-gray-400">
                            /10
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="mt-5">

                      <div className="flex justify-between
                      text-xs text-gray-400 mb-2">

                        <span>Score</span>

                        <span>
                          {Math.round(qPercent)}%
                        </span>

                      </div>

                      <div className="h-2 bg-gray-100
                      rounded-full overflow-hidden">

                        <div
                          style={{
                            width: `${qPercent}%`,
                          }}
                          className="h-full rounded-full
                          bg-gradient-to-r
                          from-emerald-500
                          to-teal-400"
                        />

                      </div>

                    </div>

                  </motion.div>
                );
              })

            ) : (

              <div className="col-span-full
              rounded-2xl bg-white border
              border-gray-100 p-10 text-center">

                <p className="text-gray-500">
                  Question-wise score data is not available.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* =====================================================
            FINAL RESULT
        ====================================================== */}

        <div className="mt-8 bg-gray-900
        rounded-3xl p-7 sm:p-9 text-white
        shadow-xl">

          <div className="flex flex-col
          sm:flex-row sm:items-center
          sm:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2">

                <FaCheckCircle className="text-emerald-400" />

                <span className="text-sm text-gray-400">
                  INTERVIEW COMPLETED
                </span>

              </div>

              <h2 className="text-2xl font-extrabold mt-2">
                Your final result is ready 🎉
              </h2>

              <p className="text-gray-400 mt-1">
                Keep practicing and improve your next score.
              </p>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-sm text-gray-400">
                Final Score
              </p>

              <p className="text-4xl font-extrabold
              text-emerald-400">

                {score.toFixed(1)}

                <span className="text-xl text-gray-500">
                  /10
                </span>

              </p>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="text-center py-8">

          <p className="text-xs text-gray-400">
            Powered by InterviewIQ AI
          </p>

        </div>

      </div>
    </div>
  );
}

export default Step3Report;
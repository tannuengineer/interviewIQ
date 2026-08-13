import React, { useEffect, useRef, useState } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";
import { ServerUrl } from "../App";

function Step2Interview({ interviewData, onFinish }) {
  const {
    interviewId,
    questions = [],
    userName,
  } = interviewData || {};

  // -----------------------------
  // STATES
  // -----------------------------

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(false);
  const recognitionRef = useRef(null);

  const [isAIPlaying, setAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // Every question = 60 seconds
  const [timeLeft, setTimeLeft] = useState(60);

  const [selectedVoice, setSelectedVoice] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [voiceGender, setVoiceGender] = useState("female");

  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  // -----------------------------
  // LOAD SPEECH VOICES
  // -----------------------------

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) return;

      // Female voice
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("zira") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Male voice
      const maleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("david") ||
          voice.name.toLowerCase().includes("mark") ||
          voice.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // -----------------------------
  // VIDEO
  // -----------------------------

  const videoSource =
    voiceGender === "male"
      ? maleVideo
      : femaleVideo;

  // -----------------------------
  // SPEAK TEXT
  // -----------------------------

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (
        !window.speechSynthesis ||
        !selectedVoice ||
        !text
      ) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ...");

      const utterance =
        new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setAIPlaying(true);

        if (videoRef.current) {
          videoRef.current
            .play()
            .catch(() => {});
        }
      };

      utterance.onend = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }

        setAIPlaying(false);

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      utterance.onerror = () => {
        setAIPlaying(false);
        setSubtitle("");
        resolve();
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  // -----------------------------
  // INTRO + QUESTION SPEECH
  // -----------------------------

  useEffect(() => {
    if (!selectedVoice) return;
    if (!questions.length) return;

    const runInterviewSpeech = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((resolve) =>
          setTimeout(resolve, 800)
        );

        if (
          currentIndex ===
          questions.length - 1
        ) {
          await speakText(
            "Alright, this one might be a bit more challenging."
          );
        }

        await speakText(
          currentQuestion.question
        );
      }
    };

    runInterviewSpeech();
  }, [
    selectedVoice,
    isIntroPhase,
    currentIndex,
  ]);

  // -----------------------------
  // RESET TIMER
  // -----------------------------

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(60);
    }
  }, [currentIndex, isIntroPhase]);

  // -----------------------------
  // TIMER
  // -----------------------------

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (feedback) return;
    if (isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isIntroPhase,
    currentIndex,
    feedback,
    isSubmitting,
  ]);

  // -----------------------------
  // SPEECH RECOGNITION
  // -----------------------------

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.log(
        "Speech Recognition is not supported in this browser."
      );
      return;
    }

    const recognition =
      new window.webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[
          event.results.length - 1
        ][0].transcript;

      setAnswer((prev) =>
        prev
          ? prev + " " + transcript
          : transcript
      );
    };

    recognition.onerror = (event) => {
      console.log(
        "Speech recognition error:",
        event.error
      );

      setIsMicOn(false);
    };

    recognition.onend = () => {
      setIsMicOn(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
        recognition.abort();
      } catch (error) {}
    };
  }, []);

  // -----------------------------
  // START MIC
  // -----------------------------

  const startMic = () => {
    if (!recognitionRef.current) return;
    if (isAIPlaying) return;
    if (isIntroPhase) return;

    try {
      recognitionRef.current.start();
      setIsMicOn(true);
    } catch (error) {
      console.log(
        "Microphone start error:",
        error
      );
    }
  };

  // -----------------------------
  // STOP MIC
  // -----------------------------

  const stopMic = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {}

    setIsMicOn(false);
  };

  // -----------------------------
  // TOGGLE MIC
  // -----------------------------

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
  };

  // -----------------------------
  // SUBMIT ANSWER
  // -----------------------------

  const submitAnswer = async () => {
    if (isSubmitting) return;
    if (!currentQuestion) return;

    stopMic();

    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl +
          "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: 60 - timeLeft,
        },
        {
          withCredentials: true,
        }
      );

      const feedbackText =
        result.data.feedback || "";

      setFeedback(feedbackText);

      await speakText(feedbackText);

      setIsSubmitting(false);
    } catch (error) {
      console.log(
        "SUBMIT ANSWER ERROR:",
        error.response?.data ||
          error.message
      );

      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // AUTO SUBMIT WHEN TIMER = 0
  // -----------------------------

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (
      timeLeft === 0 &&
      !isSubmitting &&
      !feedback
    ) {
      submitAnswer();
    }
  }, [
    timeLeft,
    isIntroPhase,
    currentQuestion,
    isSubmitting,
    feedback,
  ]);

  // -----------------------------
  // NEXT QUESTION
  // -----------------------------

  const handleNext = async () => {
    stopMic();

    setAnswer("");
    setFeedback("");

    if (
      currentIndex + 1 >=
      questions.length
    ) {
      await finishInterview();
      return;
    }

    await speakText(
      "Alright, let's move to the next question."
    );

    setCurrentIndex(
      currentIndex + 1
    );

    // New question = 60 seconds
    setTimeLeft(60);
  };

  // -----------------------------
  // FINISH INTERVIEW
  // -----------------------------

  const finishInterview = async () => {
    stopMic();

    setIsMicOn(false);

    try {
      const result = await axios.post(
        ServerUrl +
          "/api/interview/finish",
        {
          interviewId,
        },
        {
          withCredentials: true,
        }
      );

      console.log(
        "FINAL REPORT:",
        result.data
      );

      onFinish(result.data);
    } catch (error) {
      console.log(
        "FINISH INTERVIEW ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // -----------------------------
  // CLEANUP
  // -----------------------------

  useEffect(() => {
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        }
      } catch (error) {}

      window.speechSynthesis.cancel();
    };
  }, []);

  // -----------------------------
  // SAFETY CHECK
  // -----------------------------

  if (
    !interviewData ||
    !questions.length
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          Interview data not available.
        </p>
      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div
      className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100
      flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl
        shadow-2xl border border-gray-200 flex flex-col lg:flex-row
        overflow-hidden"
      >

        {/* VIDEO SECTION */}

        <div
          className="w-full lg:w-[35%] bg-white flex flex-col items-center
          p-6 space-y-6 border-r border-gray-200"
        >

          <div
            className="w-full max-w-md rounded-2xl
            overflow-hidden shadow-xl"
          >
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* SUBTITLE */}

          {subtitle && (
            <div
              className="w-full max-w-md bg-gray-50
              border border-gray-200 rounded-xl
              p-4 shadow-sm"
            >
              <p
                className="text-gray-700 text-sm sm:text-base
                font-medium text-center leading-relaxed"
              >
                {subtitle}
              </p>
            </div>
          )}

          {/* TIMER */}

          <div
            className="w-full max-w-md bg-white
            border border-gray-200 rounded-2xl
            shadow-md p-6 space-y-5"
          >

            <div
              className="flex justify-between items-center"
            >
              <span className="text-sm text-gray-500">
                Interview Status
              </span>

              {isAIPlaying && (
                <span
                  className="text-sm font-semibold
                  text-emerald-600"
                >
                  AI Speaking
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={60}
              />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div
              className="grid grid-cols-2
              gap-2 text-center"
            >

              <div>
                <span
                  className="text-2xl font-bold
                  text-emerald-600"
                >
                  {currentIndex + 1}
                </span>

                <span
                  className="text-xs text-gray-400"
                >
                  {" "}
                  Current Question
                </span>
              </div>

              <div>
                <span
                  className="text-2xl font-bold
                  text-emerald-600"
                >
                  {questions.length}
                </span>

                <span
                  className="text-xs text-gray-400"
                >
                  {" "}
                  Total Questions
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* TEXT SECTION */}

        <div
          className="flex-1 flex flex-col
          p-4 sm:p-6 md:p-8 relative"
        >

          <h2
            className="text-xl sm:text-2xl
            font-bold text-emerald-600 mb-6"
          >
            AI Smart Interview
          </h2>

          {/* QUESTION */}

          {!isIntroPhase && (
            <div
              className="relative mb-6 bg-gray-50
              p-4 sm:p-6 rounded-2xl
              border border-gray-200 shadow-sm"
            >

              <p
                className="text-xs sm:text-sm
                text-gray-400 mb-2"
              >
                Question {currentIndex + 1} of{" "}
                {questions.length}
              </p>

              <div
                className="text-base sm:text-lg
                font-semibold text-gray-800
                leading-relaxed pr-16"
              >
                {currentQuestion?.question}
              </div>

            </div>
          )}

          {/* ANSWER BOX */}

          <textarea
            placeholder="Type your answer here..."
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            value={answer}
            disabled={
              isIntroPhase ||
              isAIPlaying ||
              isSubmitting
            }
            className="flex-1 min-h-[200px]
            bg-gray-100 p-4 sm:p-6 rounded-2xl
            resize-none outline-none border
            border-gray-200 focus:ring-2
            focus:ring-emerald-500 transition
            text-gray-800"
          />

          {/* SUBMIT / FEEDBACK */}

          {!feedback ? (
            <div
              className="flex items-center
              gap-4 mt-6"
            >

              {/* MIC */}

              <motion.button
                onClick={toggleMic}
                disabled={
                  isAIPlaying ||
                  isIntroPhase ||
                  isSubmitting
                }
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14
                sm:h-14 flex items-center
                justify-center rounded-full
                bg-black text-white shadow-lg
                disabled:bg-gray-400"
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash
                    size={20}
                  />
                )}
              </motion.button>

              {/* SUBMIT */}

              <motion.button
                onClick={submitAnswer}
                disabled={
                  isSubmitting ||
                  isIntroPhase ||
                  isAIPlaying
                }
                whileTap={{ scale: 0.95 }}
                className="flex-1
                bg-gradient-to-r
                from-emerald-600 to-teal-500
                text-white py-3 sm:py-4
                rounded-2xl shadow-lg
                hover:opacity-90 transition
                font-semibold
                disabled:bg-gray-500"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Answer"}
              </motion.button>

            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50
              border border-emerald-200 p-5
              rounded-2xl shadow-sm"
            >

              <p
                className="text-emerald-700
                font-medium mb-4"
              >
                {feedback}
              </p>

              <button
                onClick={handleNext}
                className="w-full
                bg-gradient-to-r
                from-emerald-600 to-teal-500
                text-white py-3 rounded-xl
                shadow-md hover:opacity-90
                transition flex items-center
                justify-center gap-1"
              >
                {currentIndex + 1 >=
                questions.length
                  ? "Finish Interview"
                  : "Next Question"}

                <BsArrowRight size={18} />
              </button>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
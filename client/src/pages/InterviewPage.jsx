import React, { useState } from 'react'
import Step1SetUP from '../components/Step1SetUP'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'
import { data } from 'react-router-dom'

function InterviewPage() {
    const[step, setStep] = useState(1)
    const[interviewData, setInterviewData]= useState(null)
    return (
    <div className='min-h-screen bg-gray-50'>
        {step===1 &&(
            <Step1SetUP onStart={(data)=>{
                setInterviewData(data);
            setStep(2)}}/>
        )}
        {step===2 &&(
            <Step2Interview interviewData={interviewData}
            onFinish={(report)=>{setInterviewData(report);
                setStep(3)
            }}
            />
        )}
        {
            step===3 && (
                <Step3Report report={interviewData}/>
            )
        }

    </div>
)
}

export default InterviewPage
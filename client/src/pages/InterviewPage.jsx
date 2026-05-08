import React, { useState } from 'react';
import Step1SetUp from '../components/Step1SetUp';
import Step2Interview from '../components/Step2Interview';
import Step3Report from '../components/Step3Report';
import DashboardLayout from '../components/DashboardLayout';

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <>
      {step === 1 && (
        <DashboardLayout>
          <Step1SetUp onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }} />
        </DashboardLayout>
      )}

      {step === 2 && (
        <div className="min-h-screen bg-slate-900 overflow-hidden">
          <Step2Interview 
            interviewData={interviewData}
            onFinish={(report) => {
              setInterviewData(report);
              setStep(3);
            }}
          />
        </div>
      )}

      {step === 3 && (
        <DashboardLayout>
          <Step3Report report={interviewData} />
        </DashboardLayout>
      )}
    </>
  );
}

export default InterviewPage;

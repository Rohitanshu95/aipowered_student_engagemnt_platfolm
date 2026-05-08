import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { ServerUrl } from '../App';
import Step3Report from '../components/Step3Report';
import DashboardLayout from '../components/DashboardLayout';

function InterviewReport() {
  const {id} = useParams()
  const [report,setReport] = useState(null);
   
  useEffect(()=>{
    const fetchReport = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id , {withCredentials:true})
        setReport(result.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchReport()
  },[id])

  if (!report) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Step3Report report={report}/>
    </DashboardLayout>
  )
}

export default InterviewReport;

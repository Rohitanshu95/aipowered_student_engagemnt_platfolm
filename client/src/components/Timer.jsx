import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
function Timer({ timeLeft, totalTime, isDark }) {
    const percentage = (timeLeft/totalTime)*100
  return (
    <div className='w-20 h-20'>
        <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "28px",
          pathColor: "#10b981",
          textColor: isDark ? "#fff" : "#ef4444",
          trailColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
        })}
        />
      
    </div>
  )
}

export default Timer

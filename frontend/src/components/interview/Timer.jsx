import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
function Timer({timeLeft, totalTime}) {
   const percentage = (timeLeft/totalTime)*100
  return (
    <div className='h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]'>
        <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
            textSize: "27px",
          pathColor: "#d2ff00",
          textColor: "#708900",
          trailColor: "rgba(255,255,255,.16)",
        })}
        />
      
    </div>
  )
}

export default Timer

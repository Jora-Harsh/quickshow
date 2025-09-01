import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData, dummySeatLayouts } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormate from '../lib/isoTimeFormate'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'

const Seatlayout = () => {
  const { id ,date} = useParams()
  const [sp] = useSearchParams()
  // const date = sp.get("date")
  const theaterId = sp.get("theater") // 👈 string or null
  const timeFromQuery = sp.get("time") // 👈 raw time value

  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)

  // Pick layout based on theaterId (fallback to theater1)
  // const layout = dummySeatLayouts[theaterId] || dummySeatLayouts["theater1"]
  // const groupRows = layout.rows
  // const seatsPerRow = layout.seatsPerRow

//   const layout = dummySeatLayouts[theaterId] || Object.values(dummySeatLayouts)[0] || {}
// const groupRows = layout.rows || []
// const seatsPerRow = layout.seatsPerRow || 0

const layout = dummySeatLayouts[theaterId] || dummySeatLayouts["th_pvr"]
const groupRows = layout?.rows || []
const seatsPerRow = layout?.seatsPerRow || 0



  const navigate = useNavigate()

  const getShow = () => {
    const found = dummyShowsData.find(show => show._id === id)
    if (found) {
      setShow({
        movie: found,
        dateTime: dummyDateTimeData
      })
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please Select Time First")
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You Can Select Only 5 Seats")
    }
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    )
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2 flex-wrap justify-center">
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-8 w-8 rounded border border-primary/60 text-xs sm:text-sm cursor-pointer flex items-center justify-center ${
              selectedSeats.includes(seatId) && 'bg-primary text-white'
            }`}
          >
            {seatId}
          </button>
        )
      })}
    </div>
  )

  useEffect(() => {
    getShow()
  }, [])

  useEffect(() => {
    if (!show || !timeFromQuery) return
    const slots = show?.dateTime?.[date] || []
    // const match = slots.find(s => String(s.time) === String(timeFromQuery))
    const decodedTime = decodeURIComponent(timeFromQuery)
    const match = slots.find(s => String(s.time) === String(decodedTime))

    if (match) setSelectedTime(match)
  }, [show, timeFromQuery, date])

  return show ? (
    <div className="flex flex-col md:flex-row px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:pt-12 gap-6">
      
      {/* Left - Timings */}
      <div className="w-full md:w-60 bg-primary/10 border border-primary/20 rounded-lg py-6 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {(show?.dateTime?.[date] || []).map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                selectedTime?.time === item.time
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary/20'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormate(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-xl sm:text-2xl font-semibold mb-4 mt-30">
          Select Your Seat ({theaterId || "theater1"})
        </h1>
        <img src={assets.screenImage} alt="Screen" className="max-w-full h-auto" />
        <p className="text-gray-400 text-sm mb-6">Screen SIDE</p>

        {/* First group */}
        <div className="flex flex-col items-center mt-6 text-gray-300 w-full">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-2 mb-6 w-full max-w-md">
            {/* {groupRows[0].map((row) => renderSeats(row, seatsPerRow))} */}
            {Array.isArray(groupRows[0]) && groupRows[0].map((row) => renderSeats(row, seatsPerRow))}
          </div>
        </div>

        {/* Remaining groups */}
        <div className="grid grid-cols-2 gap-6 sm:gap-10">
          {groupRows.slice(1).map((group, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {group.map((row) => renderSeats(row, seatsPerRow))}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(`/my-bookings?id=${id}&theater=${theaterId}&time=${selectedTime?.time}&seats=${selectedSeats.join(",")}`)}
          className="flex items-center gap-1 mt-20 px-6 sm:px-10 py-2 sm:py-3 text-xs sm:text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Seatlayout

// import React from 'react'
// import { assets } from '../assets/assets'
// import { ArrowRight, Calendar, CalendarIcon, ClockIcon } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'

// const HeroSection = () => {

//     const navigate = useNavigate()
//     return (
//         <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
//             <img src={assets.marvelLogo} alt="" className='max-h-11 lg:h-11 mt-20' />

//             <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110'>Guardians <br /> of the Galaxy</h1>

//             <div className='flex items-center gap-4 text-gray-300'>
//                 <span>Action | Adventure | Sci-Fi</span>
//                 <div className='flex items-center gap-1'>
//                     <CalendarIcon className='w-4.5 h-4.5' />2018
//                 </div>
//                 <div className='flex items-center gap-1'>
//                     <ClockIcon className='w-4.5 h-4.5' />2h 8m
//                 </div>
//             </div>
//             <p className='max-w-md text-gray-300'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. idem possimus deleniti cumque dolore.</p>
//             <button onClick={() => navigate('/movies')} className='flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Explore Movies <ArrowRight className='w-5 h-5' /></button>

//         </div >
//     )
// }

// export default HeroSection

import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-screen flex items-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/backgroundImage.png"
          alt="background"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-center gap-3 sm:gap-4 px-4 sm:px-8 md:px-16 lg:px-36 py-10">
        {/* Logo */}
        <img
          src={assets.marvelLogo}
          alt="Marvel Logo"
          className="h-8 sm:h-10 lg:h-11"
        />

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-[70px] md:leading-[1.2] font-semibold max-w-[90%] sm:max-w-3xl">
          Guardians <br /> of the Galaxy
        </h1>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm md:text-base">
          <span>Action | Adventure | Sci-Fi</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />2018
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />2h 8m
          </div>
        </div>

        {/* Description */}
        <p className="max-w-md text-gray-300 text-xs sm:text-sm md:text-base">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Idem possimus deleniti cumque dolore.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate('/movies')}
          className="flex items-center gap-1 px-4 sm:px-6 py-2 sm:py-3 
                     text-xs sm:text-sm bg-primary hover:bg-primary-dull 
                     transition rounded-full font-medium cursor-pointer"
        >
          Explore Movies <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

export default HeroSection

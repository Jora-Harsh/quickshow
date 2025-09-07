import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
// import { assets } from '../assets/index.js';
import marvelLogo from '../assets/marvelLogo.svg';

// Example movies data (replace with API or props)
const movies = [
  {
    id: 1,
    title: "Guardians of the Galaxy",
    year: 2018,
    duration: "2h 8m",
    genres: "Action | Adventure | Sci-Fi",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Idem possimus deleniti cumque dolore.",
    background: "/backgroundImage.png",
    logo: marvelLogo,
  },
  {
    id: 2,
    title: "Avengers: Endgame",
    year: 2019,
    duration: "3h 2m",
    genres: "Action | Adventure | Drama",
    description: "Earth’s mightiest heroes must risk everything to defeat Thanos and restore balance.",
    background: "/endGame.png",
    logo: marvelLogo,
  },
  {
    id: 3,
    title: "Black Panther",
    year: 2018,
    duration: "2h 14m",
    genres: "Action | Adventure | Sci-Fi",
    description: "T'Challa returns home as king of Wakanda but faces challenges that test his leadership.",
    background: "/blackPanther.jpg",
    logo: marvelLogo,
  },
]

const HeroSlider = () => {
  const navigate = useNavigate()

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation={false} // Add this prop
      pagination={{ clickable: true }}
      autoplay={{ delay: 4000 }}
      loop={true}
      className="w-full h-[70vh] sm:h-[80vh] lg:h-screen"
    >
      {movies.map((movie) => (
        <SwiperSlide key={movie.id}>
          <div className="relative w-full h-full flex items-center">
            {/* Background image */}
            <img
              src={movie.background}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-start justify-center gap-3 sm:gap-4 px-4 sm:px-8 md:px-16 lg:px-36 py-10">
              {/* Logo */}
              <img src={movie.logo} alt="Logo" className="h-8 sm:h-10 lg:h-11" />

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-[70px] md:leading-[1.2] font-semibold max-w-[90%] sm:max-w-3xl">
                {movie.title}
              </h1>

              {/* Info Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm md:text-base">
                <span>{movie.genres}</span>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {movie.year}
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {movie.duration}
                </div>
              </div>

              {/* Description */}
              <p className="max-w-md text-gray-300 text-xs sm:text-sm md:text-base">
                {movie.description}
              </p>

              {/* Button */}
              <button
                onClick={() => navigate('/movies')}
                className="flex items-center gap-1 px-4 sm:px-6 py-2 sm:py-3 
text-xs sm:text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
              >
                Explore Movies <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default HeroSlider
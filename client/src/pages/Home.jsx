import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturedSection from '../components/FeaturedSection'
import TrailersSection from '../components/TrailersSection'
import HeroSlider from '../components/HeroSlider'


const Home = () => {
  return (
    <>
      {/* <HeroSection/> */}
      <HeroSlider/>
      <FeaturedSection />
      <TrailersSection/>
    </>
  )
}

export default Home

import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import Seatlayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Layout from './pages/admin/Layout'
import DashBoard from './pages/admin/DashBoard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import TheaterList from './pages/TheaterList';
import Theaters from './pages/Theaters';
import Releases from './pages/Releases';
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext.jsx'  // ✅ added
// import Profile from './pages/profile.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgetPassword.jsx'
import VerifyAccount from './pages/VerifyAccount.jsx'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  return (
    <AuthProvider>
      <Toaster />
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<Seatlayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favorite' element={<Favorite />} />
        <Route path='/movies/:id/theaters' element={<TheaterList />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/verify" element={<VerifyAccount />} />

        <Route path='/admin/*' element={<Layout/>}>
            <Route index element={<DashBoard/>} />
            <Route path='add-shows' element={<AddShows/>} />
            <Route path='list-shows' element={<ListShows/>} />
            <Route path='list-bookings' element={<ListBookings/>} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </AuthProvider>
  )
}

export default App

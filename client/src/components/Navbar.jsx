// import {
//   Menu as MenuIcon,
//   Search as SearchIcon,
//   TicketPlus,
//   X as XIcon,
// } from 'lucide-react'
// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { assets } from '../assets/assets'
// import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const { user } = useUser()
//   const { openSignIn } = useClerk()
//   const navigate = useNavigate()

//   return (
//     <div className='fixed top-0 left-0 z-50 w-full'>
//       <div className='flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-4'>

//         {/* Logo */}
//         <Link to='/' className='flex-shrink-0'>
//           <img src={assets.logo} alt='Logo' className='w-28 sm:w-32 md:w-36 h-auto' />
//         </Link>

//         {/* Desktop Nav */}
//         <div className='hidden lg:flex items-center gap-6 xl:gap-8 font-medium flex-wrap'>
//           <Link to='/'>Home</Link>
//           <Link to='/movies'>Movies</Link>
//           <Link to='/theaters'>Theaters</Link>
//           <Link to='/releases'>Releases</Link>
//           <Link to='/favorite'>Favourites</Link>
//         </div>

//         {/* Right Side */}
//         <div className='flex items-center gap-4 sm:gap-6'>
//           {/* Search Icon visible on larger screens */}
//           <SearchIcon className='hidden lg:block w-5 h-5 cursor-pointer' />

//           {!user ? (
//             <button
//               onClick={openSignIn}
//               className='px-4 py-1 sm:px-6 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full text-sm sm:text-base'
//             >
//               Login
//             </button>
//           ) : (
//             <UserButton>
//               <UserButton.MenuItems>
//                 <UserButton.Action
//                   label='My Bookings'
//                   labelIcon={<TicketPlus width={15} />}
//                   onClick={() => navigate('/my-booking')}
//                 />
//               </UserButton.MenuItems>
//             </UserButton>
//           )}

//           {/* Hamburger icon for screens smaller than lg */}
//           <MenuIcon
//             className='block lg:hidden w-6 h-6 cursor-pointer'
//             onClick={() => setIsOpen(true)}
//           />
//         </div>
//       </div>

//       {/* Mobile/Tablet Menu */}
//       {isOpen && (
//         <div className='lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-50 font-medium text-lg'>
//           <XIcon
//             className='absolute top-5 right-6 w-6 h-6 cursor-pointer'
//             onClick={() => setIsOpen(false)}
//           />
//           <Link onClick={() => setIsOpen(false)} to='/'>Home</Link>
//           <Link onClick={() => setIsOpen(false)} to='/movies'>Movies</Link>
//           <Link onClick={() => setIsOpen(false)} to='/theaters'>Theaters</Link>
//           <Link onClick={() => setIsOpen(false)} to='/'>Releases</Link>
//           <Link onClick={() => setIsOpen(false)} to='/favorite'>Favourites</Link>
        
//         </div>
//       )}
//     </div>
//   )
// }

// export default Navbar

import {
  Menu as MenuIcon,
  Search as SearchIcon,
  X as XIcon,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className='fixed top-0 left-0 z-50 w-full'>
      <div className='flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-4'>

        {/* Logo */}
        <Link to='/' className='flex-shrink-0'>
          <img src={assets.logo} alt='Logo' className='w-28 sm:w-32 md:w-36 h-auto' />
        </Link>

        {/* Desktop Nav */}
        <div className='hidden lg:flex items-center gap-6 xl:gap-8 font-medium flex-wrap'>
          <Link to='/'>Home</Link>
          <Link to='/movies'>Movies</Link>
          <Link to='/theaters'>Theaters</Link>
          <Link to='/releases'>Releases</Link>
          <Link to='/favorite'>Favourites</Link>
        </div>

        {/* Right Side */}
        <div className='flex items-center gap-4 sm:gap-6'>
          {/* Search Icon visible on larger screens */}
          <SearchIcon className='hidden lg:block w-5 h-5 cursor-pointer' />

          {/* Login/Sign Up Button */}
          <button
            onClick={() => navigate('/login')}
            className='px-4 py-1 sm:px-6 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full text-sm sm:text-base'
          >
            Login
          </button>

          {/* Hamburger icon for screens smaller than lg */}
          <MenuIcon
            className='block lg:hidden w-6 h-6 cursor-pointer'
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      {isOpen && (
        <div className='lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-50 font-medium text-lg'>
          <XIcon
            className='absolute top-5 right-6 w-6 h-6 cursor-pointer'
            onClick={() => setIsOpen(false)}
          />
          <Link onClick={() => setIsOpen(false)} to='/'>Home</Link>
          <Link onClick={() => setIsOpen(false)} to='/movies'>Movies</Link>
          <Link onClick={() => setIsOpen(false)} to='/theaters'>Theaters</Link>
          <Link onClick={() => setIsOpen(false)} to='/releases'>Releases</Link>
          <Link onClick={() => setIsOpen(false)} to='/favorite'>Favourites</Link>
        </div>
      )}
    </div>
  )
}

export default Navbar

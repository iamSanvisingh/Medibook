// admin/src/components/Navbar.jsx
import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)

  const logout = () => {
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
  }

  return (
    <nav className='flex items-center justify-between px-6 py-3 sticky top-0 z-50 bg-card dark:bg-dark-card border-b border-border dark:border-dark-border'>
      {/* Left — logo + role badge */}
      <div className='flex items-center gap-3'>
        <img src={assets.admin_logo} alt='MediBook' className='w-8 h-8' />
        <div>
          <span className='text-base font-semibold tracking-wide text-ink dark:text-dark-ink'>
            MediBook
          </span>
          <span className='ml-2 text-xs px-2 py-0.5 rounded-full bg-primary-light dark:bg-primary/20 text-primary border border-primary/20'>
            {aToken ? 'Admin' : 'Doctor'}
          </span>
        </div>
      </div>

      {/* Right — theme toggle + logout */}
      <div className='flex items-center gap-4'>
        <ThemeToggle />
        <button
          onClick={logout}
          className='text-sm font-semibold px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-all'
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className='flex items-center justify-between px-6 md:px-12 py-4 sticky top-0 z-50 bg-card dark:bg-dark-card border-b border-border dark:border-dark-border'>

      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        className='flex items-center gap-2 cursor-pointer'
      >
        <img src={assets.logo} alt='MediBook' className='w-8 h-8' />
        <span className='text-xl font-semibold tracking-wide text-ink dark:text-dark-ink'>
          MediBook
        </span>
      </div>

      {/* Desktop Nav Links */}
      <ul className='hidden md:flex items-center gap-8 text-sm font-medium'>
        {[
          { path: '/', label: 'Home' },
          { path: '/doctors', label: 'Doctors' },
          { path: '/about', label: 'About' },
          { path: '/contact', label: 'Contact' },
        ].map(({ path, label }) => (
          <NavLink key={path} to={path}>
            {({ isActive }) => (
              <li
                className={`pb-0.5 transition-colors border-b-2 ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-muted dark:text-dark-muted border-transparent hover:text-primary'
                }`}
              >
                {label}
              </li>
            )}
          </NavLink>
        ))}
      </ul>

      {/* Right side */}
      <div className='flex items-center gap-4'>

        <ThemeToggle />

        {/* Admin Panel button — only on home page */}
        {location.pathname === '/' && (
          <button
            onClick={() => {
              window.open(import.meta.env.VITE_ADMIN_URL, '_blank')
            }}
            className='hidden md:block text-xs px-4 py-2 rounded-full border border-border dark:border-dark-border text-muted dark:text-dark-muted hover:border-primary hover:text-primary transition-all'
          >
            Admin Panel
          </button>
        )}

        {token && userData ? (
          /* Profile dropdown when logged in */
          <div className='relative group cursor-pointer'>
            <div className='flex items-center gap-2'>
              <img
                src={userData.image || assets.profile_pic}
                className='w-8 h-8 rounded-full object-cover border-2 border-primary'
                alt='profile'
              />
              <img src={assets.dropdown_icon} className='w-3 opacity-60 dark:invert' alt='' />
            </div>
            {/* Invisible bridge so the dropdown doesn't close in the gap while moving the mouse down to it */}
            <div className='absolute right-0 top-full h-2 w-44'></div>
            {/* Dropdown menu */}
            <div className='absolute right-0 top-full mt-2 w-44 rounded-lg shadow-xl hidden group-hover:block z-50 overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
              {[
                { label: 'My Profile', action: () => navigate('/my-profile') },
                { label: 'My Appointments', action: () => navigate('/my-appointments') },
                { label: 'Logout', action: logout },
              ].map(({ label, action }) => (
                <p
                  key={label}
                  onClick={action}
                  className='px-4 py-3 text-sm text-muted dark:text-dark-muted hover:bg-primary hover:text-white cursor-pointer transition-colors'
                >
                  {label}
                </p>
              ))}
            </div>
          </div>
        ) : (
          /* Book Appointment button when logged out */
          <button
            onClick={() => navigate('/login')}
            className='text-sm font-semibold px-5 py-2 rounded-full bg-primary hover:bg-primary-dark text-white transition-all'
          >
            Book Appointment
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setShowMenu(true)}
          className='md:hidden'
        >
          <img src={assets.menu_icon} className='w-6 opacity-70 dark:invert' alt='menu' />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 z-50 shadow-2xl transform transition-transform duration-300 bg-card dark:bg-dark-card ${
          showMenu ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between px-6 py-5 border-b border-border dark:border-dark-border'>
          <span className='text-lg font-semibold text-ink dark:text-dark-ink'>MediBook</span>
          <button onClick={() => setShowMenu(false)}>
            <img src={assets.cross_icon} className='w-5 opacity-60 dark:invert' alt='close' />
          </button>
        </div>
        <ul className='flex flex-col px-6 py-4 gap-5'>
          {[
            { path: '/', label: 'Home' },
            { path: '/doctors', label: 'All Doctors' },
            { path: '/about', label: 'About' },
            { path: '/contact', label: 'Contact' },
          ].map(({ path, label }) => (
            <NavLink key={path} to={path} onClick={() => setShowMenu(false)}>
              <li className='text-sm text-muted dark:text-dark-muted hover:text-primary transition-colors list-none'>
                {label}
              </li>
            </NavLink>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
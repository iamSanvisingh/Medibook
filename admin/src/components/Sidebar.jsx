import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { assets } from '../assets/assets'

const Sidebar = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  const activeClass =
    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all text-sm border-l-[3px] border-primary bg-primary-light dark:bg-primary/10 text-primary rounded-r-lg font-medium'
  const inactiveClass =
    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all text-sm border-l-[3px] border-transparent text-muted dark:text-dark-muted hover:text-primary'

  return (
    <aside
      className='flex flex-col justify-between bg-card dark:bg-dark-card border-r border-border dark:border-dark-border'
      style={{ minHeight: 'calc(100vh - 56px)', width: '220px', flexShrink: 0 }}
    >
      <div>
        {aToken && (
          <ul className='pt-4'>
            <NavLink to='/admin-dashboard'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.home_icon} alt='' className='w-5 opacity-80' />
                  <span>Dashboard</span>
                </li>
              )}
            </NavLink>

            <NavLink to='/all-appointments'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.appointment_icon} alt='' className='w-5 opacity-80' />
                  <span>Appointments</span>
                </li>
              )}
            </NavLink>

            <NavLink to='/add-doctor'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.add_icon} alt='' className='w-5 opacity-80' />
                  <span>Add Doctor</span>
                </li>
              )}
            </NavLink>

            <NavLink to='/doctor-list'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.people_icon} alt='' className='w-5 opacity-80' />
                  <span>Doctors List</span>
                </li>
              )}
            </NavLink>

          </ul>
        )}

        {dToken && (
          <ul className='pt-4'>
            <NavLink to='/doctor-dashboard'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.home_icon} alt='' className='w-5 opacity-80' />
                  <span>Dashboard</span>
                </li>
              )}
            </NavLink>

            <NavLink to='/doctor-appointments'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.appointment_icon} alt='' className='w-5 opacity-80' />
                  <span>Appointments</span>
                </li>
              )}
            </NavLink>

            <NavLink to='/clinical-dashboard'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.list_icon} alt='' className='w-5 opacity-80' />
                  <span>Clinical</span>
                </li>
              )}
            </NavLink>

            <NavLink to='/doctor-profile'>
              {({ isActive }) => (
                <li className={isActive ? activeClass : inactiveClass}>
                  <img src={assets.people_icon} alt='' className='w-5 opacity-80' />
                  <span>My Profile</span>
                </li>
              )}
            </NavLink>
          </ul>
        )}
      </div>

      <div className='w-full px-4 py-4 mb-2 border-t border-border dark:border-dark-border'>
        <p className='text-xs font-medium text-muted dark:text-dark-muted'>
          {aToken ? 'Logged in as Admin' : 'Logged in as Doctor'}
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
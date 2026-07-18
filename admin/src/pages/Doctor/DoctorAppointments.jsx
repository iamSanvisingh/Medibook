import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium text-ink dark:text-dark-ink'>All Appointments</p>

      <div className='bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b border-border dark:border-dark-border text-muted dark:text-dark-muted font-medium'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div
            className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-muted dark:text-dark-muted py-3 px-6 border-b border-border dark:border-dark-border hover:bg-surface dark:hover:bg-dark-surface transition-colors'
            key={index}
          >
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 h-8 rounded-full object-cover' alt="" />
              <p className='text-ink dark:text-dark-ink'>{item.userData.name}</p>
            </div>
            <div>
              <span className='text-xs inline-block border border-primary text-primary px-2 py-0.5 rounded-full'>
                {item.payment ? 'Online' : 'CASH'}
              </span>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p className='text-ink dark:text-dark-ink'>{currency}{item.amount}</p>
            {item.cancelled ? (
              <span className='text-xs font-medium px-3 py-1 rounded-full bg-danger-bg dark:bg-danger/15 text-danger border border-danger/20 w-fit'>
                Cancelled
              </span>
            ) : item.isCompleted ? (
              <span className='text-xs font-medium px-3 py-1 rounded-full bg-success-bg dark:bg-success/15 text-success border border-success/20 w-fit'>
                Completed
              </span>
            ) : (
              <div className='flex items-center gap-2'>
                <img onClick={() => cancelAppointment(item._id)} className='w-7 cursor-pointer opacity-70 hover:opacity-100 transition-opacity' src={assets.cancel_icon} alt="" />
                <img onClick={() => completeAppointment(item._id)} className='w-7 cursor-pointer opacity-70 hover:opacity-100 transition-opacity' src={assets.tick_icon} alt="" />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

export default DoctorAppointments
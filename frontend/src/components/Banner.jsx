import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <section className='mx-6 md:mx-16 my-16 rounded-2xl overflow-hidden flex flex-col md:flex-row items-center bg-primary-light dark:bg-primary/10 border border-primary/20'>

      <div className='flex-1 px-8 md:px-14 py-12'>
        <h2 className='text-2xl md:text-3xl font-semibold mb-3 text-ink dark:text-dark-ink'>
          Book Your Appointment<br />
          <span className='text-primary'>In Just 2 Minutes</span>
        </h2>
        <p className='text-sm mb-6 text-muted dark:text-dark-muted'>
          Join thousands of patients who trust MediBook for fast, reliable healthcare appointments.
        </p>
        <button
          onClick={() => { navigate('/login'); window.scrollTo(0, 0) }}
          className='font-semibold px-8 py-3 rounded-full transition-all text-sm bg-primary hover:bg-primary-dark text-white'
        >
          Create Free Account →
        </button>
      </div>

      <div className='hidden md:flex flex-1 justify-end'>
        <img
          src={assets.appointment_img}
          alt='Book appointment'
          className='w-64 lg:w-80 object-contain'
        />
      </div>
    </section>
  )
}

export default Banner
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Header = () => {
  const navigate = useNavigate()

  return (
    <div className='bg-surface dark:bg-dark-surface w-full px-6 md:px-16 py-8 min-h-[calc(100vh-73px)] flex flex-col justify-center'>

      {/* Slogan — gradient text, sits above the booking card */}
      <h1 className='text-center text-3xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-primary via-[#8B5CF6] to-[#C084FC] bg-clip-text text-transparent leading-tight'>
        MediBook: Book Your Care, Anywhere.
      </h1>

      <div className='rounded-2xl bg-card dark:bg-dark-card border border-border dark:border-dark-border p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8'>

        {/* Left — text */}
        <div className='flex-1 max-w-xl'>
          <div className='inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-5 bg-primary-light dark:bg-primary/15 text-primary'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary'></span>
            Welcome back
          </div>

          <h1 className='text-3xl md:text-4xl font-bold leading-tight mb-4 text-ink dark:text-dark-ink'>
            Book your next appointment
          </h1>

          <p className='text-sm md:text-base leading-relaxed mb-8 text-muted dark:text-dark-muted'>
            Find a specialist, pick a time that works for you, and get instant confirmation.
          </p>

          <div
            onClick={() => navigate('/doctors')}
            className='flex items-center gap-3 px-4 py-3 rounded-xl cursor-text bg-surface dark:bg-dark-surface border border-border dark:border-dark-border max-w-md'
          >
            <img src={assets.search_icon} className='w-4 h-4 opacity-40 dark:invert' alt='' />
            <span className='text-sm text-muted dark:text-dark-muted'>Search specialists, symptoms, or clinics...</span>
          </div>
        </div>

        {/* Right — next visit card */}
        <div className='w-full md:w-72 rounded-2xl p-5 flex-shrink-0 bg-primary-light dark:bg-primary/10 border border-primary/20'>
          <p className='text-xs font-medium uppercase tracking-wide text-primary mb-2'>Next visit</p>
          <p className='text-lg font-semibold text-ink dark:text-dark-ink mb-1'>Book your first appointment</p>
          <p className='text-sm text-muted dark:text-dark-muted mb-4'>Browse our specialists below to get started</p>
          <button
            onClick={() => navigate('/doctors')}
            className='w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2.5 rounded-full transition-all'
          >
            Find a doctor →
          </button>
        </div>

      </div>

      {/* Stats row */}
      <div className='flex flex-wrap gap-8 justify-center md:justify-start mt-6 px-2'>
        {[
          { number: '50+', label: 'Specialists' },
          { number: '10k+', label: 'Patients Served' },
          { number: '4.9★', label: 'Average Rating' },
          { number: '24/7', label: 'Support' },
        ].map(({ number, label }) => (
          <div key={label}>
            <p className='text-primary text-lg font-bold'>{number}</p>
            <p className='text-xs text-muted dark:text-dark-muted mt-0.5'>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Header
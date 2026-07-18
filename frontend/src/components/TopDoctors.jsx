import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  return (
    <section className='py-16 px-6 md:px-16 bg-surface dark:bg-dark-surface'>

      <div className='text-center mb-10'>
        <div className='inline-block text-xs px-4 py-1 rounded-full mb-3 bg-primary-light dark:bg-primary/15 text-primary'>
          Our Best
        </div>
        <h2 className='text-2xl md:text-3xl font-semibold text-ink dark:text-dark-ink'>
          Top Doctors to Book
        </h2>
        <p className='text-sm mt-2 text-muted dark:text-dark-muted'>
          Verified specialists ready to see you today
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'>
        {doctors.slice(0, 10).map((item, index) => (
          <div
            key={index}
            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }}
            className='rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:border-primary'
          >
            <div className='p-4 flex justify-center bg-primary-light dark:bg-primary/10'>
              <img src={item.image} alt={item.name} className='w-24 h-24 rounded-full object-cover' />
            </div>
            <div className='p-3'>
              <div className='flex items-center gap-1 mb-1'>
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${item.available ? 'bg-success' : 'bg-muted dark:bg-dark-muted'}`}
                ></span>
                <span className={`text-xs ${item.available ? 'text-success' : 'text-muted dark:text-dark-muted'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className='font-medium text-sm text-ink dark:text-dark-ink'>{item.name}</p>
              <p className='text-xs mt-0.5 text-muted dark:text-dark-muted'>{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='text-center mt-10'>
        <button
          onClick={() => { navigate('/doctors'); window.scrollTo(0, 0) }}
          className='px-8 py-3 rounded-full text-sm font-medium transition-all border border-primary text-primary hover:bg-primary hover:text-white'
        >
          View All Doctors
        </button>
      </div>
    </section>
  )
}

export default TopDoctors
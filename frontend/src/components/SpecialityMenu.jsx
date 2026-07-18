import React from 'react'
import { specialityData } from '../assets/assets'
import { Link, useParams } from 'react-router-dom'

const SpecialityMenu = () => {
  const { speciality } = useParams()

  return (
    <section className='min-h-[85vh] flex flex-col justify-center py-20 md:py-28 px-6 md:px-16 bg-surface dark:bg-dark-surface'>

      {/* Header Section */}
      <div className='text-center mb-14 md:mb-20'>
        <div className='inline-block text-xs md:text-sm font-medium px-5 py-1.5 rounded-full mb-4 bg-primary-light dark:bg-primary/15 text-primary'>
          Browse by Specialty
        </div>
        <h2 className='text-4xl md:text-5xl font-bold tracking-tight text-ink dark:text-dark-ink'>
          Find the Right Specialist
        </h2>
        <p className='text-base md:text-lg mt-4 max-w-2xl mx-auto text-muted dark:text-dark-muted leading-relaxed'>
          Choose from our wide range of medical specialties and book instantly
        </p>
      </div>

      {/* Department Grid/Flex Area */}
      <div className='flex flex-nowrap overflow-x-auto justify-start md:justify-center gap-6 md:gap-8 max-w-7xl mx-auto w-full py-4 px-2 scrollbar-hide'>
      {specialityData.map((item, index) => {
          const isSelected = speciality === item.speciality
          return (
            <Link
              key={index}
              to={`/doctors/${item.speciality}`}
              onClick={() => window.scrollTo(0, 0)}
              className={`flex flex-col items-center justify-center gap-5 w-44 md:w-52 py-8 px-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 border shadow-sm ${
                isSelected
                  ? 'border-primary bg-primary-light dark:bg-primary/15 shadow-md shadow-primary/5'
                  : 'border-border dark:border-dark-border bg-card dark:bg-dark-card hover:border-primary hover:shadow-md'
              }`}
            >
              {/* Icon Container */}
              <div className='w-20 h-20 rounded-full flex items-center justify-center bg-primary-light dark:bg-primary/15 transition-transform duration-300 group-hover:scale-110'>
                <img src={item.image} alt={item.speciality} className='w-10 h-10 object-contain' />
              </div>
              
              {/* Text Label */}
              <p className={`text-sm md:text-base text-center font-semibold leading-tight tracking-wide ${
                isSelected ? 'text-primary' : 'text-ink dark:text-dark-ink'
              }`}>
                {item.speciality}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default SpecialityMenu
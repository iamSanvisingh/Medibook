import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const [relDoc, setRelDoc] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      )
      setRelDoc(doctorsData)
    }
  }, [doctors, speciality, docId])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-ink dark:text-dark-ink'>
      <h1 className='text-3xl font-medium'>Related Doctors</h1>
      <p className='sm:w-1/3 text-center text-sm text-muted dark:text-dark-muted'>
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {relDoc.map((item, index) => (
          <div
            onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }}
            className='rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-6px] transition-all duration-500 bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:border-primary'
            key={index}
          >
            <img className='bg-primary-light dark:bg-primary/10' src={item.image} alt="" />
            <div className='p-4'>
              <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-success' : 'text-muted dark:text-dark-muted'}`}>
                <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-success' : 'bg-muted dark:bg-dark-muted'}`}></p>
                <p>{item.available ? 'Available' : 'Not Available'}</p>
              </div>
              <p className='text-ink dark:text-dark-ink text-lg font-medium'>{item.name}</p>
              <p className='text-muted dark:text-dark-muted text-sm'>{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedDoctors

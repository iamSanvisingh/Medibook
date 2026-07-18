import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {

  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext)
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }
  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  const specialities = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist']

  return (
    <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8'>
      <p className='text-muted dark:text-dark-muted mb-5'>Browse through the doctors specialist.</p>

      <div className='flex flex-col sm:flex-row items-start gap-5'>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1.5 px-4 rounded-full text-sm transition-all sm:hidden border ${
            showFilter ? 'bg-primary text-white border-primary' : 'border-border dark:border-dark-border text-ink dark:text-dark-ink'
          }`}
        >
          Filters
        </button>

        <div className={`flex-col gap-2 text-sm ${showFilter ? 'flex' : 'hidden sm:flex'} w-full sm:w-56 flex-shrink-0`}>
          {specialities.map((item) => (
            <p
              key={item}
              onClick={() => speciality === item ? navigate('/doctors') : navigate(`/doctors/${item}`)}
              className={`pl-4 py-2 rounded-lg transition-all cursor-pointer border ${
                speciality === item
                  ? 'bg-primary-light dark:bg-primary/15 border-primary text-primary font-medium'
                  : 'border-border dark:border-dark-border text-muted dark:text-dark-muted hover:border-primary'
              }`}
            >
              {item}
            </p>
          ))}
        </div>

        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item, index) => (
            <div
              onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }}
              className='rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-6px] transition-all duration-500 bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:border-primary'
              key={index}
            >
              <img className='bg-primary-light dark:bg-primary/10' src={item.image} alt="" />
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-success' : 'text-muted dark:text-dark-muted'}`}>
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
    </div>
  )
}

export default Doctors
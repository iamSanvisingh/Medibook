import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability, backendUrl } = useContext(AdminContext)

  const removeDoctor = async (doctorId) => {
    if (!window.confirm('Remove this doctor? This cannot be undone.')) return
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/remove-doctor',
        { doctorId },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success('Doctor removed')
        getAllDoctors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium text-ink dark:text-dark-ink'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item, index) => (
          <div
            className='rounded-xl max-w-56 overflow-hidden cursor-pointer group bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:border-primary/40 transition-colors'
            key={index}
          >
            <img className='bg-primary-light dark:bg-primary/10 group-hover:opacity-90 transition-all duration-500' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-ink dark:text-dark-ink text-lg font-medium'>{item.name}</p>
              <p className='text-muted dark:text-dark-muted text-sm'>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-2 text-sm text-ink dark:text-dark-ink'>
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} className='accent-primary' />
                <p>Available</p>
              </div>
              <button
                onClick={() => removeDoctor(item._id)}
                className='mt-3 w-full text-danger text-xs border border-danger/40 px-3 py-1.5 rounded-lg hover:bg-danger-bg dark:hover:bg-danger/15 transition'
              >
                Remove Doctor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList
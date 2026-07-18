import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

const HealthSnapshot = () => {
  const { token, userData, backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  const [upcomingCount, setUpcomingCount] = useState(0)
  const [reportsCount, setReportsCount] = useState(0)
  const [prescriptionsCount, setPrescriptionsCount] = useState(0)

  const fetchSnapshot = async () => {
    try {
      const { data: apptData } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (apptData.success) {
        const upcoming = apptData.appointments.filter(a => !a.cancelled && !a.isCompleted)
        setUpcomingCount(upcoming.length)
      }

      const { data: clinicalData } = await axios.get(backendUrl + '/api/clinical/patient/' + userData._id, { headers: { token } })
      if (clinicalData.success) {
        setReportsCount(clinicalData.reports.length)
      }

      const { data: rxData } = await axios.get(backendUrl + '/api/prescription/patient/' + userData._id, { headers: { token } })
      if (rxData.success) {
        setPrescriptionsCount(rxData.prescriptions.length)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (token && userData?._id) {
      fetchSnapshot()
    }
  }, [token, userData])

  if (!token || !userData) return null

  const stats = [
    { label: 'Upcoming visits', value: upcomingCount, action: () => navigate('/my-appointments') },
    { label: 'Lab Reports', value: reportsCount, action: () => navigate('/my-lab-reports') },
    { label: 'Prescriptions', value: prescriptionsCount, action: () => navigate('/my-prescriptions') },
  ]

  return (
    <section className='px-6 md:px-16 -mt-2 mb-4'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {stats.map(({ label, value, action }) => (
          <div
            key={label}
            onClick={action}
            className='flex items-center gap-4 p-4 rounded-xl bg-card dark:bg-dark-card border border-border dark:border-dark-border cursor-pointer hover:border-primary transition-colors'
          >
            <div className='w-10 h-10 rounded-xl flex items-center justify-center bg-primary-light dark:bg-primary/15'>
              <span className='text-primary font-semibold'>{value}</span>
            </div>
            <p className='text-sm text-muted dark:text-dark-muted'>{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HealthSnapshot
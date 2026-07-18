import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

const MyPrescriptions = () => {
  const { userData, backendUrl, token } = useContext(AppContext)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/prescription/patient/' + userData._id, { headers: { token } })
        if (data.success) setPrescriptions(data.prescriptions)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (userData?._id) fetchPrescriptions()
  }, [userData])

  return (
    <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8'>
      <p className='pb-3 mt-4 text-lg font-medium text-ink dark:text-dark-ink border-b border-border dark:border-dark-border'>
        My Prescriptions
      </p>

      {loading && <p className='text-sm text-muted dark:text-dark-muted mt-6'>Loading...</p>}
      {!loading && prescriptions.length === 0 && (
        <p className='text-sm text-muted dark:text-dark-muted mt-6'>No prescriptions yet.</p>
      )}

      <div className='flex flex-col gap-4 mt-6'>
        {prescriptions.map((rx) => (
          <div key={rx._id} className='rounded-xl p-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
            <p className='text-xs text-muted dark:text-dark-muted mb-3'>
              {new Date(rx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <div className='flex flex-col gap-2'>
              {rx.medications.map((m, i) => (
                <div key={i} className='p-3 rounded-lg bg-surface dark:bg-dark-surface'>
                  <p className='text-sm font-medium text-ink dark:text-dark-ink'>{m.name}</p>
                  <p className='text-xs text-muted dark:text-dark-muted mt-0.5'>{m.dosage} · {m.frequency} · {m.duration}</p>
                  {m.instructions && <p className='text-xs text-muted dark:text-dark-muted mt-0.5'>{m.instructions}</p>}
                </div>
              ))}
            </div>
            {rx.notes && <p className='text-xs text-muted dark:text-dark-muted mt-3 italic'>{rx.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyPrescriptions
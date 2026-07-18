import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

const statusStyles = {
  HIGH: 'bg-danger-bg dark:bg-danger/15 text-danger border-danger/20',
  CRITICAL: 'bg-danger-bg dark:bg-danger/15 text-danger border-danger/20',
  LOW: 'bg-pending-bg dark:bg-pending/15 text-pending border-pending/20',
  NORMAL: 'bg-success-bg dark:bg-success/15 text-success border-success/20',
}

const MyLabReports = () => {
  const { userData, backendUrl, token } = useContext(AppContext)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  const fetchReports = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/clinical/patient/' + userData._id, { headers: { token } })
      if (data.success) {
        setReports(data.reports)
        if (data.reports.length > 0) setOpenId(data.reports[0].id)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData?._id) fetchReports()
  }, [userData])

  return (
    <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8'>
      <p className='pb-3 mt-4 text-lg font-medium text-ink dark:text-dark-ink border-b border-border dark:border-dark-border'>
        My Lab Reports
      </p>

      {loading && <p className='text-sm text-muted dark:text-dark-muted mt-6'>Loading...</p>}

      {!loading && reports.length === 0 && (
        <p className='text-sm text-muted dark:text-dark-muted mt-6'>No lab reports on file yet.</p>
      )}

      <div className='flex flex-col gap-4 mt-6'>
        {reports.map((report) => {
          const isOpen = openId === report.id
          const flagged = report.biomarkers.filter(b => b.status !== 'NORMAL').length

          return (
            <div key={report.id} className='rounded-xl overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
              <div
                onClick={() => setOpenId(isOpen ? null : report.id)}
                className='flex items-center justify-between px-5 py-4 cursor-pointer'
              >
                <div>
                  <p className='text-sm font-medium text-ink dark:text-dark-ink'>
                    {new Date(report.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {report.status !== 'ready' && (
                    <p className='text-xs text-muted dark:text-dark-muted mt-0.5 capitalize'>{report.status}</p>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  {flagged > 0 && (
                    <span className='text-xs px-2.5 py-1 rounded-full bg-danger-bg dark:bg-danger/15 text-danger'>
                      {flagged} flagged
                    </span>
                  )}
                  <span className='text-muted dark:text-dark-muted text-xs'>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && report.status === 'ready' && (
                <div className='border-t border-border dark:border-dark-border p-5 flex flex-col gap-4'>
                  {report.aiSummary && (
                    <p className='text-sm text-muted dark:text-dark-muted leading-relaxed'>{report.aiSummary}</p>
                  )}

                  <div className='flex flex-col gap-2'>
                    {report.biomarkers.map((b) => (
                      <div key={b.id} className='flex items-center justify-between p-3 rounded-lg bg-surface dark:bg-dark-surface'>
                        <p className='text-sm text-ink dark:text-dark-ink'>{b.name}</p>
                        <div className='flex items-center gap-3'>
                          <p className='text-sm font-medium text-ink dark:text-dark-ink'>
                            {b.value} <span className='text-xs font-normal text-muted dark:text-dark-muted'>{b.unit}</span>
                          </p>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusStyles[b.status]}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOpen && report.status !== 'ready' && (
                <div className='border-t border-border dark:border-dark-border p-5'>
                  <p className='text-sm text-muted dark:text-dark-muted'>Your doctor is still reviewing this report.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyLabReports
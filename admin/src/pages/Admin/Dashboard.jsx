import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { ThemeContext } from '../../context/ThemeContext'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

// Indigo-led palette — used for both the revenue pie chart and the doctor-load bars
const COLORS = ['#5B5FEF', '#22C55E', '#EC4899', '#F59E0B', '#06B6D4', '#8B5CF6']

const Dashboard = () => {
  const {
    aToken, getDashData, cancelAppointment, dashData, backendUrl,
    doctors, getAllDoctors, appointments, getAllAppointments
  } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)
  const { theme } = useContext(ThemeContext)
  const isDark = theme === 'dark'

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [chartData, setChartData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (aToken) {
      getDashData()
      fetchRevenue()
      getAllDoctors()
      getAllAppointments()
    }
  }, [aToken])

  const fetchRevenue = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/revenue', {
        headers: { aToken }
      })
      if (data.success) {
        setTotalRevenue(data.totalRevenue)
        const formatted = Object.entries(data.revenueByDept).map(([name, value]) => ({ name, value }))
        setChartData(formatted)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Derive per-doctor booking load from the appointments list — no backend change needed
  const doctorLoad = React.useMemo(() => {
    if (!doctors.length || !appointments.length) return []

    const counts = {}
    appointments.forEach(a => {
      const id = a.docData?._id || a.docId
      if (!id) return
      counts[id] = (counts[id] || 0) + 1
    })

    const maxCount = Math.max(...Object.values(counts), 1)

    return doctors
      .map(doc => ({
        id: doc._id,
        name: doc.name,
        speciality: doc.speciality,
        image: doc.image,
        count: counts[doc._id] || 0,
        percent: Math.round(((counts[doc._id] || 0) / maxCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [doctors, appointments])

  return dashData && (
    <div className='p-6 min-h-screen w-full bg-surface dark:bg-dark-surface'>

      {/* ── Page title ── */}
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-ink dark:text-dark-ink'>Dashboard</h1>
        <p className='text-sm mt-1 text-muted dark:text-dark-muted'>Welcome back, Admin</p>
      </div>

      {/* ── Main grid: left = stats + bookings, right = pie chart + doctor load ── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 items-start'>

        {/* LEFT COLUMN */}
        <div className='lg:col-span-2 flex flex-col gap-5'>

          {/* Stat cards */}
          <div className='flex flex-wrap gap-4 w-full'>

            <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 cursor-pointer hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
              <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
                <img className='w-8' src={assets.doctor_icon} alt='' />
              </div>
              <div>
                <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{dashData.doctors}</p>
                <p className='text-sm text-muted dark:text-dark-muted'>Doctors</p>
              </div>
            </div>

            <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 cursor-pointer hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
              <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
                <img className='w-8' src={assets.appointments_icon} alt='' />
              </div>
              <div>
                <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{dashData.appointments}</p>
                <p className='text-sm text-muted dark:text-dark-muted'>Appointments</p>
              </div>
            </div>

            <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 cursor-pointer hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
              <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
                <img className='w-8' src={assets.patients_icon} alt='' />
              </div>
              <div>
                <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{dashData.patients}</p>
                <p className='text-sm text-muted dark:text-dark-muted'>Patients</p>
              </div>
            </div>

          </div>

          {/* Latest Bookings */}
          <div className='rounded-xl overflow-hidden w-full bg-card dark:bg-dark-card border border-border dark:border-dark-border'>

            <div className='flex items-center justify-between gap-4 px-5 py-4 border-b border-border dark:border-dark-border flex-wrap'>
              <div>
                <p className='text-xs font-medium tracking-wide text-muted dark:text-dark-muted uppercase'>Bookings</p>
                <p className='font-semibold text-ink dark:text-dark-ink'>Recent appointments</p>
              </div>
              <div className='relative'>
                <img
                  src={assets.search_icon}
                  alt=''
                  className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 dark:invert'
                />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search bookings...'
                  className='pl-9 pr-3 py-2 text-sm rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink placeholder:text-muted dark:placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary/40 w-56'
                />
              </div>
            </div>

            <div className='hidden sm:grid grid-cols-[2.5fr_2fr_1.8fr_1.3fr_1fr] gap-2 px-5 py-2 text-xs font-medium uppercase tracking-wide text-muted dark:text-dark-muted border-b border-border dark:border-dark-border'>
              <p>Patient</p>
              <p>Doctor</p>
              <p>When</p>
              <p>Status</p>
              <p>Amount</p>
            </div>

            <div>
              {dashData.latestAppointments
                .filter(item =>
                  item.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.docData.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-2 sm:grid-cols-[2.5fr_2fr_1.8fr_1.3fr_1fr] gap-2 items-center px-5 py-3 hover:bg-surface dark:hover:bg-dark-surface transition-colors border-b border-border dark:border-dark-border last:border-b-0'
                  >
                    <div className='flex items-center gap-3'>
                      <img
                        className='rounded-full w-9 h-9 object-cover border-2 border-border dark:border-dark-border'
                        src={item.userData.image}
                        alt=''
                      />
                      <p className='font-medium text-sm text-ink dark:text-dark-ink'>{item.userData.name}</p>
                    </div>

                    <p className='text-sm text-muted dark:text-dark-muted'>{item.docData.name}</p>

                    <p className='text-sm text-muted dark:text-dark-muted'>
                      {slotDateFormat(item.slotDate)} · {item.slotTime}
                    </p>

                    {item.cancelled ? (
                      <span className='text-xs px-3 py-1 rounded-full font-medium bg-danger-bg dark:bg-danger/15 text-danger border border-danger/20 w-fit'>
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className='text-xs px-3 py-1 rounded-full font-medium bg-success-bg dark:bg-success/15 text-success border border-success/20 w-fit'>
                        Completed
                      </span>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span className='text-xs px-3 py-1 rounded-full font-medium bg-pending-bg dark:bg-pending/15 text-pending border border-pending/20 w-fit'>
                          Pending
                        </span>
                        <img
                          onClick={() => cancelAppointment(item._id)}
                          className='w-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity'
                          src={assets.cancel_icon}
                          alt='cancel'
                          title='Cancel appointment'
                        />
                      </div>
                    )}

                    <p className='text-sm font-medium text-ink dark:text-dark-ink'>₹{item.amount}</p>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — pie chart on top, doctor load below, together matching left column's height */}
        <div className='lg:col-span-1 flex flex-col gap-5 h-full'>

          {/* Revenue Pie Chart */}
          <div className='rounded-xl overflow-hidden w-full bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
            <div className='px-5 py-4 border-b border-border dark:border-dark-border'>
              <p className='font-medium text-sm text-ink dark:text-dark-ink'>Revenue Analytics</p>
              <p className='text-xs mt-0.5 text-muted dark:text-dark-muted'>
                Total: <span className='font-semibold text-primary'>
                  ₹{totalRevenue.toLocaleString()}
                </span>
              </p>
            </div>

            <div className='p-6 flex justify-center items-center'>
              {chartData.length === 0 ? (
                <div className='flex items-center justify-center h-52'>
                  <p className='text-sm text-muted dark:text-dark-muted'>No revenue data yet</p>
                </div>
              ) : (
                <div className='w-full aspect-square max-w-[280px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx='50%'
                        cy='45%'
                        outerRadius='75%'
                        dataKey='value'
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} stroke={isDark ? '#171A21' : '#FFFFFF'} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        contentStyle={{
                          background: isDark ? '#171A21' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#262B36' : '#E7EAF0'}`,
                          borderRadius: '8px',
                          color: isDark ? '#F1F5F9' : '#0F172A',
                        }}
                      />
                      <Legend
                        verticalAlign='bottom'
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: isDark ? '#94A3B8' : '#0F172A', fontSize: '12px' }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Load — colorful bar graph */}
          <div className='rounded-xl overflow-hidden w-full flex-1 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
            <div className='px-5 py-4 border-b border-border dark:border-dark-border'>
              <p className='text-xs font-medium tracking-wide text-muted dark:text-dark-muted uppercase'>Staffing</p>
              <p className='font-semibold text-sm text-ink dark:text-dark-ink'>Clinician load</p>
            </div>

            <div className='p-5 flex flex-col gap-5'>
              {doctorLoad.length === 0 && (
                <p className='text-sm text-muted dark:text-dark-muted'>No data yet</p>
              )}
              {doctorLoad.map((doc, index) => (
                <div key={doc.id}>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2.5'>
                      <img
                        src={doc.image}
                        alt=''
                        className='w-8 h-8 rounded-full object-cover border-2 border-border dark:border-dark-border'
                      />
                      <div>
                        <p className='text-sm font-medium text-ink dark:text-dark-ink leading-tight'>{doc.name}</p>
                        <p className='text-xs text-muted dark:text-dark-muted leading-tight'>{doc.speciality}</p>
                      </div>
                    </div>
                    <p className='text-sm font-semibold text-ink dark:text-dark-ink'>{doc.percent}%</p>
                  </div>
                  <div className='h-2 rounded-full bg-surface dark:bg-dark-surface overflow-hidden'>
                    <div
                      className='h-full rounded-full transition-all duration-500'
                      style={{ width: `${doc.percent}%`, background: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Dashboard
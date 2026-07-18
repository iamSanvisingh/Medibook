import React, { useContext, useEffect, useMemo } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { ThemeContext } from '../../context/ThemeContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment, profileData, getProfileData } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const { theme } = useContext(ThemeContext)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (dToken) {
      getDashData()
      getProfileData()
    }
  }, [dToken])

  // "Appointments today" — computed client-side from latestAppointments, no backend change needed
  const todayCount = useMemo(() => {
    if (!dashData?.latestAppointments) return 0
    const now = new Date()
    const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
    return dashData.latestAppointments.filter(a => a.slotDate === todayStr).length
  }, [dashData])

  // Monthly visit trend for the chart — grouped from latestAppointments' slotDate
  const visitTrend = useMemo(() => {
    if (!dashData?.latestAppointments) return []
    const counts = new Array(12).fill(0)
    dashData.latestAppointments.forEach(a => {
      const [, month] = a.slotDate.split('_')
      const idx = Number(month) - 1
      if (idx >= 0 && idx < 12) counts[idx] += 1
    })
    return monthLabels.map((m, i) => ({ month: m, visits: counts[i] }))
  }, [dashData])

  // Days-with-appointments, for the dot indicators on the calendar
  const appointmentDays = useMemo(() => {
    if (!dashData?.latestAppointments) return new Set()
    return new Set(dashData.latestAppointments.map(a => a.slotDate.split('_')[0]))
  }, [dashData])

  const today = new Date()
  const monthName = today.toLocaleString('default', { month: 'long' })
  const year = today.getFullYear()
  const firstDay = new Date(year, today.getMonth(), 1).getDay() // 0 = Sun
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate()
  const leadingBlanks = (firstDay + 6) % 7 // convert to Mon-first grid
  const calendarCells = [...Array(leadingBlanks).fill(null), ...Array(daysInMonth).keys()].map(d => d === null ? null : d + 1)

  return dashData && (
    <div className='p-6 min-h-screen w-full bg-surface dark:bg-dark-surface'>

      {/* Greeting */}
      <div className='mb-6'>
        <div className='inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-2 bg-primary-light dark:bg-primary/15 text-primary'>
          <span className='w-1.5 h-1.5 rounded-full bg-primary'></span>
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · {todayCount} patients today
        </div>
        <h1 className='text-2xl font-bold text-ink dark:text-dark-ink'>
          Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, <span className='text-primary'>Dr. {profileData?.name?.split(' ').slice(-1)[0] || ''}</span>
        </h1>
        <p className='text-sm mt-1 text-muted dark:text-dark-muted'>Here's a snapshot of your clinic today.</p>
      </div>

      {/* Stat cards */}
      <div className='flex flex-wrap gap-4 mb-6 w-full'>
        <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
          <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
            <img className='w-8' src={assets.appointments_icon} alt='' />
          </div>
          <div>
            <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{todayCount}</p>
            <p className='text-sm text-muted dark:text-dark-muted'>Appointments today</p>
          </div>
        </div>

        <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
          <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
            <img className='w-8' src={assets.patients_icon} alt='' />
          </div>
          <div>
            <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{dashData.patients}</p>
            <p className='text-sm text-muted dark:text-dark-muted'>Active patients</p>
          </div>
        </div>

        <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
          <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
            <img className='w-8' src={assets.list_icon} alt='' />
          </div>
          <div>
            <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{dashData.appointments}</p>
            <p className='text-sm text-muted dark:text-dark-muted'>Total appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-4 p-4 rounded-xl min-w-52 flex-1 hover:scale-[1.02] transition-all bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
          <div className='p-3 rounded-xl bg-primary-light dark:bg-primary/15'>
            <img className='w-8' src={assets.earning_icon} alt='' />
          </div>
          <div>
            <p className='text-2xl font-semibold text-ink dark:text-dark-ink'>{currency}{dashData.earnings}</p>
            <p className='text-sm text-muted dark:text-dark-muted'>Earnings</p>
          </div>
        </div>
      </div>

      {/* Chart + Calendar row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 items-stretch'>

        {/* Patient Visits chart */}
        <div className='lg:col-span-2 rounded-xl p-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
          <p className='text-xs font-medium tracking-wide text-muted dark:text-dark-muted uppercase'>Patient visits</p>
          <p className='text-2xl font-bold text-ink dark:text-dark-ink mb-4'>{dashData.appointments}</p>
          <div className='w-full h-56'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={visitTrend}>
                <defs>
                  <linearGradient id='visitFill' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#5B5FEF' stopOpacity={0.35} />
                    <stop offset='95%' stopColor='#5B5FEF' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#262B36' : '#E7EAF0'} vertical={false} />
                <XAxis dataKey='month' tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#171A21' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#262B36' : '#E7EAF0'}`,
                    borderRadius: '8px',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                    fontSize: '12px'
                  }}
                />
                <Area type='monotone' dataKey='visits' stroke='#5B5FEF' strokeWidth={2} fill='url(#visitFill)' />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule calendar */}
        <div className='lg:col-span-1 rounded-xl p-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
          <p className='text-xs font-medium tracking-wide text-muted dark:text-dark-muted uppercase'>Schedule</p>
          <p className='text-lg font-semibold text-ink dark:text-dark-ink mb-3'>{monthName} {year}</p>

          <div className='grid grid-cols-7 gap-1 text-center'>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
              <p key={d} className='text-[10px] font-medium text-muted dark:text-dark-muted py-1'>{d}</p>
            ))}
            {calendarCells.map((day, idx) => {
              const isToday = day === today.getDate()
              const hasAppt = day && appointmentDays.has(String(day))
              return (
                <div key={idx} className='flex flex-col items-center py-1'>
                  {day ? (
                    <>
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs ${
                          isToday
                            ? 'bg-primary text-white font-semibold'
                            : 'text-ink dark:text-dark-ink'
                        }`}
                      >
                        {day}
                      </span>
                      {hasAppt && <span className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-primary'}`}></span>}
                    </>
                  ) : <span className='w-7 h-7'></span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className='rounded-xl overflow-hidden w-full bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
        <div className='flex items-center gap-2.5 px-5 py-4 border-b border-border dark:border-dark-border'>
          <img src={assets.list_icon} alt='' className='w-5 opacity-70 dark:invert' />
          <p className='font-medium text-sm text-ink dark:text-dark-ink'>Upcoming appointments</p>
        </div>

        <div>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className='flex items-center px-5 py-3 gap-4 hover:bg-surface dark:hover:bg-dark-surface transition-colors border-b border-border dark:border-dark-border last:border-b-0'
            >
              <img className='rounded-full w-10 h-10 object-cover border-2 border-border dark:border-dark-border' src={item.userData.image} alt='' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-ink dark:text-dark-ink'>{item.userData.name}</p>
                <p className='text-xs mt-0.5 text-muted dark:text-dark-muted'>
                  {slotDateFormat(item.slotDate)} · {item.slotTime}
                </p>
              </div>
              {item.cancelled ? (
                <span className='text-xs px-3 py-1 rounded-full font-medium bg-danger-bg dark:bg-danger/15 text-danger border border-danger/20'>
                  Cancelled
                </span>
              ) : item.isCompleted ? (
                <span className='text-xs px-3 py-1 rounded-full font-medium bg-success-bg dark:bg-success/15 text-success border border-success/20'>
                  Completed
                </span>
              ) : (
                <div className='flex items-center gap-2'>
                  <img onClick={() => cancelAppointment(item._id)} className='w-7 cursor-pointer opacity-70 hover:opacity-100 transition-opacity' src={assets.cancel_icon} alt='cancel' title='Cancel' />
                  <img onClick={() => completeAppointment(item._id)} className='w-7 cursor-pointer opacity-70 hover:opacity-100 transition-opacity' src={assets.tick_icon} alt='complete' title='Mark complete' />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard
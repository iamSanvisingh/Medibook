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

          {/* --- REVENUE ANALYTICS PIE CHART SECTION --- */}
<div className="bg-[#12141f] border border-gray-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
  <div className="flex justify-between items-center mb-2">
    <div>
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
        Revenue Analytics
      </h3>
      <p className="text-white text-lg font-bold">
        Total: ₹
        {appointments
          ? appointments
              .filter((item) => !item.cancelled && (item.isCompleted || item.payment))
              .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
          : 0}
      </p>
    </div>
  </div>

  {/* SVG Pie Chart */}
  <div className="relative flex items-center justify-center my-4">
    {(() => {
      // 1. Calculate revenue grouped by specialty
      const validBookings = (appointments || []).filter(
        (item) => !item.cancelled && (item.isCompleted || item.payment)
      );

      const specialtyMap = {};
      let totalRev = 0;

      validBookings.forEach((item) => {
        const docSpecialty = item.docData?.speciality || "General";
        const amt = Number(item.amount) || 0;
        specialtyMap[docSpecialty] = (specialtyMap[docSpecialty] || 0) + amt;
        totalRev += amt;
      });

      const slices = Object.entries(specialtyMap).map(([specialty, amt]) => ({
        specialty,
        amount: amt,
        percentage: totalRev > 0 ? (amt / totalRev) * 100 : 0,
      }));

      // Fallback colors for categories
      const palette = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4"];

      if (totalRev === 0 || slices.length === 0) {
        return (
          <div className="h-44 flex items-center justify-center text-gray-500 text-sm">
            No realized revenue recorded yet
          </div>
        );
      }

      // 2. Render Single Slice (100%) vs. Multi-Slice SVG
      if (slices.length === 1) {
        return (
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 200 200" className="w-44 h-44 overflow-visible">
              <circle cx="100" cy="100" r="75" fill={palette[0]} />
              <text
                x="100"
                y="100"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                className="text-sm font-bold select-none"
              >
                100%
              </text>
            </svg>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: palette[0] }} />
              <span className="text-gray-300 text-xs">{slices[0].specialty}</span>
            </div>
          </div>
        );
      }

      // 3. Multi-Slice Rendering with cumulative angles
      let cumulativePercent = 0;
      const getCoordinatesForPercent = (percent) => {
        const x = 100 + 75 * Math.cos(2 * Math.PI * percent);
        const y = 100 + 75 * Math.sin(2 * Math.PI * percent);
        return [x, y];
      };

      return (
        <div className="flex flex-col items-center w-full">
          <svg viewBox="0 0 200 200" className="w-44 h-44 overflow-visible">
            {slices.map((slice, idx) => {
              const startPercent = cumulativePercent;
              cumulativePercent += slice.percentage / 100;
              const endPercent = cumulativePercent;

              const [startX, startY] = getCoordinatesForPercent(startPercent);
              const [endX, endY] = getCoordinatesForPercent(endPercent);
              const largeArcFlag = slice.percentage > 50 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${startX} ${startY}`,
                `A 75 75 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`,
              ].join(" ");

              // Midpoint coordinate for text label
              const midPercent = (startPercent + endPercent) / 2;
              const [labelX, labelY] = [
                100 + 45 * Math.cos(2 * Math.PI * midPercent),
                100 + 45 * Math.sin(2 * Math.PI * midPercent),
              ];

              return (
                <g key={idx}>
                  <path d={pathData} fill={palette[idx % palette.length]} />
                  {slice.percentage >= 10 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      className="text-xs font-semibold select-none"
                    >
                      {Math.round(slice.percentage)}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {slices.map((slice, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: palette[idx % palette.length] }}
                />
                <span className="text-gray-300 text-xs">{slice.specialty}</span>
              </div>
            ))}
          </div>
        </div>
      );
    })()}
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
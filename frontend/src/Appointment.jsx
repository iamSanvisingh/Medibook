import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { assets } from './assets/assets'
import RelatedDoctors from './components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const doc = doctors.find((doc) => doc._id === docId)
    if (doc) {
      setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
    }
  }

  const getAvailableSlots = () => {
    if (!docInfo) return
    setDocSlots([])

    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      const timeSlots = []

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const slotDate = `${day}_${month}_${year}`
        const slotTime = formattedTime

        const isSlotAvailable =
          !docInfo?.slots_booked?.[slotDate] ||
          !docInfo.slots_booked[slotDate].includes(slotTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots((prev) => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {

    if (!token) {
      toast.warning('Login to book appointment')
      return navigate('/login')
    }

    if (!slotTime) {
      toast.warning('Please select a time slot')
      return
    }

    const date = docSlots[slotIndex][0].datetime

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = day + "_" + month + "_" + year

    try {

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  return (
    docInfo && (
      <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8'>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>

          {/* LEFT — doctor info (2/3 width) */}
          <div className='lg:col-span-2 rounded-2xl overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
            <div className='flex flex-col sm:flex-row gap-6 p-6'>
              <img
                className='w-full sm:w-48 h-48 object-cover rounded-xl bg-primary-light dark:bg-primary/10 flex-shrink-0'
                src={docInfo.image}
                alt=""
              />
              <div className='flex-1'>
                <p className='flex items-center gap-2 text-2xl font-semibold text-ink dark:text-dark-ink'>
                  {docInfo.name} <img src={assets.verified_icon} alt="" className='w-5' />
                </p>
                <div className='flex items-center gap-2 mt-1 text-muted dark:text-dark-muted'>
                  <p>{docInfo.degree} — {docInfo.speciality}</p>
                  <span className='py-0.5 px-2 text-xs rounded-full border border-border dark:border-dark-border'>
                    {docInfo.experience}
                  </span>
                </div>

                <div className='mt-4'>
                  <p className='flex items-center gap-1 text-sm font-medium text-ink dark:text-dark-ink'>
                    About <img src={assets.info_icon} alt="" className='w-3.5 opacity-60 dark:invert' />
                  </p>
                  <p className='text-sm text-muted dark:text-dark-muted mt-1 leading-relaxed'>{docInfo.about}</p>
                </div>

                <p className='text-ink dark:text-dark-ink font-medium mt-4'>
                  Appointment fee: <span className='text-primary font-semibold'>{currencySymbol}{docInfo.fees}</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — sticky booking panel (1/3 width) */}
          <div className='lg:col-span-1 lg:sticky lg:top-24 rounded-2xl p-6 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
            <p className='text-xs font-medium uppercase tracking-wide text-muted dark:text-dark-muted'>Book Appointment</p>
            <p className='text-lg font-semibold text-ink dark:text-dark-ink'>{docInfo.name}</p>
            <p className='text-sm text-muted dark:text-dark-muted mb-4'>{docInfo.speciality}</p>

            {/* Day strip */}
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {docSlots.length > 0 &&
                docSlots.map((item, index) => (
                  <div
                    onClick={() => setSlotIndex(index)}
                    key={index}
                    className={`text-center py-2.5 px-3 min-w-14 rounded-xl cursor-pointer flex-shrink-0 transition-all ${
                      slotIndex === index
                        ? 'bg-primary text-white'
                        : 'border border-border dark:border-dark-border text-ink dark:text-dark-ink hover:border-primary'
                    }`}
                  >
                    <p className='text-[10px] font-medium'>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p className='text-sm font-semibold'>{item[0] && item[0].datetime.getDate()}</p>
                  </div>
                ))}
            </div>

            {/* Time slot grid */}
            <p className='text-xs font-medium uppercase tracking-wide text-muted dark:text-dark-muted mt-5 mb-2'>
              Available times
            </p>
            <div className='grid grid-cols-3 gap-2'>
              {docSlots.length > 0 &&
                docSlots[slotIndex] &&
                docSlots[slotIndex].map((item, index) => (
                  <button
                    onClick={() => setSlotTime(item.time)}
                    key={index}
                    className={`text-xs font-medium py-2 rounded-lg transition-all ${
                      item.time === slotTime
                        ? 'bg-primary-light dark:bg-primary/20 border border-primary text-primary'
                        : 'border border-border dark:border-dark-border text-muted dark:text-dark-muted hover:border-primary'
                    }`}
                  >
                    {item.time.toLowerCase()}
                  </button>
                ))}
              {docSlots.length > 0 && docSlots[slotIndex] && docSlots[slotIndex].length === 0 && (
                <p className='col-span-3 text-sm text-muted dark:text-dark-muted'>No slots left for this day</p>
              )}
            </div>

            <button
              onClick={bookAppointment}
              className='w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-3 rounded-full mt-5 transition-all'
            >
              Confirm booking · {currencySymbol}{docInfo.fees}
            </button>
            <p className='text-xs text-center text-muted dark:text-dark-muted mt-3'>
              Free cancellation up to 24 hours before your visit
            </p>
          </div>

        </div>

        {/* Related Doctors */}
        <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
      </div>
    )
  )
}

export default Appointment
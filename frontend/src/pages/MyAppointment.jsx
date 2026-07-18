import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [payment, setPayment] = useState('')

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month)]} ${year}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      setAppointments(data.appointments.reverse())
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response)
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
          if (data.success) {
            navigate('/my-appointments')
            getUserAppointments()
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])


  return (
    <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8'>
      <p className='pb-3 mt-4 text-lg font-medium text-ink dark:text-dark-ink border-b border-border dark:border-dark-border'>
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            key={index}
            className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-5 border-b border-border dark:border-dark-border items-start'
          >
            <img className='w-36 rounded-xl bg-primary-light dark:bg-primary/10 object-cover' src={item.docData.image} alt="" />

            <div className='flex-1 text-sm text-muted dark:text-dark-muted'>
              <p className='text-ink dark:text-dark-ink text-base font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-ink dark:text-dark-ink font-medium mt-1'>Address:</p>
              <p>{item.docData.address.line1}</p>
              <p>{item.docData.address.line2}</p>
              <p className='mt-1'>
                <span className='text-ink dark:text-dark-ink font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            <div className='flex flex-col gap-2 justify-end text-sm text-center'>
              {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                <button
                  onClick={() => setPayment(item._id)}
                  className='sm:min-w-48 py-2 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-ink hover:bg-primary hover:text-white hover:border-primary transition-all duration-300'
                >
                  Pay Online
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className='sm:min-w-48 py-2 rounded-lg border border-border dark:border-dark-border hover:bg-surface dark:hover:bg-dark-surface transition-all duration-300 flex items-center justify-center'
                >
                  <img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" />
                </button>
              )}
              {!item.cancelled && item.payment && !item.isCompleted && (
                <span className='sm:min-w-48 py-2 rounded-lg text-primary bg-primary-light dark:bg-primary/15 font-medium'>
                  Paid
                </span>
              )}

              {item.isCompleted && (
                <span className='sm:min-w-48 py-2 rounded-lg border border-success text-success font-medium'>
                  Completed
                </span>
              )}

              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='sm:min-w-48 py-2 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-ink hover:bg-danger hover:text-white hover:border-danger transition-all duration-300'
                >
                  Cancel appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <span className='sm:min-w-48 py-2 rounded-lg border border-danger text-danger font-medium'>
                  Appointment cancelled
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments
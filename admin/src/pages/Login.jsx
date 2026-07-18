import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import ThemeToggle from '../components/ThemeToggle'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Admin') {

        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
        } else {
          toast.error(data.message)
        }

      } else {

        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
        } else {
          toast.error(data.message)
        }

      }
    } catch (error) {
      // Handles the case where the backend rejects the request with a
      // non-2xx status (like 401) instead of returning 200 with
      // { success: false } — axios throws for those, so without this
      // catch the rejection goes unhandled and nothing shows on screen.
      const message = error.response?.data?.message || 'Invalid credentials'
      toast.error(message)
    }

  }

  return (
    <div className='min-h-screen bg-surface dark:bg-dark-surface relative'>
      <div className='absolute top-5 right-5'>
        <ThemeToggle />
      </div>
      <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 rounded-xl text-sm shadow-lg bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
          <p className='text-2xl font-semibold m-auto text-ink dark:text-dark-ink'>
            <span className='text-primary'>{state}</span> Login
          </p>
          <div className='w-full'>
            <p className='text-muted dark:text-dark-muted text-sm mb-1'>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary/40'
              type="email"
              required
            />
          </div>
          <div className='w-full'>
            <p className='text-muted dark:text-dark-muted text-sm mb-1'>Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary/40'
              type="password"
              required
            />
          </div>
          <button className='bg-primary hover:bg-primary-dark transition-colors text-white w-full py-2 rounded-lg text-base font-medium'>
            Login
          </button>
          {
            state === 'Admin'
              ? <p className='text-muted dark:text-dark-muted'>Doctor Login? <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'>Click here</span></p>
              : <p className='text-muted dark:text-dark-muted'>Admin Login? <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'>Click here</span></p>
          }
        </div>
      </form>
    </div>
  )
}

export default Login
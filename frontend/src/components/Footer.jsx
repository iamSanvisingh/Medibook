import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-card dark:bg-dark-card border-t border-border dark:border-dark-border'>

      <div className='px-6 md:px-16 py-12 grid grid-cols-1 md:grid-cols-3 gap-10'>

        <div>
          <div className='flex items-center gap-2 mb-4'>
            <img src={assets.logo} className='w-8' alt='' />
            <span className='text-lg font-semibold text-primary'>MediBook</span>
          </div>
          <p className='text-sm leading-relaxed text-muted dark:text-dark-muted'>
            Making healthcare more accessible by simplifying the process of booking doctor appointments. Trusted by patients across India.
          </p>
        </div>

        <div>
          <p className='text-sm font-semibold mb-4 uppercase tracking-wider text-primary'>Company</p>
          <ul className='flex flex-col gap-3'>
            {['Home', 'About Us', 'Contact Us', 'Privacy Policy'].map(link => (
              <li key={link} className='text-sm cursor-pointer transition-colors text-muted dark:text-dark-muted hover:text-primary'>
                {link}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className='text-sm font-semibold mb-4 uppercase tracking-wider text-primary'>Get in Touch</p>
          <ul className='flex flex-col gap-3'>
            <li className='text-sm text-muted dark:text-dark-muted'>+91 00000 00000</li>
            <li className='text-sm text-muted dark:text-dark-muted'>medibook@email.com</li>
          </ul>
        </div>
      </div>

      <div className='px-6 md:px-16 py-4 flex flex-col md:flex-row items-center justify-between gap-2 border-t border-border dark:border-dark-border'>
        <p className='text-xs text-muted dark:text-dark-muted'>
          © 2025 MediBook. All rights reserved.
        </p>
        <div className='flex gap-6'>
          {['Terms', 'Privacy', 'Cookies'].map(item => (
            <span key={item} className='text-xs cursor-pointer transition-colors text-muted dark:text-dark-muted hover:text-primary'>
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
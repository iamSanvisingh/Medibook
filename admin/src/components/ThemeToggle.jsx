import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className='relative w-14 h-7 rounded-full flex items-center px-1 transition-colors duration-200'
      style={{ background: isDark ? '#5B5FEF' : '#E7EAF0' }}
    >
      <span
        className='w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm transition-transform duration-200'
        style={{ transform: isDark ? 'translateX(26px)' : 'translateX(0)' }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default ThemeToggle
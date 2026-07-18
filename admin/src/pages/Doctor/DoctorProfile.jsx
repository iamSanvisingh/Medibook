import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {

    const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
    const { currency } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)

    const inputClass = 'bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg px-2 py-1 text-ink dark:text-dark-ink outline-none focus:ring-2 focus:ring-primary/40'

    const updateProfile = async () => {
        try {
            const updateData = {
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

            setIsEdit(false)

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    return profileData && (
        <div className='m-5'>
            <div className='flex flex-col sm:flex-row gap-4'>
                <img className='w-full sm:max-w-64 h-64 object-cover rounded-xl bg-primary-light dark:bg-primary/10' src={profileData.image} alt="" />

                <div className='flex-1 rounded-xl p-8 py-7 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>

                    <p className='flex items-center gap-2 text-3xl font-medium text-ink dark:text-dark-ink'>{profileData.name}</p>
                    <div className='flex items-center gap-2 mt-1 text-muted dark:text-dark-muted'>
                        <p>{profileData.degree} — {profileData.speciality}</p>
                        <span className='py-0.5 px-2 border border-border dark:border-dark-border text-xs rounded-full'>{profileData.experience}</span>
                    </div>

                    <div className='mt-4'>
                        <p className='text-sm font-medium text-ink dark:text-dark-ink'>About</p>
                        {isEdit ? (
                            <textarea
                                onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                                className={`w-full mt-1 ${inputClass}`}
                                rows={6}
                                value={profileData.about}
                            />
                        ) : (
                            <p className='text-sm text-muted dark:text-dark-muted max-w-[700px] mt-1 leading-relaxed'>{profileData.about}</p>
                        )}
                    </div>

                    <p className='text-ink dark:text-dark-ink font-medium mt-4'>
                        Appointment fee: <span className='text-primary font-semibold'>
                            {currency} {isEdit
                                ? <input type='number' className={`${inputClass} w-24`} onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} />
                                : profileData.fees}
                        </span>
                    </p>

                    <div className='flex gap-2 py-3 text-muted dark:text-dark-muted'>
                        <p className='text-ink dark:text-dark-ink'>Address:</p>
                        <p className='text-sm'>
                            {isEdit ? (
                                <input type='text' className={`${inputClass} mb-1`} onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} />
                            ) : profileData.address.line1}
                            <br />
                            {isEdit ? (
                                <input type='text' className={inputClass} onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} />
                            ) : profileData.address.line2}
                        </p>
                    </div>

                    <div className='flex items-center gap-2 pt-2 text-ink dark:text-dark-ink'>
                        <input
                            type="checkbox"
                            className='accent-primary'
                            onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                            checked={profileData.available}
                        />
                        <label>Available</label>
                    </div>

                    {isEdit ? (
                        <button onClick={updateProfile} className='px-5 py-1.5 bg-primary text-white text-sm rounded-full mt-5 hover:bg-primary-dark transition-all'>
                            Save
                        </button>
                    ) : (
                        <button onClick={() => setIsEdit(prev => !prev)} className='px-5 py-1.5 border border-primary text-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>
                            Edit
                        </button>
                    )}

                </div>
            </div>
        </div>
    )
}

export default DoctorProfile
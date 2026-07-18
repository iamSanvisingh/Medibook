import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    const inputClass = 'bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg px-2 py-1 text-ink dark:text-dark-ink'

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData()
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return userData ? (
        <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8'>
        <div className='max-w-lg flex flex-col gap-2 text-sm rounded-2xl bg-card dark:bg-dark-card border border-border dark:border-dark-border p-6'>

            {isEdit ? (
                <label htmlFor='image'>
                    <div className='inline-block relative cursor-pointer'>
                        <img className='w-36 h-36 object-cover rounded-full opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                        <img className='w-8 absolute bottom-2 right-2' src={image ? '' : assets.upload_icon} alt="" />
                    </div>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </label>
            ) : (
                <img className='w-36 h-36 object-cover rounded-full' src={userData.image} alt="" />
            )}

            {isEdit ? (
                <input
                    className={`${inputClass} text-2xl font-medium max-w-60 mt-3`}
                    type="text"
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    value={userData.name}
                />
            ) : (
                <p className='font-medium text-2xl text-ink dark:text-dark-ink mt-3'>{userData.name}</p>
            )}

            <hr className='border-border dark:border-dark-border my-2' />

            <div>
                <p className='text-primary text-xs font-semibold uppercase tracking-wide'>Contact Information</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-muted dark:text-dark-muted'>
                    <p className='font-medium text-ink dark:text-dark-ink'>Email id:</p>
                    <p className='text-primary'>{userData.email}</p>

                    <p className='font-medium text-ink dark:text-dark-ink'>Phone:</p>
                    {isEdit ? (
                        <input className={`${inputClass} max-w-52`} type="text"
                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                            value={userData.phone}
                        />
                    ) : (
                        <p className='text-primary'>{userData.phone}</p>
                    )}

                    <p className='font-medium text-ink dark:text-dark-ink'>Address:</p>
                    {isEdit ? (
                        <p>
                            <input className={`${inputClass} mb-1.5`} type="text"
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    address: { ...(prev.address || {}), line1: e.target.value }
                                }))}
                                value={userData.address?.line1 || ''}
                            />
                            <br />
                            <input className={inputClass} type="text"
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    address: { ...(prev.address || {}), line2: e.target.value }
                                }))}
                                value={userData.address?.line2 || ''}
                            />
                        </p>
                    ) : (
                        <p>{userData.address?.line1} <br /> {userData.address?.line2}</p>
                    )}
                </div>
            </div>

            <div className='mt-4'>
                <p className='text-primary text-xs font-semibold uppercase tracking-wide'>Basic Information</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-muted dark:text-dark-muted'>
                    <p className='font-medium text-ink dark:text-dark-ink'>Gender:</p>
                    {isEdit ? (
                        <select className={`${inputClass} max-w-24`}
                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                            value={userData.gender}
                        >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    ) : (
                        <p>{userData.gender}</p>
                    )}

                    <p className='font-medium text-ink dark:text-dark-ink'>Birthday:</p>
                    {isEdit ? (
                        <input className={`${inputClass} max-w-32`} type='date'
                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                            value={userData.dob}
                        />
                    ) : (
                        <p>{userData.dob}</p>
                    )}
                </div>
            </div>

            <div className='mt-8'>
                {isEdit ? (
                    <button onClick={updateUserProfileData} className='border border-primary bg-primary text-white px-8 py-2 rounded-full hover:bg-primary-dark transition-all'>
                        Save information
                    </button>
                ) : (
                    <button onClick={() => setIsEdit(true)} className='border border-primary text-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>
                        Edit
                    </button>
                )}
            </div>
        </div>
        </div>
    ) : (
        <div className='bg-surface dark:bg-dark-surface min-h-screen px-6 md:px-16 py-8 flex items-center justify-center'>
            <div className='flex flex-col items-center gap-3 text-muted dark:text-dark-muted'>
                <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                <p className='text-sm'>Loading your profile...</p>
            </div>
        </div>
    )
}

export default MyProfile
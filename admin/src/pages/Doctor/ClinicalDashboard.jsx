import React, { useContext, useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { DoctorContext } from '../../context/DoctorContext'
import { ThemeContext } from '../../context/ThemeContext'

const statusStyles = {
  HIGH: 'bg-danger-bg dark:bg-danger/15 text-danger border-danger/20',
  CRITICAL: 'bg-danger-bg dark:bg-danger/15 text-danger border-danger/20',
  LOW: 'bg-pending-bg dark:bg-pending/15 text-pending border-pending/20',
  NORMAL: 'bg-success-bg dark:bg-success/15 text-success border-success/20',
}

const ClinicalDashboard = () => {
  const { dToken, backendUrl, appointments, getAppointments } = useContext(DoctorContext)
  const { theme } = useContext(ThemeContext)

  const [queue, setQueue] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadAppointmentId, setUploadAppointmentId] = useState('')
  const authHeader = { headers: { Authorization: `Bearer ${dToken}` } }
  const [activeTab, setActiveTab] = useState('overview')
  const [prescriptions, setPrescriptions] = useState([])
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const [rxNotes, setRxNotes] = useState('')
  const [savingRx, setSavingRx] = useState(false)

  // Cross-database join: Postgres gives us patientId (a Mongo _id as a
  // plain string); Mongo appointments already carry the full userData
  // object. We build a lookup map once so selecting a queue item is O(1)
  // instead of re-scanning appointments on every click.
  const patientLookup = useMemo(() => {
    const map = {}
    appointments.forEach(a => {
      if (a.userData?._id) map[a.userData._id] = a.userData
    })
    return map
  }, [appointments])

  const fetchQueue = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/clinical/triage', authHeader)
      if (data.success) {
        setQueue(data.queue)
        if (data.queue.length > 0) {
          selectReport(data.queue[0].reportId)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!uploadAppointmentId) {
      alert('Select a patient/appointment first')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('report', file)
      formData.append('appointmentId', uploadAppointmentId)

      const { data } = await axios.post(backendUrl + '/api/clinical/report/upload', formData, authHeader)
      if (data.success) {
        alert('Uploaded — text extracted. AI parsing comes next.')
        fetchQueue()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.log(error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const [parsing, setParsing] = useState(false)

  const handleParse = async () => {
    if (!selectedReport) return
    setParsing(true)
    try {
      const { data } = await axios.post(
       backendUrl + '/api/clinical/report/' + selectedReport.id + '/parse',
        {},
        authHeader
      )
      if (data.success) {
        setSelectedReport(data.report)
        fetchQueue()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.log(error)
      alert('AI parsing failed')
    } finally {
      setParsing(false)
    }
  }

  const selectReport = async (reportId) => {
    setLoadingReport(true)
    try {
      const { data } = await axios.get(backendUrl + '/api/clinical/report/' + reportId, authHeader)
      if (data.success) {
        setSelectedReport(data.report)
        fetchPrescriptions(data.report.patientId)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingReport(false)
    }
  }

  const fetchPrescriptions = async (patientId) => {
    try {
      const { data } = await axios.get(backendUrl + '/api/prescription/patient/' + patientId)
      if (data.success) setPrescriptions(data.prescriptions)
    } catch (error) {
      console.log(error)
    }
  } 

  const updateMedication = (index, field, value) => {
    setMedications(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const addMedicationRow = () => {
    setMedications(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removeMedicationRow = (index) => {
    setMedications(prev => prev.filter((_, i) => i !== index))
  }

  const submitPrescription = async () => {
    const validMeds = medications.filter(m => m.name && m.dosage && m.frequency && m.duration)
    if (validMeds.length === 0) {
      alert('Add at least one complete medication (name, dosage, frequency, duration)')
      return
    }
    setSavingRx(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/prescription/create', {
        appointmentId: selectedReport.appointmentId,
        medications: validMeds,
        notes: rxNotes,
      }, authHeader)
      if (data.success) {
        setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
        setRxNotes('')
        fetchPrescriptions(selectedReport.patientId)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.log(error)
      alert('Failed to save prescription')
    } finally {
      setSavingRx(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      getAppointments()
      fetchQueue()
    }
  }, [dToken])

  const patient = selectedReport ? patientLookup[selectedReport.patientId] : null

  return (
    <div className='p-6 min-h-screen w-full bg-surface dark:bg-dark-surface'>

      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-ink dark:text-dark-ink'>Clinical Dashboard</h1>
        <p className='text-sm mt-1 text-muted dark:text-dark-muted'>AI-assisted lab report review</p>
      </div>

      {/* Upload New Report — independent of the triage queue, since a doctor
      needs to be able to attach a FIRST report to an appointment that has
      no lab data yet at all */}
      <div className='rounded-xl p-5 mb-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
        <p className='font-medium text-sm text-ink dark:text-dark-ink mb-3'>Upload New Lab Report</p>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
            <select
              value={uploadAppointmentId}
              onChange={(e) => setUploadAppointmentId(e.target.value)}
              className='flex-1 text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40'
            >
            <option value=''>Select patient / appointment...</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.userData?.name} — {a.slotDate} {a.slotTime}
                </option>
              ))}
            </select>

            <label className={`flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
              uploadAppointmentId
              ? 'cursor-pointer bg-primary hover:bg-primary-dark text-white'
              : 'cursor-not-allowed bg-border dark:bg-dark-border text-muted dark:text-dark-muted'
            }`}>
            {uploading ? 'Uploading...' : '+ Upload PDF'}
            <input
              type='file'
              accept='.pdf'
              onChange={handleUpload}
              disabled={uploading || !uploadAppointmentId}
              hidden
            />
            </label>
          </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-5 items-start'>

        {/* Triage Queue */}
        <div className='lg:col-span-1 rounded-xl overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-border dark:border-dark-border'>
            <p className='font-medium text-sm text-ink dark:text-dark-ink'>Triage Queue</p>
            <span className='text-xs px-2 py-0.5 rounded-full bg-primary-light dark:bg-primary/15 text-primary font-medium'>
              {queue.length}
            </span>
          </div>
          <div>
            {queue.length === 0 && (
              <p className='text-sm text-muted dark:text-dark-muted p-5'>No flagged reports yet</p>
            )}
            {queue.map((item) => {
              const p = patientLookup[item.patientId]
              const isActive = selectedReport?.id === item.reportId
              return (
                <div
                  key={item.reportId}
                  onClick={() => selectReport(item.reportId)}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer border-b border-border dark:border-dark-border last:border-b-0 transition-colors ${
                    isActive ? 'bg-primary-light dark:bg-primary/10' : 'hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                >
                  {p?.image ? (
                    <img src={p.image} className='w-9 h-9 rounded-full object-cover flex-shrink-0' alt='' />
                  ) : (
                    <div className='w-9 h-9 rounded-full bg-primary-light dark:bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0'>
                      {p?.name?.slice(0, 2).toUpperCase() || '??'}
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-ink dark:text-dark-ink'}`}>
                      {p?.name || 'Unknown patient'}
                    </p>
                  </div>
                  <span className='text-xs px-2 py-0.5 rounded-full bg-danger-bg dark:bg-danger/15 text-danger flex-shrink-0'>
                    {item.flagCount} flags
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main panel */}
        <div className='lg:col-span-3 flex flex-col gap-5'>

          {loadingReport && (
            <div className='rounded-xl p-8 text-center bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
              <p className='text-sm text-muted dark:text-dark-muted'>Loading report...</p>
            </div>
          )}

          {!loadingReport && selectedReport && (
            <>
              {/* Patient header */}
              <div className='rounded-xl p-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
                <div className='flex items-start justify-between flex-wrap gap-4'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <p className='text-lg font-semibold text-ink dark:text-dark-ink'>
                        {patient?.name || 'Unknown patient'}
                      </p>
                      <span className='text-xs px-2 py-0.5 rounded-full bg-pending-bg dark:bg-pending/15 text-pending font-medium'>
                        IN PROGRESS
                      </span>
                    </div>
                    {selectedReport.chiefComplaint && (
                      <p className='text-sm text-muted dark:text-dark-muted mt-2 max-w-lg'>
                        {selectedReport.chiefComplaint}
                      </p>
                    )}
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {selectedReport.allergies?.map((a, i) => (
                        <span key={i} className='text-xs px-3 py-1 rounded-full bg-danger-bg dark:bg-danger/15 text-danger'>
                          {a}
                        </span>
                      ))}
                      {selectedReport.familyHistory?.map((f, i) => (
                        <span key={i} className='text-xs px-3 py-1 rounded-full bg-pending-bg dark:bg-pending/15 text-pending'>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stat chips */}
                  <div className='flex gap-3 flex-shrink-0'>
                    <div className='text-center px-4 py-2 rounded-lg bg-surface dark:bg-dark-surface border border-border dark:border-dark-border'>
                      <p className='text-lg font-semibold text-ink dark:text-dark-ink'>
                        {selectedReport.biomarkers.filter(b => b.status !== 'NORMAL').length}
                      </p>
                      <p className='text-xs text-muted dark:text-dark-muted'>Flags</p>
                    </div>
                    <div className='text-center px-4 py-2 rounded-lg bg-surface dark:bg-dark-surface border border-border dark:border-dark-border'>
                      <p className='text-lg font-semibold text-ink dark:text-dark-ink'>
                        {selectedReport.biomarkers.length}
                      </p>
                      <p className='text-xs text-muted dark:text-dark-muted'>Markers</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReport.status === 'parsing' && (
                <div className='rounded-xl p-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border flex items-center justify-between'>
                  <p className='text-sm text-muted dark:text-dark-muted'>
                    Report text extracted — ready for AI analysis.
                  </p>
                  <button
                    onClick={handleParse}
                    disabled={parsing}
                    className='px-5 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-dark text-white transition-all disabled:opacity-50'
                    >
                    {parsing ? 'Analyzing...' : '✦ Analyze with AI'}
                  </button>
                </div>
              )}

              {/* Tab bar */}
              <div className='flex gap-1 p-1 rounded-lg bg-surface dark:bg-dark-surface border border-border dark:border-dark-border w-fit'>
                {['overview', 'prescription'].map(tab => (
                <button
                 key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                  ? 'bg-primary text-white'
                  : 'text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink'
                }`}
                >
                  {tab}
                </button>
                ))}
              </div>

              {/* Biomarker Disruption + AI Summary */}
              {activeTab === 'overview' && (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>

                <div className='rounded-xl overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-danger'>
                  <div className='px-5 py-4 border-b border-border dark:border-dark-border'>
                    <p className='font-medium text-sm text-ink dark:text-dark-ink'>Biomarker Disruption</p>
                  </div>
                  <div className='p-4 flex flex-col gap-3'>
                    {selectedReport.biomarkers.map((b) => (
                      <div
                        key={b.id}
                        className='flex items-center justify-between p-3 rounded-lg bg-surface dark:bg-dark-surface'
                      >
                        <div>
                          <p className='text-sm font-medium text-ink dark:text-dark-ink'>{b.name}</p>
                          {(b.refLow != null && b.refHigh != null) && (
                            <p className='text-xs text-muted dark:text-dark-muted'>
                              Ref: {b.refLow}–{b.refHigh} {b.unit}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center gap-3'>
                          <p className='text-sm font-semibold text-ink dark:text-dark-ink'>
                            {b.value} <span className='text-xs font-normal text-muted dark:text-dark-muted'>{b.unit}</span>
                          </p>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusStyles[b.status]}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='rounded-xl overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border border-t-[3px] border-t-primary'>
                  <div className='px-5 py-4 border-b border-border dark:border-dark-border'>
                    <p className='font-medium text-sm text-ink dark:text-dark-ink'>AI Executive Summary</p>
                  </div>
                  <div className='p-5 flex flex-col gap-4'>
                    <p className='text-sm text-muted dark:text-dark-muted leading-relaxed'>
                      {selectedReport.aiSummary || 'No summary available for this report yet.'}
                    </p>

                    {selectedReport.riskTags?.length > 0 && (
                      <div>
                        <p className='text-xs font-medium uppercase tracking-wide text-muted dark:text-dark-muted mb-2'>
                          Risk Assessment
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {selectedReport.riskTags.map((tag, i) => (
                            <span key={i} className='text-xs px-3 py-1 rounded-full bg-pending-bg dark:bg-pending/15 text-pending'>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.recommendedActions?.length > 0 && (
                      <div>
                        <p className='text-xs font-medium uppercase tracking-wide text-muted dark:text-dark-muted mb-2'>
                          Recommended Actions
                        </p>
                        <ul className='flex flex-col gap-1.5'>
                          {selectedReport.recommendedActions.map((action, i) => (
                            <li key={i} className='text-sm text-ink dark:text-dark-ink flex items-start gap-2'>
                              <span className='text-primary mt-1'>•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              )}
              {activeTab === 'prescription' && (
              <div className='flex flex-col gap-5'>

                {/* New prescription form */}
                <div className='rounded-xl p-5 bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
                  <p className='font-medium text-sm text-ink dark:text-dark-ink mb-4'>Write Prescription</p>

                  <div className='flex flex-col gap-3'>
                  {medications.map((med, i) => (
                    <div key={i} className='grid grid-cols-1 sm:grid-cols-[2fr_1fr_1.5fr_1fr_2fr_auto] gap-2 items-center'>
                      <input placeholder='Medicine name' value={med.name} onChange={e => updateMedication(i, 'name', e.target.value)}
                        className='min-w-0 text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40' />
                      <input placeholder='Dosage' value={med.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)}
                        className='min-w-0 text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40' />
                      <input placeholder='Frequency' value={med.frequency} onChange={e => updateMedication(i, 'frequency', e.target.value)}
                        className='min-w-0 text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40' />
                      <input placeholder='Duration' value={med.duration} onChange={e => updateMedication(i, 'duration', e.target.value)}
                        className='min-w-0 text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40' />
                      <input placeholder='Instructions (optional)' value={med.instructions} onChange={e => updateMedication(i, 'instructions', e.target.value)}
                        className='min-w-0 text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40' />
                      <button onClick={() => removeMedicationRow(i)} className='text-danger text-xs px-2 py-2 hover:bg-danger-bg dark:hover:bg-danger/15 rounded-lg transition-colors'>✕</button>
                    </div>
                  ))}

                  <button onClick={addMedicationRow} className='text-xs text-primary font-medium self-start hover:underline'>
                    + Add another medicine
                  </button>

                  <textarea
                    placeholder='Additional notes (optional)'
                    value={rxNotes}
                    onChange={e => setRxNotes(e.target.value)}
                    rows={2}
                    className='text-sm px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-primary/40 mt-2'
                  />

                  <button
                    onClick={submitPrescription}
                    disabled={savingRx}
                    className='self-start px-5 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-dark text-white transition-all disabled:opacity-50 mt-1'
                  >
                    {savingRx ? 'Saving...' : 'Save Prescription'}
                  </button>
                </div>
              </div>

              {/* Past prescriptions for this patient */}
              <div className='rounded-xl overflow-hidden bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
                <div className='px-5 py-4 border-b border-border dark:border-dark-border'>
                  <p className='font-medium text-sm text-ink dark:text-dark-ink'>Prescription History</p>
                </div>
                {prescriptions.length === 0 && (
                  <p className='text-sm text-muted dark:text-dark-muted p-5'>No prescriptions written yet for this patient.</p>
                )}
                <div className='flex flex-col'>
                  {prescriptions.map((rx) => (
                    <div key={rx._id} className='px-5 py-4 border-b border-border dark:border-dark-border last:border-b-0'>
                      <p className='text-xs text-muted dark:text-dark-muted mb-2'>
                        {new Date(rx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className='flex flex-col gap-1.5'>
                        {rx.medications.map((m, i) => (
                          <p key={i} className='text-sm text-ink dark:text-dark-ink'>
                            <span className='font-medium'>{m.name}</span> — {m.dosage}, {m.frequency}, {m.duration}
                            {m.instructions && <span className='text-muted dark:text-dark-muted'> ({m.instructions})</span>}
                          </p>
                        ))}
                      </div>
                      {rx.notes && <p className='text-xs text-muted dark:text-dark-muted mt-2 italic'>{rx.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {!loadingReport && !selectedReport && queue.length === 0 && (
            <div className='rounded-xl p-10 text-center bg-card dark:bg-dark-card border border-border dark:border-dark-border'>
              <p className='text-sm text-muted dark:text-dark-muted'>No lab reports have been flagged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClinicalDashboard
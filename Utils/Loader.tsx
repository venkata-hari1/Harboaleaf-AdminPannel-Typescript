import React from 'react'

export default function Loader() {
  return (
    <div
    className="bg-white rounded-circle p-1 position-fixed z-1 top-50 start-50 translate-middle d-flex justify-content-center align-items-center shadow"
    style={{ width: 'auto', height: 'auto' }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
  )
}

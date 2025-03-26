import React from 'react'

export default function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "30vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
    </div>
  )
}

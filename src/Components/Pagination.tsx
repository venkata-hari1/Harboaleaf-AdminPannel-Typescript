import React from 'react'
import '../Styles/Pagination.css';
const Pagination = () => {
  return (

    <div style={{width:'90%',marginTop:'30px'}}>
     <nav aria-label="Page navigation">
  <ul className="pagination pagination-sm d-flex justify-content-center">
    <li className="page-item me-2" style={{background:'#485562 !important'}}>
      <a className="page-link" id="lt1" href="#" aria-label="Previous">
        <span id="lt2"aria-hidden="true">&lt;</span>
      </a>
    </li>
    <li className="page-item me-2" style={{height:'20px !important'}}><a className="page-link text-primary" id="one" href="#" >1</a></li>
    <li className="page-item me-2" style={{height:'20px !important'}}><a className="page-link" href="#" >2</a></li>
    <li className="page-item me-2" style={{height:'20px !important'}}><a className="page-link" href="#" >...</a></li>
    <li className="page-item me-2" style={{height:'20px !important'}}><a className="page-link" href="#" >9</a></li>
    <li className="page-item me-2" style={{height:'20px !important'}}><a className="page-link" href="#" >10</a></li>
    <li className="page-item me-2">
      <a className="page-link" href="" aria-label="Next" >
        <span aria-hidden="true">&gt;</span>
      </a>
    </li>
  </ul>
</nav>

    </div>
  )
}

export default Pagination

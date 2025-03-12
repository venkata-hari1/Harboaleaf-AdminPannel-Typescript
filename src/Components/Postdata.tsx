import React from 'react'
import '../Styles/Postdata.css';
import post1 from '../assets/post1.png';
import post2 from '../assets/post2.jpg';
import post3 from '../assets/post3.jpg';

const Postdata = () => {
  
    const pvtdata=[
     
      {id:1,title:"Post"},
      {id:2,title:"Vibes"},
      {id:3,title:"Tag"}


    ]

    return (
    <div className='postbox-container'>
     <div className="post-container">
      <div className="post-data mt-3">
          {
            pvtdata.map(data=>(
             <ul key={data.id}>
               <li>{data.title}<span className='ms-4'>|</span></li> 
             </ul>  
           
            ))
          }
        </div>


        
       <div className="post-images-grid" >
       
         <div className="post-image">
            <img src={post1} width="287px" height="495px" />
            
          </div>
          <div className="post-image">
          
          <img src={post2} width="287px" height="495px" />
          </div>
          <div  className="post-image" >
          <img src={post3} width="287px" height="495px" />
          </div>
         
       </div>
       </div>
    </div>
  )
}

export default Postdata
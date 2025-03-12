import React from 'react'
import Profiledata from './Profiledata'
import Socialdata from './Socialdata'
import Postdata from './Postdata'

const Profileinformation = () => {
  return (
    <div className='container'>
        <Profiledata />
        <Socialdata />
        <Postdata />
    </div>
  )
}

export default Profileinformation
import React, { useEffect } from 'react'
import Profiledata from './Profiledata'
import Socialdata from './Socialdata'
import Postdata from './Postdata'
import { fetchSocialUser } from '../Redux/Reducers/UserMangement'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../Redux/store/Store'
import { useLocation } from 'react-router-dom'
import Loader from '../../Utils/Loader'


const Profileinformation = () => {
  const {socialUserLoading}=useSelector((state:RootState)=>state.UserMangment)
  const dispatch=useDispatch<AppDispatch>()
  const location=useLocation()
  const pathname: any = location?.pathname.split('/')[4]


  useEffect(() => {
    async function fetchData(){
    dispatch(fetchSocialUser(pathname));}
    fetchData()
  }, [dispatch]);
  if (socialUserLoading) {
    return <div><Loader/></div>;
  }
  return (
    <div className='container' style={{marginTop:'60px',marginBottom:'30px'}}>
        <Profiledata />
        <Socialdata />
        <Postdata />
    </div>
  )
}

export default Profileinformation
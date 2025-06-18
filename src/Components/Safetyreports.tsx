import React, { Fragment, useEffect, useState } from 'react';
import '../Styles/Safetyreports.css';
import Safetytable from './Safetytable';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { useDispatch, useSelector } from 'react-redux';
import { Victim_Info } from '../Redux/Reducers/UserMangement';
import moment from 'moment';

const Safetyreports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { victiminfo, loading }: any = useSelector((state: RootState) => state.UserMangment);

  const [rescuerName, setRescuerName] = useState('');
  const [rescuerImage, setRescuerImage] = useState('');
  const [rescueTime, setRescueTime] = useState('');
  const [rescueArea, setRescueArea] = useState('');
  const[type,setType]=useState('')
  const [id, setId] = useState('');
  useEffect(() => {
    setRescuerName(localStorage.getItem('rescuername') || '');
    setRescuerImage(localStorage.getItem('rescuerimage') || '');
    setRescueTime(localStorage.getItem('rescuetime') || '');
    setRescueArea(localStorage.getItem('rescuearea') || '');
    setType(localStorage.getItem('type') || '')
    setId(localStorage.getItem('id') || '');
  }, [type,rescuerImage,rescueArea, rescueTime, rescuerName]);

  useEffect(() => {
    if (id) {
      dispatch(Victim_Info({ data: { id } }));
    }
  }, [dispatch, id]);



  const safedata = [
    { id: 1, key: 'Gender', value: victiminfo?.user?.gender },
    { id: 2, key: 'Date of Birth', value: victiminfo?.user?.dateofbirth },
    {
      id: 3,
      key: 'Phone number',
      value: victiminfo?.user?.countryCode + '' + victiminfo?.user?.mobile,
    },
    { id: 4, key: 'Rescued By', value:rescuerName },
    { id: 5, key: 'Emergency Time and Date', value: rescueTime},
    { id: 6, key: 'Emergency Location', value: rescueArea},
  ];

  return (
    <div className="container">
      <div className="safety-reports-box">
        <div className="img-box">
          {victiminfo?.user?.victim?.image ? (
            <img src={victiminfo.user.victim.image} width="174px" height="213px" />
          ) : (
            <img
              src={`https://robohash.org/${victiminfo?.user?.rescuer?.firstname}?size=140x140`}
              alt="avatar"
              width="174px"
              height="213px"
            />
          )}
        </div>

        <div className="safety-titles">
          <div className="safety-names">
            <p>{victiminfo?.user?.victim?.firstname}</p>
            <p style={{ color: '#FF0000' }}>[{type}]</p>
          </div>

          {safedata.map((data) => (
            <div className="safety-data-box" key={data.id}>
              <p className="safety-key">
                {data.id === 5 || data.id === 6 ? (
                  <span style={{ color: '#FF0000' }}>{data.key}</span>
                ) : (
                  data.key
                )}
              </p>
              <p className="safety-value">
                {data.id === 4 && (
                  <Fragment>
                    {rescuerImage ? (
                      <img
                        src={rescuerImage}
                        alt="avatar"
                        className="rounded-circle me-2"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <img
                        src={`https://robohash.org/${victiminfo?.user?.rescuer?.firstname}?size=40x40`}
                        alt="avatar"
                        className="rounded-circle me-2"
                        width="30"
                        height="30"
                      />
                    )}
                  </Fragment>
                )}
                {data.value}
              </p>
            </div>
          ))}
        </div>

        <div className="reportchat">
          {/* <button className="download-chat">
            Download Chat Report <i className="bi bi-download ms-2"></i>
          </button> */}
        </div>
      </div>

      <div></div>
      <Safetytable victiminfo={victiminfo.reports} />
    </div>
  );
};

export default Safetyreports;

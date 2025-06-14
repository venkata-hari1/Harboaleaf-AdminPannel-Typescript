import React, { useState } from 'react';
import '../Styles/Admanagement.css';
import { useNavigate } from 'react-router-dom';

const Admanagement = () => {
  const navigate = useNavigate();
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const handleClick = (route: string, key: string) => {
    setClickedButton(key);
    setTimeout(() => {
      navigate(route);
    }, 200); // short delay for visual feedback
  };

  return (
    <div className='admanagment'>
      <div className='ad-container'>

        <div className='advertisement'>
          <button
            className={clickedButton === 'create' ? 'clicked' : ''}
            onClick={() => handleClick('userform', 'create')}
          >
            Create New Advertisement
          </button>
        </div>

        <div className='moniter-cmpg'>
          <button
            className={clickedButton === 'monitor' ? 'clicked' : ''}
            onClick={() => handleClick('/admin/moniter-compaign', 'monitor')}
          >
            Monitor Campaign
          </button>
        </div>

        

      </div>
    </div>
  );
};

export default Admanagement;

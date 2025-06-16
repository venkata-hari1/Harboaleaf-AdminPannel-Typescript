import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../Redux/store/Store';
import { Admin_Dashboard } from '../../Redux/Reducers/UserMangement';

import Loader from '../../../Utils/Loader';
import TotalInformation from './Charts/TotalInformation';
import PieChart from './Charts/PieChart';
import BarChart from './Charts/BarChart';

import './Charts/Styles.css';

function AdminDashBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const [initialLoading, setInitialLoading] = useState(true);
  const year = new Date().getFullYear(); // no need for state unless user changes it
  const firstLoad = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (firstLoad.current && !cancelled) {
        firstLoad.current = false;
        await dispatch(Admin_Dashboard({ data: { year } }));
        if (!cancelled) setInitialLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [dispatch, year]);

  return (
    <Fragment>
      {initialLoading ? (
        <Loader />
      ) : (
        <Fragment>
          <TotalInformation />
          <div className='root-container'>
            <div className="main-conatiner">
              <BarChart />
              <PieChart />
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

export default AdminDashBoard;

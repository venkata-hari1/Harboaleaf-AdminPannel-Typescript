import { Fragment } from 'react';
import PieChart from './Charts/PieChart';
import './Charts/Styles.css'
import TotalInformation from './Charts/TotalInformation';
import BarChart from './Charts/BarChart';
function AdminDashBoard() {
  return (
    <Fragment>
      <TotalInformation/>
      <div className='root-container'>
      <div className="main-conatiner">
      <BarChart />
    <PieChart/>
      </div>
      </div>
    </Fragment>
  );
}

export default AdminDashBoard

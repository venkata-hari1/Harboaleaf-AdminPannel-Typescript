import React from 'react'
import '../Styles/Userform.css';
import PreviewPopUp from './PreviewPopUp';

const Userform = () => {


  

  return (
   <div className="form-container">
    
       <div className='form-wrapper'>
       <div className='title-box1'>
        <label>Add Title</label>
        <input type="text" className='form-textbox'/>
       </div>

       <div className='admedia-box'>
        <label>Ad Media</label>
         <label htmlFor="file1" className='file1-class'>Attach<i className="bi bi-paperclip"></i></label>
         <input type="file" id="file1" className='file-box' />
         </div>
       <div className='desc-box'>
        <label>Add Description</label>
        <textarea></textarea>
       </div>

       <div className='call-action'>
        <label>Call To Action</label>
        <input type="text" className='call-action-textbox'/>
       </div>
       
       <div className='taget-box'> 
       <label>Target Location</label>
        <select name='select'>
          <option value="state">State</option>
        </select>
       </div>
       
       <div className='target-check'>
        <input type='checkbox'  className='target-check-input'/>
        <span className='ms-2' >All over india</span>
        </div>
        
        <div className='target-num'>
        <label>Target Age Range</label>
        <div>
        <input type='number' id="num1" className='target-num-input'/><span className='ms-2 mt-2'>Age <span className='me-2 mt-2'>&nbsp;to</span></span>
        <input type='number' id="num2" className='target-num-input'/><span className='ms-2 mt-2'> Age</span>  
        </div>
        </div>

        <div className='interest-box'>
        <label>Interest</label>
        <input type="text" className='interest-box-input' />
        </div>
        
         
        <div className='gender-box'>
         <label>Gender</label>
         <div>
         <input type='radio' name="gender" className='gender-box-input'/><span>Male</span>
         <input type='radio' name="gender" className='gender-box-input'/><span>Female</span>
         <input type='radio' name="gender" className='gender-box-input'/> <span>All</span>
         </div>
         </div>  

        <div className='budget-box'>
        <label>Daily Budget</label>
        <input type="number"  placeholder='Rs' className='budget-box-input'/>
        </div>

        <div className='date-box'>
           <label>Ad Duration</label>
           <div className='date-pick' >
            <input type='date' className='data-pick-input'/><span>
            <input type='date' className='data-pick-input'/></span>
           </div>
        </div>

        <div className='elimination-box'>
        <label>Eliminated Budget</label>
        <input type="number"  placeholder='Rs' className='eliminiation-box-input'/>
        </div>
         
        <div className='placing-box'>
         <label>Placing </label>
        <div>
         <input type='checkbox' className='placing-box-input'/><span className='ms-2 me-2'>Banner at the top</span>
         <input type='checkbox' className='placing-box-input'/><span className='ms-2 me-2'>Banner at the bottom</span>
         <input type='checkbox' className='placing-box-input'/><span className='ms-2 '></span>Mid scroll card placement         
         </div>
       </div>

       <div className='preview-box'>
        <label>Preview</label>
        <button className='preview-button'>view preview<i className="bi bi-eye-fill ms-2"></i></button>
       </div>


       
       <div className='buttons-ds'>
         <button className='discard-button'>Discard</button>
                  <button  className='submit-button'>Submit</button>
       </div>      

       </div>

   </div>
  )
}

export default Userform

import React from 'react';
import {useNavigate} from 'react-router-dom'

function Error({status, message}) {
  let navigate = useNavigate()
    return (
       <div className='error'>
         <h2>{status} error</h2>
         <p>{message}</p>
         <button onClick={() => {navigate("/feed")}}>Return</button>
       </div>
    );
}

export default Error;
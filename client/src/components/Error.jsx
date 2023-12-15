import React from 'react';

function Error({status, message}) {

    return (
       <div className='error'>
         <h2>{status} error</h2>
         <p>{message}</p>
       </div>
    );
}

export default Error;
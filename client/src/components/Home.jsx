import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';

function Home() {
  const {currentUser} = useContext(AuthContext);
  // console.log(currentUser);
  return (
    <div className='card'>
      <h2>
        Hello {currentUser && currentUser.displayName}, {currentUser.uid}, this is the Protected
        Home page used to show your feed
      </h2>
    </div>
  );
}

export default Home;

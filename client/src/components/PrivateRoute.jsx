import {Navigate, Outlet} from 'react-router-dom';
import React, {useContext, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import FriendsModal from './FriendsModal';
import Navigation from './Navigation';

const PrivateRoute = () => {
  const {currentUser} = useContext(AuthContext);
  const [friendRefresh, setFriendRefresh] = useState(false)
  //console.log('Private Route Comp current user', currentUser);
  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page
  return currentUser ? <><header className='App-header card'><Navigation /></header><Outlet context={[friendRefresh, setFriendRefresh]}/><FriendsModal friendRefresh={friendRefresh} setFriendRefresh={setFriendRefresh} /></> : <Navigate to='/' replace={true} />;
};

export default PrivateRoute;

import {Navigate, Outlet} from 'react-router-dom';
import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import FriendsModal from './FriendsModal';
import Navigation from './Navigation';

const PrivateRoute = () => {
  const {currentUser} = useContext(AuthContext);
  //console.log('Private Route Comp current user', currentUser);
  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page
  return currentUser ? <><header className='App-header card'><Navigation /></header><Outlet /><FriendsModal /></> : <Navigate to='/' replace={true} />;
};

export default PrivateRoute;

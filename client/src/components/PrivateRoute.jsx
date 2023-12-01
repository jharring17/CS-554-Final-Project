import {Navigate, Outlet} from 'react-router-dom';
import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import FriendsModal from './FriendsModal';

const PrivateRoute = () => {
  const {currentUser} = useContext(AuthContext);
  //console.log('Private Route Comp current user', currentUser);
  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page
  return currentUser ? <><Outlet /><FriendsModal /></> : <Navigate to='/signin' replace={true} />;
};

export default PrivateRoute;

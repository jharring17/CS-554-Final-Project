import React, {useContext} from 'react';
import {NavLink} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import {doSignOut} from '../firebase/FirebaseFunctions';
import SignOutButton from './SignOut';
import '../App.css';

const Navigation = () => {
  const {currentUser} = useContext(AuthContext);
  return <div>{currentUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>;
};

const NavigationAuth = () => {

  return (
    <>
    <nav className='navigation' style={{display:"flex", justifyContent: "space-around", gap: "5%", position: "relative"}}>
      <NavLink to='/feed' style={{marginLeft: "auto"}}>Feed</NavLink>
      <NavLink to='/account'>Account</NavLink>
      <NavLink to='/friends' style={{marginRight: "auto"}}>Friends</NavLink>
      <button style={{backgroundColor: "rgba(0,0,0,0)", color: "white", border: "none", fontSize: "16px", cursor: "pointer", position: "absolute", right: 0}} onClick={doSignOut}>Sign Out</button>
    </nav>
    </>
  );
};

const NavigationNonAuth = () => {
  return (
    <></>
    // <nav className='navigation'>
    //   <ul>
    //     <li>
    //       <NavLink to='/'>Sign-In</NavLink>
    //     </li>
    //     <li>
    //       <NavLink to='/signup'>Sign-up</NavLink>
    //     </li>

    //     <li>
    //       <NavLink to='/signin'>Sign-In</NavLink>
    //     </li>
    //    </ul>
    //  </nav>
  );
};

export default Navigation;

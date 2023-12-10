import React from 'react';
import '../App.css';
import {Route, Routes} from 'react-router-dom';
import Account from './Account';
import CategoryForm from './CategoryForm.jsx';
import Home from './Home';
import SignIn from './SignIn';
import SignUp from './SignUp';
import {AuthProvider} from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import AddGoalForm from './AddGoalForm';
import Friends from './Friends'

function App() {
  return (
    <AuthProvider>
      <div className='App'>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/feed' element={<PrivateRoute />}>
            <Route path='/feed' element={<Home />} />
          </Route>
          <Route path='/account' element={<PrivateRoute />}>
            <Route path='/account' element={<Account />} />
          </Route>
          <Route path='/makeGoal' element={<PrivateRoute />}>
            <Route path='/makeGoal' element={<AddGoalForm />} />
          </Route>
          <Route path='/createCategory' element={<PrivateRoute />}>
            <Route path='/createCategory' element={<CategoryForm />} />
          </Route>
          <Route path='/friends' element={<PrivateRoute />}>
            <Route path='/friends' element={<Friends />} />
          </Route>
          {/* <Route path='/loggedOut' element={<PrivateRoute />}>
            <Route path='/loggedOut' element={<LogOut />} />
          </Route> */}

          {/* <Route path='/signin' element={<SignIn />} /> */}
          <Route path='/signup' element={<SignUp />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

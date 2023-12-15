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
import EditProfileForm from './EditProfileForm.jsx';
import ChangePassword from './ChangePassword.jsx';
import Friends from './Friends';
import FriendProfile from './FriendProfile.jsx';
import History from './History.jsx';
import ManageCategories from './ManageCategories.jsx';
import Error from './Error.jsx';
import DeleteCategory from './DeleteCategory.jsx';

function App() {
  return (
    <AuthProvider>
      <div className='App'>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />

          <Route path='/feed' element={<PrivateRoute />}>
            <Route path='/feed' element={<Home />} />
          </Route>

          <Route path='/account' element={<PrivateRoute />}>
            <Route path='/account' element={<Account />} />
            <Route path='/account/makeGoal' element={<AddGoalForm />} />
            <Route path='/account/createCategory' element={<CategoryForm />} />
            <Route path='/account/editProfile' element={<EditProfileForm />} />
            <Route path='/account/history' element={<History />} />
          </Route>

          <Route path='/friends' element={<PrivateRoute />}>
            <Route path='/friends' element={<Friends />} />
            <Route path='/friends/userprofile/:fireId' element={<FriendProfile />} />
          </Route>

          <Route path='*' element={<Error status='404' message='Page Not Found'/>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

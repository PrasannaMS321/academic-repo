import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Register from './Components/Register';
import Login from './Components/Login';
import Home from './Components/Home';
import Upload from './Components/upload';
import MyLibrary from './Components/Library';
import SharedHub from './Components/SharedHub';
import AdminDashboard from './Components/AdminDashboard';
import ManageUsers from './Components/ManageUsers';
import AdminArchive from './Components/AdminArchive';
import VerifierDashboard from './Components/VerifierDashboard';
import ModeratorQueue from './Components/ModeratorQueue';
import VerifierSharedHub from './Components/VerifierSharedHub';

function App() {
  
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <Login/> } />
          <Route path='/login' element={ <Login/> } />
          <Route path='/register' element={ <Register/> } />
          <Route path='/home' element={ <Home/> } />
          <Route path='/upload' element={ <Upload/> } />
          <Route path='/library' element={ <MyLibrary/> }/>
          <Route path='/shared-hub' element= {<SharedHub/> } />

          {/*Admin*/}
          <Route path='/AdminDash' element={<AdminDashboard/>} />
          <Route path='/ManageUsers' element={<ManageUsers/>} />
          <Route path='/AdminArchive' element={<AdminArchive/>} />

          {/*Verifier*/}
          <Route path='/verifier-dash' element={<VerifierDashboard/>} />
          <Route path='/verifier-queue' element={<ModeratorQueue/>} />
          <Route path='/verifier-hub' element={<VerifierSharedHub/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Register from './Components/register';
import Login from './Components/login';
import Home from './Components/Home';
import Upload from './Components/upload';
import MyLibrary from './Components/library';
import SharedHub from './Components/SharedHub';

function App() {
  
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={ <Login/> } />
          <Route path='/register' element={ <Register/> } />
          <Route path='/home' element={ <Home/> } />
          <Route path='/upload' element={ <Upload/> } />
          <Route path='/library' element={ <MyLibrary/> }/>
          <Route path='/shared-hub' element= {<SharedHub/> } />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/carts/Cart'
import Footer from './components/Footer/Footer'
import Loginpopup from './components/Loginpopup/Loginpopup'
import PlaceOder from './pages/PlaceOder/PlaceOder'
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App = () => {

  const [showLogin,setShowLogin]   = useState(false)
  return (
    <>
    {showLogin?<Loginpopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>
     <Routes>
      <Route path='/' element={(<Home/>)} />
      <Route path='carts' element={(<Cart/>)} />
      <Route path='order' element={
        <ProtectedRoute>
          <PlaceOder/>
        </ProtectedRoute>
      } />
      <Route path='myorders' element={
        <ProtectedRoute>
          <MyOrders userEmail={localStorage.getItem('userEmail') || ''} />
        </ProtectedRoute>
      } />
      <Route path='profile' element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
     </Routes>
    
     
     <Cart/>
     <PlaceOder/>

    

    </div>
    <Footer/>
    
    
    
    </>
    
   
  )
}

export default App
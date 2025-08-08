import React, { useState } from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'



const Navbar = ({setShowLogin}) => {
  const [menu,setMenu]  = useState("home")

  const { user, logout, isAuthenticated } = useAuth()
  
   return (
    <>
      <div className='navbar'>
          <Link to='/'><h1 className='newlo'>Sree-Foods</h1></Link>

          <ul className='navbar-manu'>
            <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
            <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>menu</a>
            <a href='#app-download' onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>mobile app</a>
            <a href='#footer' onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>contect us</a>
            <li><Link to="/myorders">My Orders</Link></li>
          </ul>
          <div className='navbar-right'>
            <img src={assets.search_icon} alt="" />
            
            
          
          <div className='navbar-left'>
            <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
            <div className='Dot'></div>
          </div>

          {isAuthenticated ? (
            <div className='user-section'>
              <span className='user-name'>Hi, {user?.name}</span>
              <Link to="/profile" className='profile-link'>Profile</Link>
              <button onClick={logout} className='navbar-button logout-btn'>Logout</button>
            </div>
          ) : (
            <button onClick={()=>setShowLogin(true)} className='navbar-button'>sign in</button>
          )}
          </div>
        </div>
        
        
      </>
    )
}

export default Navbar
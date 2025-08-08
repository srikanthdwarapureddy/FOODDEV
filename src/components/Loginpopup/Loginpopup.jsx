import React, { useState } from 'react'
import './Loginpopup.css'
import { assets } from '../../assets/assets'
import { useAuth } from '../../Context/AuthContext'

const Loginpopup = ({setShowLogin}) => {

    const [currState,setCurrState] = useState("Login")
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const { login, register, error } = useAuth()
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let result
            if (currState === "Login") {
                result = await login(formData.email, formData.password)
            } else {
                result = await register(formData.name, formData.email, formData.password)
            }

            if (result.success) {
                setShowLogin(false)
                setFormData({ name: '', email: '', password: '' })
            }
        } catch (error) {
            console.error('Authentication error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='login-popup'>
            <form className='login-popup-continer' onSubmit={handleSubmit}>
                <div className='login-popup-title'>
                    <h2>{currState}</h2>
                    <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                
                {error && (
                    <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}

                <div className="login-popup-input">
                    {currState === "Sign up" && (
                        <input 
                            type='text' 
                            name="name"
                            placeholder='your name' 
                            value={formData.name}
                            onChange={handleInputChange}
                            required 
                        />
                    )}
                    
                    <input 
                        type='email' 
                        name="email"
                        placeholder='your email' 
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input 
                        type='password' 
                        name="password"
                        placeholder='password' 
                        value={formData.password}
                        onChange={handleInputChange}
                        required 
                    />
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : (currState === "Sign up" ? "Create account" : "Login")}
                </button>
                
                <div className="login-popup-condition">
                    <input type='checkbox' required/>
                    <p>By continuing, i agree to the terms of use & privacy policy</p>
                </div>
                
                {currState === "Login"
                    ? <p>create a new account? <span onClick={()=>setCurrState("Sign up")}>Click here</span></p>
                    : <p>already have an account ?<span onClick={()=>setCurrState("Login")}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default Loginpopup
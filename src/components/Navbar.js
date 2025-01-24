import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../static/Navbar.css'


function Navbar() {
    const [showNavbar, setShowNavbar] = useState(false)
    
    const handleShowNavbar = () => {
        setShowNavbar(!showNavbar)
    }

    return(
        <nav className='navbar'>
            <div className='container'>
                <div className='logo'>

                </div>
                <div className='menu-icon' onClick={handleShowNavbar}>

                </div>
                <div className={`nav-elements ${showNavbar && 'active'}`}>
                    <ul>
                        <li>
                            <NavLink to="/">Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/login">Login</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
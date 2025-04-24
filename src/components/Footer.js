import '../static/Footer.css';

function Footer() {
    return(
        <footer className='footer'>
            <p>&copy; {new Date().getFullYear()} Venomous Plant Identifier. All rights reserved.</p>
            <p>Please do not rely on our tool entirely as it is not 100% accurate</p>
            <p>
                Powered by <a href="https://www.kindwise.com/plant-id" target="_blank" rel="noopener noreferrer">Plant.id API</a>
            </p>
        </footer>    
    )
}

export default Footer;

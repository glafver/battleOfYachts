import 'bootstrap/dist/css/bootstrap.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useGameContext } from '../contexts/UserContext'
import { loadStatsForName, loadLastName } from '../utils/stats'

const Navbar = () => {
	const { userName, setUserName, setStats } = useGameContext()
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)

	const handleOpenStatistics = () => {
		const name = userName || loadLastName()
		setUserName(name || undefined)
		setStats(loadStatsForName(name))
		setMenuOpen(false)
		navigate('/lobby')
	}

	return (
		<nav className="navbar">
			<div className="game-container nav-container">
				<Link className="logo navbar-brand" to={'/'}>
					<img className="logo-icon" src="/favicon.png" alt="Battle of the Yachts logo" />
					<h1 className="logoText">Battle of the Yachts</h1>
				</Link>

				<div className="nav-actions">
					<Link className="button nav-btn" to="/how-to-play">How to play</Link>
					<button className="button nav-btn" onClick={handleOpenStatistics}>My statistics</button>
				</div>

				<button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
					<span />
					<span />
					<span />
				</button>
			</div>

			{menuOpen && (
				<div className="nav-mobile-menu">
					<Link className="button nav-btn" to="/how-to-play" onClick={() => setMenuOpen(false)}>How to play</Link>
					<button className="button nav-btn" onClick={handleOpenStatistics}>My statistics</button>
				</div>
			)}
		</nav>
	)
}

export default Navbar

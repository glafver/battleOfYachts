import './App.css';
import './assets/scss/App.scss';
import 'bootstrap/dist/css/bootstrap.css'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Game from './pages/GamePage'
import Home from './pages/HomePage'
import Lobby from './components/Lobby'
import HowToPlay from './components/HowToPlay'

const App = () => {
	return (
		<div>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/game" element={<Game />}></Route>
				<Route path="/lobby" element={<Lobby />}></Route>
				<Route path="/how-to-play" element={<HowToPlay />}></Route>
			</Routes>
		</div>
	)
}

export default App;


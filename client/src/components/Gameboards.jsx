import { useGameContext } from '../contexts/UserContext'
import { useEffect, useRef, useState } from 'react'
import Chat from './Chat'
import Results from './Results'
import { useNavigate } from 'react-router-dom'

/* seagulls */
import happy_seagull from '../assets/images/seagull1.svg'
import watching_seagull from '../assets/images/seagull2.svg'
import ohoy_seagull from '../assets/images/seagull5.svg'
import welldone_seagull from '../assets/images/seagull6.svg'
import captain_seagull from '../assets/images/seagull7.svg'

const Gameboards = () => {

	const { userName, opponentName, yachts, shootTarget, move, setMove, setShootTarget, setResultsMessage, socket, setIllustration, gameMode, recordGameResult } = useGameContext()

	const navigate = useNavigate()

	const [activeBoard, setActiveBoard] = useState('my')

	// per-game statistics (tracked so they can be saved when the game ends)
	const shotsRef = useRef(0)
	const hitsRef = useRef(0)
	const missesRef = useRef(0)

	const update = (e) => {
		e.preventDefault()
		if (move && !e.target.classList.contains('blocked')) {

			let result = e.target.id.split("_")
			setShootTarget({ row: Number(String(result[1])[0]), col: Number(String(result[1])[1]) })
		}
	}

	useEffect(() => {
		const handleMiss = (user_id, point) => {
			if (socket.id === user_id) {
				missesRef.current += 1
				shotsRef.current += 1
				setMove(false)

				document.getElementById('enemyfield_' + point.row + point.col).classList.add('board_miss', 'blocked')
				setResultsMessage("You missed! Wait for your enemy's move and then try again!")
				setIllustration(watching_seagull)
			} else {
				setMove(true)
				document.getElementById('myfield_' + point.row + point.col).classList.add('board_my_yacht_miss')
				setResultsMessage('Your opponent missed! Your turn to shoot!')
				setIllustration(captain_seagull)

			}
		}
		socket.on('shot:miss', handleMiss)
		return () => socket.off('shot:miss', handleMiss)
	}, [socket, setMove, setResultsMessage, setIllustration])

	useEffect(() => {
		for (let point of document.getElementsByClassName('board-cell')) {
			point.classList.remove('board_yacht', 'board_miss', 'board_my_yacht_miss', 'board_hit', 'board_killed', 'blocked', 'board_my_yacht_killed')
		}
	}, [])

	useEffect(() => {
		const handleHit = (user_id, point, killed_yacht) => {
			if (socket.id === user_id) {
				hitsRef.current += 1
				shotsRef.current += 1
				setMove(false)

				document.getElementById('enemyfield_' + point.row + point.col).classList.add('board_hit', 'blocked')

				if (killed_yacht) {
					for (let point of killed_yacht.points) {
						document.getElementById('enemyfield_' + point.row + point.col).classList.add('board_killed', 'blocked')
					}
					setResultsMessage("Great! You've hit a whole ship! Wait for your enemy's move and then continue to shoot!")
					setIllustration(welldone_seagull)

				} else {
					setResultsMessage('Good job! You hit one of the ships! Try more on the next turn!')
					setIllustration(happy_seagull)

				}
			} else {
				setMove(true)

				document.getElementById('myfield_' + point.row + point.col).classList.add('board_my_yacht_hit')
				if (killed_yacht) {
					for (let point of killed_yacht.points) {
						document.getElementById('myfield_' + point.row + point.col).classList.add('board_my_yacht_killed')
					}
					setResultsMessage('Tragedy! One of your ships was killed! Your turn now - lets get revenge!')
					setIllustration(ohoy_seagull)

				} else {
					setResultsMessage('Oh no! One of your ships was shot! Your turn now!')
					setIllustration(watching_seagull)
				}
			}
		}
		socket.on('shot:hit', handleHit)
		return () => socket.off('shot:hit', handleHit)
	}, [socket, setMove, setResultsMessage, setIllustration])

	useEffect(() => {
		const handleWinner = (user_id) => {
			const won = socket.id === user_id

			// save the finished game into the cumulative statistics
			recordGameResult(won ? 'win' : 'loss', {
				shots: shotsRef.current,
				hits: hitsRef.current,
				misses: missesRef.current,
			})

			shotsRef.current = 0
			hitsRef.current = 0
			missesRef.current = 0

			navigate('/lobby')
		}
		socket.on('shot:winner', handleWinner)
		return () => socket.off('shot:winner', handleWinner)
	}, [socket, recordGameResult, navigate])

	useEffect(() => {
		socket.emit('game:shoot', shootTarget)
	}, [shootTarget, socket])

	useEffect(() => {
		if (yachts.length !== 0) {
			for (let yacht of yachts) {
				for (let point of yacht.points) {
					let cell = document.getElementById('myfield_' + point.row + point.col)
					cell.classList.add('board_yacht')
				}
			}
		}

	}, [yachts])

	return (
		<>
			<Results />

			<div className="board-tabs">
				<button className={`board-tab ${activeBoard === 'my' ? 'active' : ''}`} onClick={() => setActiveBoard('my')}>Your board</button>
				<button className={`board-tab ${activeBoard === 'enemy' ? 'active' : ''}`} onClick={() => setActiveBoard('enemy')}>Enemy's board</button>
			</div>

			<div className="all-boards">
				<div className={`board-container text-center ${activeBoard === 'my' ? 'board-active' : 'board-inactive'}`}>
					<h2 className="username-title">Your board</h2>
					<p className="username-board">{userName}</p>
					<div className="board player-grid m-auto" >

						{yachts &&
							[...Array(100).keys()].map((div) =>
								<div key={div} className="board_cell" id={div < 10 ? 'myfield_0' + div : 'myfield_' + div} style={{ cursor: "not-allowed" }}></div>
							)
						}

					</div>
				</div>
				<div className={`board-container text-center ${activeBoard === 'enemy' ? 'board-active' : 'board-inactive'}`}>
					<h2 className="username-title">Enemy's board</h2>
					<p className="username-board">{opponentName}</p>

					<div className="board enemy-grid m-auto" style={{ cursor: move === true ? "pointer" : "not-allowed" }} >

						{yachts &&
							[...Array(100).keys()].map((div) =>
								<div key={div} className="board_cell" id={div < 10 ? 'enemyfield_0' + div : 'enemyfield_' + div} onClick={update} style={{ cursor: move === true ? "pointer" : "not-allowed" }} ></div>
							)
						}

					</div>
				</div>
			</div>

			{gameMode !== 'computer' && <Chat />}

		</>
	)
}

export default Gameboards

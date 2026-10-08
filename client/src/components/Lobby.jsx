import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../contexts/UserContext'
import standard_seagull from '../assets/images/seagull5.svg'
import seagull3 from '../assets/images/seagull3.svg'
import seagull4 from '../assets/images/seagull4.svg'
import FloatingYachts from './FloatingYachts'

const Lobby = () => {
	const { stats, lastResult, resetGame, userName } = useGameContext()
	const navigate = useNavigate()

	const won = lastResult === 'win'
	const hasPlayed = stats.gamesPlayed > 0
	const resultSeagull = lastResult ? (won ? seagull3 : seagull4) : standard_seagull

	const accuracy = stats.shots > 0 ? Math.round((stats.hits / stats.shots) * 100) : 0
	const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0

	const goHome = () => {
		resetGame()
		navigate('/')
	}

	return (
		<div className="lobby-container">
			<FloatingYachts />

			<div className="lobby-card">
				<h1 className="lobby-title">{lastResult ? (won ? 'Victory!' : 'Defeat') : 'Your statistics'}</h1>
				<img
					className="lobby-seagull"
					src={resultSeagull}
					alt="illustration"
				/>

				{userName && <p className="lobby-name">{userName}</p>}

				{hasPlayed ? (
					<div className="lobby-stats">
						<div className="lobby-stat">
							<span className="lobby-stat-value">{stats.gamesPlayed}</span>
							<span className="lobby-stat-label">Games played</span>
						</div>
						<div className="lobby-stat">
							<span className="lobby-stat-value">{stats.wins}</span>
							<span className="lobby-stat-label">Wins</span>
						</div>
						<div className="lobby-stat">
							<span className="lobby-stat-value">{winRate}%</span>
							<span className="lobby-stat-label">Win rate</span>
						</div>
						<div className="lobby-stat">
							<span className="lobby-stat-value">{accuracy}%</span>
							<span className="lobby-stat-label">Accuracy</span>
						</div>
					</div>
				) : (
					<p className="lobby-empty">You haven't played any games yet — play your first battle!</p>
				)}

				<div className="lobby-actions">
					{lastResult ? (
						<>
							<button className="button btn-gold" onClick={goHome}>Play again</button>
							<button className="button btn-gold" onClick={goHome}>Exit</button>
						</>
					) : (
						<button className="button btn-gold" onClick={goHome}>Back to home</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default Lobby

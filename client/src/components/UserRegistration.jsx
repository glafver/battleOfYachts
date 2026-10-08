import { Modal } from 'react-bootstrap'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../contexts/UserContext'
import ChooseYacht from './ChooseYacht'
import standard_seagull from '../assets/images/seagull5.svg'
import seagull9 from '../assets/images/seagull9.svg'
import boat from '../assets/images/bg-boat.svg'
import { loadStatsForName, saveLastName, loadLastName, clearLastName, defaultStats } from '../utils/stats'

const UserRegistration = () => {

    const { userName, setUserName, setYachts, setWaiting, setManualChoice, setResultsMessage, setIllustration, setOpponentName, setMove, setCountdown, gameMode, setGameMode, setStats, socket } = useGameContext()

    const [nameInput, setNameInput] = useState(() => loadLastName())
    const [yachtChoice, setYachtChoice] = useState(false)

    const nameInputRef = useRef()
    const navigate = useNavigate()

    const handleStart = (mode) => {
        const name = nameInput.trim()
        if (!name) {
            nameInputRef.current.focus()
            return
        }

        setUserName(name)
        saveLastName(name)
        setStats(loadStatsForName(name))
        setGameMode(mode)
        setIllustration(standard_seagull)
        setResultsMessage('Welcome to game!')
        setYachtChoice(true)
    }

    const handleManualChoice = () => {
        setManualChoice(true)
        setYachtChoice(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !nameInput.trim()) {
            clearLastName()
            setUserName(undefined)
            setStats(defaultStats())
        }
    }

    const handleRandomChoice = () => {
        socket.emit('user:joined', userName, false, gameMode, (result) => {
            setYachts(result.yachts)
            setWaiting(result.waiting)

            if (result.computerGame) {
                setOpponentName(result.opponent)
                setMove(result.move)
                setCountdown(true)
                setResultsMessage("You shoot first! Try to hit the computer's yachts!")
            }
        })

        navigate('/game')
    }

    return (
        <div className="hero">
            <img className="hero-boat" src={boat} alt="" />
            <div className="hero-welcome">
                <img src={seagull9} alt="" className="hero-welcome-seagull" />
                {nameInput.trim() && <span className="hero-welcome-text">{nameInput.trim()}</span>}
            </div>

            <div className="hero-inner">
                <p className="hero-eyebrow">A nautical battleship game</p>
                <h1 className="hero-title">Battle of the Yachts</h1>
                <p className="hero-tagline">Sink your opponent's fleet before they sink yours.</p>

                <div className="start-card">
                    <label className="start-label" htmlFor="input-username">Enter your name</label>
                    <input
                        id="input-username"
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Your name"
                        ref={nameInputRef}
                        type="text"
                        value={nameInput}
                    />

                    <div className="mode-buttons">
                        <button
                            className="mode-card"
                            onClick={() => handleStart('computer')}
                            disabled={!nameInput.trim()}
                        >
                            <span className="mode-title">Play with computer</span>
                        </button>
                        <button
                            className="mode-card"
                            onClick={() => handleStart('friend')}
                            disabled={!nameInput.trim()}
                        >
                            <span className="mode-title">Play with a friend</span>
                        </button>
                    </div>
                </div>
            </div>

            <Modal id="modalDialogYachts" show={yachtChoice}>
                <Modal.Body id="modalContentYachts">
                    <h2>Do you want to place yachts yourself or get them randomly?</h2>

                    <div className="btnPlaceYachts">
                        <button className="button btn-gold" onClick={handleManualChoice}>I'll place them myself</button>
                        <button className="button btn-gold" onClick={handleRandomChoice}>Place them randomly for me</button>
                    </div>
                </Modal.Body>
            </Modal>

            <ChooseYacht></ChooseYacht>
        </div >
    )
}

export default UserRegistration

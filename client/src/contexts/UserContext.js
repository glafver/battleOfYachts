import { createContext, useContext, useState, useCallback } from 'react'
import socketio from "socket.io-client";
import standard_seagull from '../assets/images/seagull5.svg'
import { saveStatsForName, defaultStats } from '../utils/stats'

const UserContext = createContext()
const socket = socketio.connect(process.env.REACT_APP_SOCKET_URL)


export const useGameContext = () => {
    return useContext(UserContext)
}

const GameContextProvider = ({ children }) => {
    const [userName, setUserName] = useState()
    const [opponentName, setOpponentName] = useState()
    const [yachts, setYachts] = useState([])
    const [countdown, setCountdown] = useState(false)
    const [waiting, setWaiting] = useState()
    const [move, setMove] = useState()
    const [shootTarget, setShootTarget] = useState()
    const [resultsMessage, setResultsMessage] = useState('Welcome to game!')
    const [manualChoice, setManualChoice] = useState(false)
    const [illustration, setIllustration] = useState(standard_seagull)
    const [gameMode, setGameMode] = useState('friend')
    const [stats, setStats] = useState(defaultStats)
    const [lastResult, setLastResult] = useState(null)

    // records the result of a finished game into the current player's statistics
    const recordGameResult = useCallback((result, gameStats) => {
        setStats(prev => {
            const next = {
                gamesPlayed: prev.gamesPlayed + 1,
                wins: prev.wins + (result === 'win' ? 1 : 0),
                losses: prev.losses + (result === 'loss' ? 1 : 0),
                shots: prev.shots + gameStats.shots,
                hits: prev.hits + gameStats.hits,
                misses: prev.misses + gameStats.misses,
            }
            saveStatsForName(userName, next)
            return next
        })
        setLastResult(result)
    }, [userName])

    // resets the game state and notifies the server to drop the room
    const resetGame = useCallback(() => {
        socket.emit('game:end')
        setUserName(undefined)
        setOpponentName(undefined)
        setYachts([])
        setCountdown(false)
        setWaiting(undefined)
        setMove(undefined)
        setShootTarget(undefined)
        setResultsMessage('Welcome to game!')
        setManualChoice(false)
        setIllustration(standard_seagull)
        setGameMode('friend')
        setLastResult(null)
        setStats(defaultStats())
    }, [])

    const values = {
        userName,
        setUserName,
        opponentName,
        setOpponentName,
        yachts,
        setYachts,
        countdown,
        setCountdown,
        waiting,
        setWaiting,
        move,
        setMove,
        shootTarget,
        setShootTarget,
        resultsMessage,
        setResultsMessage,
        manualChoice,
        setManualChoice,
        socket,
        illustration,
        setIllustration,
        gameMode,
        setGameMode,
        stats,
        setStats,
        lastResult,
        recordGameResult,
        resetGame
    }

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    )
}

export default GameContextProvider

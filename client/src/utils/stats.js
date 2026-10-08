const STORAGE_KEY = 'reyacht_stats'
const NAME_KEY = 'reyacht_last_name'

export const defaultStats = () => ({
	gamesPlayed: 0,
	wins: 0,
	losses: 0,
	shots: 0,
	hits: 0,
	misses: 0,
})

// store shape: { [playerName]: statsObject }
const loadStore = () => {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
	} catch (e) {
		return {}
	}
}

const saveStore = (store) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
	} catch (e) {
		// storage may be unavailable (e.g. private browsing)
	}
}

export const loadStatsForName = (name) => {
	if (!name) {
		return defaultStats()
	}
	const store = loadStore()
	return { ...defaultStats(), ...(store[name] || {}) }
}

export const saveStatsForName = (name, stats) => {
	if (!name) {
		return
	}
	const store = loadStore()
	store[name] = stats
	saveStore(store)
}

export const loadLastName = () => {
	try {
		return localStorage.getItem(NAME_KEY) || ''
	} catch (e) {
		return ''
	}
}

export const saveLastName = (name) => {
	try {
		localStorage.setItem(NAME_KEY, name)
	} catch (e) {
		// ignore
	}
}

export const clearLastName = () => {
	try {
		localStorage.removeItem(NAME_KEY)
	} catch (e) {
		// ignore
	}
}

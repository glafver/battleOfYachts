import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import step1 from '../assets/images/how-to-1.png'
import step2 from '../assets/images/how-to-2.png'
import step3 from '../assets/images/how-to-3.png'
import step4 from '../assets/images/how-to-4.png'
import FloatingYachts from './FloatingYachts'

const steps = [
	{
		title: 'Enter your name',
		text: 'Type your nickname to get started.',
		image: step1,
	},
	{
		title: 'Choose your fleet',
		text: 'Let the game place your ships automatically, or place them yourself.',
		image: step2,
	},
	{
		title: 'Place your ships',
		text: "Drag each ship onto the board. Ships can't touch each other.",
		image: step3,
	},
	{
		title: 'Sink the enemy',
		text: "Take turns firing at your opponent's board. Sink all their ships to win!",
		image: step4,
	},
]

const HowToPlay = () => {
	const [step, setStep] = useState(0)
	const [showImage, setShowImage] = useState(false)
	const [flash, setFlash] = useState(false)
	const navigate = useNavigate()

	const goTo = (newStep) => {
		if (newStep === step || flash) return
		setFlash(true)
		setTimeout(() => {
			setStep(newStep)
			setFlash(false)
		}, 300)
	}

	const next = () => goTo(Math.min(step + 1, steps.length - 1))
	const prev = () => goTo(Math.max(step - 1, 0))
	const isLast = step === steps.length - 1

	return (
		<div className="how-to-play-container">
			<FloatingYachts />

			<div className="how-to-play-card">
				<h1 className="how-to-play-title">How to play</h1>

				<div className="stepper-layout">
					<div className={`step-flash ${flash ? 'visible' : ''}`} />
					<div className="stepper-info">
						<h3 className="stepper-title">{steps[step].title}</h3>
						<p className="stepper-text">{steps[step].text}</p>
					</div>
					<img className="stepper-image" src={steps[step].image} alt={steps[step].title} onClick={() => setShowImage(true)} />
				</div>

				<div className="stepper-controls">
					<button className="button btn-ghost" onClick={prev} disabled={step === 0}>Back</button>
					<div className="stepper-dots">
						{steps.map((_, i) => (
							<span
								key={i}
								className={`stepper-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
							/>
						))}
					</div>
					{isLast ? (
						<button className="button btn-gold" onClick={() => navigate('/')}>Done</button>
					) : (
						<button className="button btn-gold" onClick={next}>Next</button>
					)}
				</div>
			</div>

			{showImage && (
				<div className="image-overlay" onClick={() => setShowImage(false)}>
					<img src={steps[step].image} alt={steps[step].title} />
				</div>
			)}
		</div>
	)
}

export default HowToPlay

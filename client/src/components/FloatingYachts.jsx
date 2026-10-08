import yacht2_h from '../assets/images/yacht2-h.svg'
import yacht3_h from '../assets/images/yacht3-h.svg'
import yacht4_h from '../assets/images/yacht4-h.svg'

const FloatingYachts = () => {
	return (
		<>
			<div className="lobby-yacht" style={{ top: '4%', animationDuration: '75s', animationDelay: '-12s' }}>
				<img src={yacht4_h} alt="" style={{ width: '130px' }} />
			</div>
			<div className="lobby-yacht" style={{ top: '14%', animationDuration: '60s', animationDelay: '-30s', animationDirection: 'reverse' }}>
				<div className="lobby-yacht-flip">
					<img src={yacht2_h} alt="" style={{ width: '70px', animationDelay: '0.5s' }} />
				</div>
			</div>
			<div className="lobby-yacht" style={{ top: '25%', animationDuration: '85s', animationDelay: '-45s' }}>
				<img src={yacht3_h} alt="" style={{ width: '105px', animationDelay: '1s' }} />
			</div>
			<div className="lobby-yacht" style={{ top: '35%', animationDuration: '68s', animationDelay: '-5s', animationDirection: 'reverse' }}>
				<div className="lobby-yacht-flip">
					<img src={yacht4_h} alt="" style={{ width: '115px', animationDelay: '1.5s' }} />
				</div>
			</div>
			<div className="lobby-yacht" style={{ top: '45%', animationDuration: '55s', animationDelay: '-25s' }}>
				<img src={yacht2_h} alt="" style={{ width: '75px' }} />
			</div>
			<div className="lobby-yacht" style={{ top: '55%', animationDuration: '80s', animationDelay: '-52s', animationDirection: 'reverse' }}>
				<div className="lobby-yacht-flip">
					<img src={yacht3_h} alt="" style={{ width: '95px', animationDelay: '0.8s' }} />
				</div>
			</div>
			<div className="lobby-yacht" style={{ top: '64%', animationDuration: '70s', animationDelay: '-18s' }}>
				<img src={yacht4_h} alt="" style={{ width: '88px', animationDelay: '2s' }} />
			</div>
			<div className="lobby-yacht" style={{ top: '73%', animationDuration: '48s', animationDelay: '-40s' }}>
				<img src={yacht2_h} alt="" style={{ width: '80px', animationDelay: '0.3s' }} />
			</div>
			<div className="lobby-yacht" style={{ top: '82%', animationDuration: '90s', animationDelay: '-8s', animationDirection: 'reverse' }}>
				<div className="lobby-yacht-flip">
					<img src={yacht3_h} alt="" style={{ width: '110px', animationDelay: '1.2s' }} />
				</div>
			</div>
			<div className="lobby-yacht" style={{ top: '91%', animationDuration: '62s', animationDelay: '-35s' }}>
				<img src={yacht4_h} alt="" style={{ width: '100px' }} />
			</div>
		</>
	)
}

export default FloatingYachts

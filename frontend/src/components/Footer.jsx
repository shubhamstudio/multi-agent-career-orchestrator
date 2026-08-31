import Brand from "./Brand"
import { Link } from "react-router-dom"

const Footer = () => {
    const year = new Date().getFullYear()

    return (
        <footer className='footer'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-blue-200/20 blur-[100px] pointer-events-none' />

            <div className='footer-inner'>
                <div className='footer-top'>
                    <div className='footer-brand'>
                        <Brand className='navbar-logo' />
                        <p className='footer-tagline'>
                            Glangen is a multi-agent career orchestration platform connecting resume intelligence, interview practice, actionable feedback, and personalized roadmaps in one continuous journey.
                        </p>
                    </div>

                    <div className='footer-links-grid'>
                        <div className='footer-col'>
                            <h3 className='footer-col-title'>Product</h3>
                            <Link to="/scorer" className='footer-link'>Resume Agent</Link>
                            <Link to="/interview" className='footer-link'>Interview Agent</Link>
                            <Link to="/feedback" className='footer-link'>Feedback Agent</Link>
                            <Link to="/roadmap" className='footer-link'>Roadmap Agent</Link>
                        </div>

                        <div className='footer-col'>
                            <h3 className='footer-col-title'>Company</h3>
                            <Link to="/about" className='footer-link'>About</Link>
                            <Link to="/faq" className='footer-link'>Platform Q&A</Link>
                        </div>

                        <div className='footer-col'>
                            <h3 className='footer-col-title'>Legal</h3>
                            <Link to="/privacy" className='footer-link'>Privacy Policy</Link>
                            <Link to="/terms" className='footer-link'>Terms of Service</Link>
                        </div>
                    </div>
                </div>

                <div className='footer-bottom'>
                    <p className='footer-copyright'>
                        © {year} GLANGEN. All rights reserved.
                    </p>

                    <p className='text-[10px] font-medium uppercase tracking-[.16em] text-white/35'>Prepare · Practice · Progress</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

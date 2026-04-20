import React from 'react'
import { BsRobot } from 'react-icons/bs'

function Footer() {
  return (
    <footer className='bg-white text-black border-t border-black/5'>
      <div className='max-w-[1920px] mx-auto section-padding'>
        <div className='flex flex-col md:flex-row justify-between items-start gap-16 mb-24'>
            <div className='max-w-md'>
                <div className='flex items-center gap-3 mb-8 group cursor-pointer'>
                    <div className='bg-black text-white p-2.5 rounded-xl group-hover:bg-blue-600 transition-all duration-500'>
                        <BsRobot size={22}/>
                    </div>
                    <h2 className='text-2xl font-black tracking-tighter'>InterviewIQ</h2>
                </div>
                <p className='text-gray-500 font-medium leading-relaxed mb-10'>
                    The professional standard for AI-driven career mastery. 
                    Simulating reality to build the leaders of tomorrow.
                </p>
                <div className='flex gap-4'>
                    <div className='w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer'>𝕏</div>
                    <div className='w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer'>in</div>
                    <div className='w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer'>ig</div>
                </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-12'>
                <div>
                    <h4 className='text-[10px] font-black uppercase tracking-widest text-blue-600 mb-8'>Product</h4>
                    <ul className='space-y-4 text-sm font-black uppercase tracking-widest text-gray-400'>
                        <li className='hover:text-black cursor-pointer transition-colors'>Interview AI</li>
                        <li className='hover:text-black cursor-pointer transition-colors'>Career Suite</li>
                        <li className='hover:text-black cursor-pointer transition-colors'>Pricing</li>
                    </ul>
                </div>
                <div>
                    <h4 className='text-[10px] font-black uppercase tracking-widest text-blue-600 mb-8'>Ecosystem</h4>
                    <ul className='space-y-4 text-sm font-black uppercase tracking-widest text-gray-400'>
                        <li className='hover:text-black cursor-pointer transition-colors'>Roadmaps</li>
                        <li className='hover:text-black cursor-pointer transition-colors'>Job Hub</li>
                        <li className='hover:text-black cursor-pointer transition-colors'>Success</li>
                    </ul>
                </div>
                <div>
                    <h4 className='text-[10px] font-black uppercase tracking-widest text-blue-600 mb-8'>Legal</h4>
                    <ul className='space-y-4 text-sm font-black uppercase tracking-widest text-gray-400'>
                        <li className='hover:text-black cursor-pointer transition-colors'>Privacy</li>
                        <li className='hover:text-black cursor-pointer transition-colors'>Terms</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div className='pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between gap-6 pb-12'>
            <p className='text-xs font-black uppercase tracking-widest text-gray-400'>© 2026 InterviewIQ Intelligence Lab. All Rights Reserved.</p>
            <div className='flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400'>
                <span className='hover:text-black cursor-pointer'>Status: Operational</span>
                <span className='hover:text-black cursor-pointer transition-colors'>v2.4.0-Clean</span>
            </div>
        </div>
      </div>
      
      {/* BRANDING BAR */}
      <div className='h-3 w-full bg-[#001A3D]'></div>
    </footer>
  )
}

export default Footer

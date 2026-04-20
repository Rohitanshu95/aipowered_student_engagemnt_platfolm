import React, { useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react";
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch()

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];



  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id)

      const amount =  
      plan.id === "basic" ? 100 :
      plan.id === "pro" ? 500 : 0;

      const result = await axios.post(ServerUrl + "/api/payment/order" , {
        planId: plan.id,
        amount: amount,
        credits: plan.credits,
      },{withCredentials:true})
      

      const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: result.data.amount,
      currency: "INR",
      name: "InterviewIQ.AI",
      description: `${plan.name} - ${plan.credits} Credits`,
      order_id: result.data.id,

      handler:async function (response) {
        const verifypay = await axios.post(ServerUrl + "/api/payment/verify" ,response , {withCredentials:true})
        dispatch(setUserData(verifypay.data.user))

          alert("Payment Successful 🎉 Credits Added!");
          navigate("/")

      },
      theme:{
        color: "#10b981",
      },

      }

      const rzp = new window.Razorpay(options)
      rzp.open()

      setLoadingPlan(null);
    } catch (error) {
     console.log(error)
     setLoadingPlan(null);
    }
  }



  return (
    <div className='min-h-screen bg-white selection:bg-orange-500 selection:text-white pb-32'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-6 pt-48'>
        {/* Header */}
        <div className='flex flex-col md:flex-row items-end justify-between gap-12 mb-24'>
            <div className='max-w-2xl'>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='text-orange-600 font-black text-[10px] uppercase tracking-widest mb-6'
                >
                    Premium Access
                </motion.div>
                <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-black mb-6'>
                    Choose Your Plan.
                </h1>
                <p className='text-xl text-gray-400 font-medium leading-relaxed'>
                    Transparent pricing built for professionals who take their career trajectory seriously. 
                    No hidden fees, just pure intelligence.
                </p>
            </div>
            
            <button 
                onClick={() => navigate("/")} 
                className='h-16 w-16 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90 group shadow-xl'
            >
                <FaArrowLeft className='group-hover:-translate-x-1 transition-transform' size={20} />
            </button>
        </div>

        {/* Pricing Grid */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id
            const isPro = plan.id === "pro"

            return (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -10 }}
                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                className={`relative rounded-[48px] p-12 transition-all duration-500 border-2 
                  ${isSelected || isPro
                    ? "border-black shadow-2xl bg-white"
                    : "border-gray-100 bg-gray-50/50 grayscale hover:grayscale-0"
                  }
                  ${plan.default ? "cursor-default opacity-60" : "cursor-pointer"}
                `}
              >
                {/* Badges */}
                {plan.badge && (
                  <div className="absolute top-10 right-10 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl">
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-3xl font-black uppercase tracking-tight text-black mb-8">
                  {plan.name}
                </h3>

                <div className="mb-12">
                  <span className="text-6xl font-black tracking-tighter text-black">
                    {plan.price}
                  </span>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                    {plan.credits} Credits
                  </div>
                </div>

                <p className="text-gray-500 font-bold mb-10 leading-relaxed min-h-[60px]">
                  {plan.description}
                </p>

                <div className="space-y-5 mb-14">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <FaCheckCircle className={`text-sm ${isPro ? 'text-orange-600' : 'text-black'}`} />
                      <span className="text-gray-900 font-bold text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {!plan.default && (
                  <button
                    disabled={loadingPlan === plan.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected) {
                        setSelectedPlan(plan.id)
                      } else {
                        handlePayment(plan)
                      }
                    }} 
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95
                      ${isSelected
                        ? "bg-black text-white hover:bg-orange-600"
                        : "bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                      }
                    `}
                  >
                    {loadingPlan === plan.id
                      ? "Authorizing..."
                      : isSelected
                        ? "Confirm Selection"
                        : "Select Plan"}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Pricing

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
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch()

  const plans = [
    {
      id: "basic",
      name: "Starter Pack",
      price: 49,
      displayPrice: "₹49",
      credits: 500,
      description: "Ideal for short-term interview preparation and quick boosts.",
      features: [
        "500 AI Interview Credits",
        "Detailed AI Feedback",
        "Strategic Performance Map",
        "Voice Interview Access",
      ],
    },
    {
      id: "pro",
      name: "Professional",
      price: 99,
      displayPrice: "₹99",
      credits: 1500,
      description: "The most popular choice for dedicated career growth.",
      features: [
        "1500 AI Interview Credits",
        "Advanced Neural Analysis",
        "Priority AI Processing",
        "Complete History Access",
      ],
      badge: "Best Value",
      popular: true
    },
    {
      id: "elite",
      name: "Elite Performance",
      price: 199,
      displayPrice: "₹199",
      credits: 4000,
      description: "Unlimited power for high-stakes enterprise interviews.",
      features: [
        "4000 AI Interview Credits",
        "Elite AI Interviewer Mode",
        "Deep Skill Trend Analysis",
        "24/7 Neural Support",
      ],
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id)
      
      const res = await axios.post(`${ServerUrl}/api/payment/order`, {
        planId: plan.id,
        amount: plan.price,
        credits: plan.credits
      }, { withCredentials: true });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res.data.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} Injection`,
        order_id: res.data.id,
        handler: async (response) => {
          try {
            const verifypay = await axios.post(`${ServerUrl}/api/payment/verify`, response, { withCredentials: true });
            if (verifypay.data.success) {
              dispatch(setUserData(verifypay.data.user));
              alert("Payment Successful 🎉 Credits Added!");
              navigate("/dashboard");
            }
          } catch (err) {
            console.error("Verification failed:", err);
          }
        },
        theme: { color: "#2563eb" }
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment flow error:", error);
      alert("Failed to initiate payment. Please check your connection.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className='min-h-screen bg-white selection:bg-blue-500 selection:text-white pb-32'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-6 pt-48'>
        {/* Header */}
        <div className='flex flex-col md:flex-row items-end justify-between gap-12 mb-24'>
            <div className='max-w-2xl'>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6'
                >
                    Credit Injection Center
                </motion.div>
                <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-black mb-6'>
                    Fuel Your Growth.
                </h1>
                <p className='text-xl text-gray-400 font-medium leading-relaxed'>
                    Select a neural processing tier to unlock advanced AI capabilities. 
                    No subscriptions, just raw power when you need it.
                </p>
            </div>
            
            <button 
                onClick={() => navigate("/dashboard")} 
                className='h-16 w-16 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-90 group shadow-xl'
            >
                <FaArrowLeft className='group-hover:-translate-x-1 transition-transform' size={20} />
            </button>
        </div>

        {/* Pricing Grid */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {plans.map((plan) => {
            return (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -10 }}
                className={`relative rounded-[48px] p-12 transition-all duration-500 border-2 
                  ${plan.popular
                    ? "border-blue-600 shadow-2xl shadow-blue-100 bg-white"
                    : "border-gray-100 bg-gray-50/50"
                  }
                `}
              >
                {plan.badge && (
                  <div className="absolute top-10 right-10 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl">
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-8">
                  {plan.name}
                </h3>

                <div className="mb-12">
                  <span className="text-6xl font-black tracking-tighter text-slate-900">
                    {plan.displayPrice}
                  </span>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                    {plan.credits} AI Credits
                  </div>
                </div>

                <p className="text-gray-500 font-bold mb-10 leading-relaxed min-h-[60px]">
                  {plan.description}
                </p>

                <div className="space-y-5 mb-14">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <FaCheckCircle className={`text-sm ${plan.popular ? 'text-blue-600' : 'text-slate-900'}`} />
                      <span className="text-gray-900 font-bold text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={loadingPlan === plan.id}
                  onClick={() => handlePayment(plan)} 
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95
                    ${plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                    }
                  `}
                >
                  {loadingPlan === plan.id
                    ? "Authorizing..."
                    : "Select Plan"}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Pricing

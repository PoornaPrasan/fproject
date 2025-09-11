import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {motion} from 'framer-motion';


import { 
  FileText, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  CheckCircle,
  
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  Heart,
  Bell,
  BarChart3,
  ThumbsUp,
  Eye,
  UserPlus,
  Search,
  Layers
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [countedStats, setCountedStats] = useState({
    issuesResolved: 0,
    activeCitizens: 0,
    satisfactionRate: 0,
    avgResolution: 0
  });
  const statsRef = useRef<HTMLDivElement>(null);

  // Function to animate counting
  const animateCount = (endValue: number, duration: number, setter: (value: number) => void) => {
    const startTime = performance.now();
    
    const updateCount = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentValue = Math.floor(progress * endValue);
      setter(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setter(endValue);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && !statsAnimated) {
          setStatsAnimated(true);
          // Start counting animations
          animateCount(50000, 2000, (value) => setCountedStats(prev => ({...prev, issuesResolved: value})));
          animateCount(25000, 2000, (value) => setCountedStats(prev => ({...prev, activeCitizens: value})));
          animateCount(99.2, 2000, (value) => setCountedStats(prev => ({...prev, satisfactionRate: value})));
          animateCount(1.8, 2000, (value) => setCountedStats(prev => ({...prev, avgResolution: value})));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsAnimated]);


  const stats = [
    { number: countedStats.issuesResolved.toLocaleString() + '+', label: 'Issues Resolved', icon: CheckCircle, color: 'text-green-500' },
    { number: countedStats.activeCitizens.toLocaleString() + '+', label: 'Active Citizens', icon: Users, color: 'text-blue-500' },
    { number: countedStats.satisfactionRate.toFixed(1) + '%', label: 'Satisfaction Rate', icon: ThumbsUp, color: 'text-purple-500' },
    { number: countedStats.avgResolution.toFixed(1) + ' days', label: 'Avg Resolution', icon: Clock, color: 'text-orange-500' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Local Business Owner',
      content: 'The pothole outside my shop was fixed in just 2 days! The entire process was transparent, and I received updates every step of the way. This platform has revolutionized how we interact with city services.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      location: 'Downtown District',
      issueType: 'Road Maintenance'
    },
    {
      name: 'Michael Chen',
      role: 'Community Volunteer',
      content: 'As someone who organizes neighborhood cleanups, this platform has been invaluable. I can report multiple issues at once, track their progress, and even coordinate with other volunteers. Absolutely fantastic!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      location: 'Riverside Community',
      issueType: 'Sanitation Services'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Parent & Resident',
      content: 'The broken streetlight near the school playground was a safety concern for months. Through PublicCare, it was reported, prioritized, and fixed within a week. My kids can now play safely after dark.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      location: 'Maple Heights',
      issueType: 'Street Lighting'
    }
  ];

  const governmentLogos = [
    { name: 'Department of Public Works', logo: '🏗️', description: 'Infrastructure & Maintenance' },
    { name: 'Water & Utilities Authority', logo: '💧', description: 'Water & Sewer Services' },
    { name: 'Electric Power Company', logo: '⚡', description: 'Electrical Infrastructure' },
    { name: 'Transportation Department', logo: '🚌', description: 'Roads & Public Transit' },
    { name: 'Sanitation Services', logo: '🗑️', description: 'Waste Management' },
    { name: 'City Planning Office', logo: '🏛️', description: 'Urban Development' },
    { name: 'Emergency Services', logo: '🚨', description: 'Public Safety' },
    { name: 'Parks & Recreation', logo: '🌳', description: 'Green Spaces' },
    { name: 'Environmental Agency', logo: '🌍', description: 'Environmental Protection' },
    { name: 'Housing Authority', logo: '🏠', description: 'Public Housing' }
  ];

  const achievements = [
    { icon: Award, title: 'Excellence in Digital Government', year: '2024' },
    { icon: Users, title: 'Community Choice Award', year: '2023' },
    { icon: TrendingUp, title: 'Innovation in Public Service', year: '2023' },
    { icon: Heart, title: 'Citizen Satisfaction Leader', year: '2024' }
  ];


  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-screen w-full overflow-hidden flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="Technical.jpg"
            alt="Cityscape background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex">
          {/* Left Column - Main Content */}
          <div className="w-full lg:w-1/2">
            {/* Trusted by badge */}
            <div className={`bg-white text-blue-900 inline-block px-4 py-2 rounded-full mb-8 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">Trusted by 25,000+ Citizens 🎖️</span>
              </div>
            </div>
            
            {/* Main headline */}
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight text-white ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
              Transform Your<br />
              <span className="text-blue-700">Community</span><br />
              With Your Voice
            </h1>
            
            {/* Subheading */}
            <p className={`text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              Expert civic issue resolution and public services tailored to improve what matters most in your neighborhood. Let us help you build a better community together.
            </p>
            
            {/* Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
              <Link
                to="/signup"
                className="btn-primary bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

  <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-20 px-4">
   <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
     {/* Left Column - Images */}
     <div className="relative h-[500px] md:h-[500px]">
      <div className="relative w-full h-full">
        <div
          className="absolute top-0 left-0 w-[70%] h-[60%] rounded-2xl shadow-2xl bg-cover bg-center hover:-translate-y-1 transition-transform duration-300"
        >
          <img src="road.jpg" alt="Description" className="w-full h-full object-cover rounded-2xl" />
        </div>
        <div
          className="absolute bottom-0 right-0 w-[80%] h-[60%] rounded-2xl shadow-2xl bg-cover bg-center hover:-translate-y-1 transition-transform duration-300"
        >
          <img src="light.jpg" alt="Description" className="w-full h-full object-cover rounded-2xl" />
        </div>
        <div className="absolute bottom-5 left-5 bg-gradient-to-br from-blue-300 to-blue-700 text-white px-6 py-4 rounded-xl shadow-xl text-center min-w-[120px]">
          <div className="text-4xl font-bold leading-none mb-1">14</div>
          <div className="text-sm tracking-wide opacity-90">Years Experience</div>
        </div>
      </div>
    </div>

    {/* Right Column - Stats Section */}
    <section
      id="stats-section"
      ref={statsRef}
      className="py-20 text-black relative overflow-hidden"
    >
      
    <div>
     <div className="text-left mb-8 ">
      <h2 className="text-4xl font-bold mb-2 text-black ml-8 -mt-10 pb-4">Turning Complaints into Community <span className='text-blue-700'>Solutions</span></h2>
      <p className="text-base text-black ml-8">Real results from real communities.  Empowering communities through transparency and action, our system has resolved thousands of public concerns with speed and accountability making every voice count.</p>
    </div>

  <div className="grid grid-cols-2 gap-6">
    {stats.map((stat, index) => {
      const Icon = stat.icon;
      return (
        <div
          key={index}
          className={`text-center ${statsAnimated ? 'animate-countUp' : 'opacity-0'}`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <div className="shadow-lg rounded-xl p-2 ml-4 bg-white hover:rounded-xl hover:bg-blue-50 transition-all duration-300 w-4/5 h-auto flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl active:scale-100' hover:drop-shadow-[0_0_8px_rgba(56,10,398,0.4)]">
            <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mb-3 backdrop-blur-sm transition-transform duration-200">
              <Icon className="w-8 h-8 text-blue-700" />
            </div>
            <div className="text-2xl font-bold text-yellow-500">{stat.number}</div>
            <div className="text-black text-sm font-medium text-center">{stat.label}</div>
          </div>
        </div>
      );
    })}
  </div>
</div>

</section>
  </div>
</section>


      {/* Services Section */}
      <ServicesSection />

      {/* System Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Core System Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to report, track, and resolve public service issues in one intuitive platform
            </p>
          </div>

          {/* Main Features Grid */} 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Easy Issue Reporting */}
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Issue Reporting</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Prominent "Report Issue" button with streamlined form and category selection. Submit complaints in under 60 seconds.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>One-click category selection</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Photo upload support</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>GPS auto-location</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link to="/report" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Report Issue Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Complaint Tracking */}
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden hover:drop-shadow-[0_0_16px_rgba(222,20,898,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complaint Tracking</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Simple search bar to check real-time status updates. Enter your complaint ID for instant progress tracking.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Real-time status updates</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Timeline visualization</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Department contact info</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link to="/track" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                  Track Complaint
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Area Issue Map */}
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden hover:drop-shadow-[0_0_16px_rgba(23,221,40,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Location Integration</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Automatic GPS detection pinpoints exact problem locations, ensuring complaints reach the right local authorities.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Automatic GPS detection</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Precise location mapping</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Smart authority routing</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link to="/location" className="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
             </div>
            </div>
          

          {/* Bottom Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Recent Updates/Notifications */}
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden hover:-translate-y-2 hover:drop-shadow-[0_0_16px_rgba(9,1,198,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Updates & Notifications</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Stay informed with a live feed of updates on your complaints and important system announcements.
              </p>
              
              {/* Sample Notifications */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="text-sm">
                    <span className="font-medium">Complaint #12345</span> - Status updated to "In Progress"
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="text-sm">
                    <span className="font-medium">Area Alert</span> - Water maintenance scheduled for tomorrow
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <div className="text-sm">
                    <span className="font-medium">System Update</span> - New mobile app features available
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Link to="/notifications" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                  View All Updates
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Multi-Category Support */}

              <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden hover:drop-shadow-[0_0_16px_rgba(255,157,0,0.4)]">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                 <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                 <Layers className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Category Support</h3>
                 <p className="text-gray-600 leading-relaxed mb-6">
                   Report issues across all civic services: Electricity, Water, Roads, Waste, Sanitation, Street Lighting, and Drainage.
                 </p>
                 <div className="space-y-2">
                   <div className="flex items-center text-sm text-gray-500">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span>7 main service categories</span>
                   </div>
                   <div className="flex items-center text-sm text-gray-500">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span>Department-specific routing</span>
                   </div>
                   <div className="flex items-center text-sm text-gray-500">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span>Specialized handling protocols</span>
                   </div>
                 </div>
                 <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/categories" className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-800 transition-colors">
                     View Categories
                     <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                 </div>
             </div>

            {/* Emergency Reporting */}
            <div className="group bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white relative overflow-hidden hover:drop-shadow-[0_0_16px_rgba(255,20,20,0.4)]">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Emergency Reporting</h3>
              <p className="text-red-100 leading-relaxed mb-6">
                Clearly marked emergency option for urgent issues requiring immediate attention and priority handling.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-red-200" />
                  <span className="text-red-100">24/7 emergency hotline</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-red-200" />
                  <span className="text-red-100">Priority dispatch system</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-red-200" />
                  <span className="text-red-100">Immediate alert notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-red-200" />
                  <span className="text-red-100">Guaranteed follow-up</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/emergency" className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Report Emergency
                </Link>
                <div className="flex items-center text-red-100">
                  <Phone className="w-5 h-5 mr-2" />
                  <span className="font-bold">Call: 911</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Government Partners */}
      <section className=" bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            {/* Left fade overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Right fade overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex animate-scroll space-x-8">
              {[...governmentLogos, ...governmentLogos].map((org, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 rounded-2xl p-8 min-w-[280px] hover: transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)]"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4">{org.logo}</div>
                    <h3 className=" font-thin text-gray-800 text-lg mb-2">{org.name}</h3>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      

      {/* Quick User Guide Section */}
      <section className="py-24 bg-[#022b63]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Quick User Guide</h2>
            <p className="text-xl text-white">Everything you need to know to report and track municipal issues effectively</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Getting Started */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)]">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Getting Started</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Register with email verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Set your location for accurate service routing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Choose notification preferences (email, SMS, push notifications)</span>
                </li>
              </ul>
            </div>

            {/* Reporting Issues */}
            <div className="bg-white rounded-2xl shadow-lg p-8  hover:transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)]">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Reporting Issues</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Select category: Electricity, Water, Roads, Waste, Sanitation, Street Lighting, Drainage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Add location: Use GPS or enter address manually</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Describe the problem clearly and briefly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Upload photos/videos (up to 10MB) for better results</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Mark as emergency only for urgent safety issues</span>
                </li>
              </ul>
            </div>

            {/* After Reporting */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)]">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">After Reporting</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Save your complaint ID for tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Expect status updates: Received → Under Review → In Progress → Resolved</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Check progress anytime using your complaint ID</span>
                </li>
              </ul>
            </div>

            {/* Best Practices & Response Times */}
            <div className="space-y-6">
              {/* Best Practices */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)]">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Best Practices</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Be specific with locations and descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Use emergency flag only for safety hazards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Check the area map before reporting to avoid duplicates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Rate service quality after resolution to help improve the system</span>
                  </li>
                </ul>
              </div>

              {/* Response Times */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:transition-all duration-300 hover:-translate-y-2  hover:drop-shadow-[0_0_16px_rgba(56,190,398,0.4)] ">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Response Times</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-red-500 rounded-full mt-0.5 mr-3 flex-shrink-0"></div>
                    <span><strong>Emergency:</strong> 24-48 hours</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-orange-500 rounded-full mt-0.5 mr-3 flex-shrink-0"></div>
                    <span><strong>High Priority:</strong> 3-5 business days</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 mr-3 flex-shrink-0"></div>
                    <span><strong>Standard Issues:</strong> 1-2 weeks</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-gray-500 rounded-full mt-0.5 mr-3 flex-shrink-0"></div>
                    <span><strong>Low Priority:</strong> Based on resource availability</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Provider Directory */}
      <ServiceProviderDirectory />
      {/* Popular Issues */}
      <section className="py-16 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Popular Issues in Your Area</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Most Reported Problems
              </h3>
              <ul className="space-y-3">
                {['Potholes', 'Garbage Collection', 'Street Light Outages', 'Water Leaks', 'Drainage Blockages'].map((issue, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{issue}</span>
                    <span className="text-gray-500">{Math.floor(Math.random() * 100) + 50} reports</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Trending Categories
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Road Repairs', change: '+32%' },
                  { name: 'Water Supply', change: '+18%' },
                  { name: 'Electrical Issues', change: '+12%' },
                  { name: 'Public Sanitation', change: '+8%' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-orange-600 text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">All Time</div>
                    </div>
                    <div className="text-green-600 font-medium">{item.change}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-red-600" />
                Seasonal Alerts
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="font-bold text-red-700 mb-1">Monsoon Preparedness</div>
                <p className="text-red-600 text-sm">Expect increased drainage complaints during heavy rains</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="font-bold text-yellow-700 mb-1">Summer Water Supply</div>
                <p className="text-yellow-600 text-sm">Water rationing may affect supply complaints</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full mx-auto py-16 px-4 bg-[#022b63] text-white">
  <div className="text-center mb-12 animate-fade-in">
    <h2 className="text-4xl font-bold mb-4 drop-shadow-md">Success Stories</h2>
    <p className="text-lg max-w-2xl mx-auto opacity-90">
      Real experiences from citizens who have used our complaint management system to improve their communities
    </p>
  </div>

  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    {/* Left Column - Creative Image Layout */}
    <div className="relative h-[500px] md:h-[500px]">
      <div className="relative w-full h-full">
        <div className="absolute top-0  right-4 w-[80%] h-[60%] rounded-2xl shadow-2xl bg-cover bg-center hover:-translate-y-1 transition-transform duration-300">
          <img src="r2.jpg" alt="Road repair example" className="w-full h-full object-cover rounded-2xl" />
        </div>
        <div className="absolute bottom-0 left-4 w-[80%] h-[60%] rounded-2xl shadow-2xl bg-cover bg-center hover:-translate-y-1 transition-transform duration-300">
          <img src="reweive.jpg" alt="Street light example" className="w-full h-full object-cover rounded-2xl" />
        </div>
      </div>
    </div>

    {/* Right Column - Testimonials Section */}
    <div className="p-8 text-slate-800">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Success Stories</h3>
        <p className="text-white">Hear from community members about their positive experiences</p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-200 p-5 rounded-xl border-l-4 border-indigo-600 mb-6 relative animate-fade-in hover:transition-all duration-300 hover:-translate-y-1">
        <p className="italic text-slate-700 mb-4">
          "I was amazed at how quickly the system worked! I reported a dangerous pothole on my street through the online portal, and within just 5 days, a repair crew had completely fixed the road. The SMS updates kept me informed throughout the entire process."
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Ruwan Perera"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Ruwan Perera</h4>
            <p className="text-sm text-slate-500">Resident, Galle Municipal Area</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-blue-400 hover:transition-all duration-300 hover:-translate-y-1">
          <p className="text-slate-700 italic mb-3">
            "The professionalism of the municipal officers was outstanding. They not only fixed our broken streetlight but also explained the maintenance schedule."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/men/40.jpg" 
                alt="Saman Amarasinghe"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Saman Amarasinghe</h4>
              <p className="text-xs text-slate-500">Community Leader, Colombo District</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-sky-600 hover:transition-all duration-300 hover:-translate-y-1">
          <p className="text-slate-700 italic mb-3">
            "Easy to use system with transparent tracking. I could see exactly when my complaint was assigned and resolved."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/women/63.jpg" 
                alt="Nilmini Fernando"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Nilmini Fernando</h4>
              <p className="text-xs text-slate-500">Resident, Kandy Municipal Council</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
      

      {/* Awards & Recognition */}
      <section className="py-20 bg-gray-200 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Awards & Recognition</h2>
            <p className="text-xl text-black">Recognized for excellence in digital government services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center rounded-lg p-6 bg-gray-50 hover:bg-[#022b63] hover:text-white duration-300 transform hover:scale-105 hover:rotate-1 hover:shadow-lg transition-all">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full  flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Icon className="w-10 h-10 text-yellow-300" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                  <p className="text-gray-60 ">{achievement.year}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#022b63] via-gray-400/40 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-8">Ready to Transform Your Community?</h2>
          <p className="text-2xl mb-12 text-blue-100 leading-relaxed">
            Join thousands of citizens who are already making a difference with PublicCare. 
            Your voice matters, and together we can build better communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/signup"
              className="btn-primary inline-flex items-center bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <UserPlus className="mr-3 w-6 h-6" />
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center border-2 border-white text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowRight className="mr-3 w-6 h-6" />
              Sign In Now
            </Link>
          </div>
          
          <div className="mt-12 text-blue-200">
            <p className="text-lg">✓ Free to use  ✓ No credit card required  ✓ Instant access</p>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <FileText className="w-10 h-10 text-blue-400 mr-3" />
                <span className="text-2xl font-bold">PublicCare</span>
              </div>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Empowering communities through transparent and efficient public service management. 
                Building bridges between citizens and government for a better tomorrow.
              </p>
              <div className="flex space-x-4">
          {/* Facebook */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
          </div>

          {/* Twitter/X */}
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
            </svg>
          </div>

          {/* LinkedIn */}
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
         </div>
       </div>
      </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/mobile" className="hover:text-white transition-colors">Mobile App</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Contact</h3>
              <div className="space-y-4 text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-400" />
                  <span>support@publiccare.gov</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-blue-400" />
                  <span>www.publiccare.gov</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2025 PublicCare. All rights reserved. Built for the people, by the people.
              </p>
              <div className="flex space-x-6 text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ServicesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const maxSlides = 1; // Since we have 4 services and show 2 at a time
  const trackRef = useRef(null);

  const services = [
    {
      id: 1,
      number: '01',
      title: 'Road Resurfaced',
      description: 'A pothole-ridden road was repaired promptly, improving safety for daily commuters.',
      bg: 'bg-[url(roadrepair.jpg)]',
    },
    {
      id: 2,
      number: '02',
      title: 'Power Line Repaired',
      description: 'Broken pipelines were fixed after complaints, bringing clean water back to hundreds of homes.',
      bg: 'bg-[url(electracityrepair.jpg)]',
    },
    {
      id: 3,
      number: '03',
      title: 'Sanitation Improved',
      description: 'Garbage and blocked drains were cleared, keeping the area clean and healthy.',
      bg: 'bg-[url(sanitation.jpg)]',
    },
    {
      id: 4,
      number: '04',
      title: 'Clean Water Restored',
      description: 'Broken pipelines were fixed after complaints, bringing clean water back to hundreds of homes.',
      bg: 'bg-[url(waterrepair.jpg)]',
    },
  ];

  const slideCards = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentSlide < maxSlides) {
      setCurrentSlide(currentSlide + 1);
    } else if (direction === 'prev' && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    if (trackRef.current) {
      (trackRef.current as HTMLElement).style.transform = `translateX(-${currentSlide * 50}%)`;
    }
  }, [currentSlide]);

  return (
   <section className="min-h-screen grid grid-cols-1 lg:grid-cols-[45%_55%] relative bg-black/30">
  {/* Background Image for entire section */}
  <div className="absolute inset-0 z-0">
    <img
      src="sbg.jpg"
      alt="City services background"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Left Panel - now with z-index to appear above background */}
  <div className="bg-black/60 text-white px-10 py-20 flex flex-col justify-center relative z-10">
    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
      <span>Transformative</span><br></br>
      <span> Success Stories in </span><br></br>
      <span className="bg-gradient-to-br from-blue-400 to-indigo-500 bg-clip-text text-transparent">Action</span>
    </h1>
    <p className="text-white/80 text-lg max-w-[90%] mt-2">
      Real problems, real solutions, real impact. See how community voices are transforming neighborhoods across the city with every resolved complaint. From broken streetlights to major road repairs, discover the powerful results when citizens speak up and local authorities listen. Every success story starts with someone like you taking action.    </p>
  </div>

  {/* Right Panel - now with z-index to appear above background */}
  <div className="bg-black/60  px-4 py-20 relative flex items-center overflow-hidden z-10 ">
    <button
      className={`absolute left-12 transform -translate-x-1/2 bg-blue-300 text-gray-800 w-12 h-12 rounded-full shadow-lg z-20 hover:bg-[#022b63] hover:text-yellow-500  ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => slideCards('prev')}
      disabled={currentSlide === 0}
    >
      <ArrowLeft className="w-6 h-6 ml-2" />
    </button>
    <button
      className={`absolute right-12 transform translate-x-1/2 bg-blue-300 text-gray-800 w-12 h-12 rounded-full shadow-lg z-20 hover:bg-[#022b63] hover:text-yellow-500  ${currentSlide === maxSlides ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => slideCards('next')}
      disabled={currentSlide === maxSlides}
    >
      <ArrowRight className="w-6 h-6 ml-2" />
    </button>

    <div className="overflow-hidden w-full ">
      <div
        ref={trackRef}
        className="flex transition-transform duration-500 ease-in-out gap-6"
        style={{ width: `${services.length * 50}%` }}
      >
        {services.map((card) => (
          <div
            key={card.id}
            className={`w-[500px] h-[400px] cursor-pointer rounded-lg hover:rounded-lg relative overflow-hidden transition-transform hover:scale-[1.02]  ${card.bg} bg-cover bg-center`}
            onClick={() => alert(`Opening details for card ${card.id}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/70 flex flex-col justify-end p-6">
              <div className="text-[#C9A876] text-sm font-semibold tracking-widest mb-2">{card.number}</div>
              <h3 className="text-white text-2xl font-bold leading-snug mb-2">{card.title}</h3>
              <p className="text-white/90 text-sm max-w-[90%] leading-relaxed">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
  );
};

const ServiceProviderDirectory: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const departments = [
    { name: "Electricity", logo: "⚡", phone: "1800-123-4567", hours: "Mon-Fri, 8AM-6PM" },
    { name: "Water", logo: "💧", phone: "1800-234-5678", hours: "Mon-Fri, 7AM-5PM" },
    { name: "Roads", logo: "🛣️", phone: "1800-345-6789", hours: "Mon-Sat, 7AM-7PM" },
    { name: "Waste", logo: "🗑️", phone: "1800-456-7890", hours: "Mon-Sun, 6AM-8PM" },
    { name: "Sanitation", logo: "🧼", phone: "1800-567-8901", hours: "Mon-Fri, 8AM-4PM" },
    { name: "Street Lighting", logo: "💡", phone: "1800-678-9012", hours: "Mon-Fri, 9AM-5PM" },
    { name: "Drainage", logo: "🌊", phone: "1800-789-0123", hours: "Mon-Sat, 7AM-6PM" },
    { name: "Other Services", logo: "🏛️", phone: "1800-890-1234", hours: "Mon-Fri, 8AM-5PM" }
  ].map(dept => ({
    ...dept,
    description: `${dept.name} infrastructure and maintenance services`
  }));

  const visibleDepartments = departments.slice(currentIndex, currentIndex + 4);

  const handleNav = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? Math.max(0, currentIndex - 1) 
                                        : Math.min(departments.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
  };

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    if (distance > 5) {
      // Swipe left
      handleNav('next');
    } else if (distance < -5) {
      // Swipe right
      handleNav('prev');
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNav('next');
      } else if (e.key === 'ArrowLeft') {
        handleNav('prev');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <section className="py-20 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('serviceSectors.jpg')" }}>
      <div className="absolute inset-0 bg-white bg-opacity-70"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Service Provider Directory</h2>
        
        <div className="relative">
          {/* Desktop navigation buttons */}
          {currentIndex > 0 && (
            <button 
              onClick={() => handleNav('prev')} 
              className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {currentIndex < departments.length - 1 && (
            <button 
              onClick={() => handleNav('next')} 
              className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Mobile swipe container */}
          <div 
            className="md:hidden overflow-x-auto pb-4 -mx-4 px-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex space-x-4 w-max">
              {departments.map((dept) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-gray-100 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all"
                  style={{ minWidth: '280px' }}
                >
                  <div className="text-3xl mb-3">{dept.logo}</div>
                  <h3 className="font-bold text-lg mb-2">{dept.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{dept.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{dept.hours}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Desktop grid view */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleDepartments.map((dept) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gray-100 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">{dept.logo}</div>
                <h3 className="font-bold text-lg mb-2">{dept.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{dept.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{dept.hours}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Mobile navigation dots */}
          <div className="md:hidden flex justify-center mt-6 space-x-2">
            {departments.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;

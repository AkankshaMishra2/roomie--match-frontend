// components/layout/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Moon, Sun, Bell, MessageSquare, Search, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth'; // Import AuthContext

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const router = useRouter();
  
  // Use auth context instead of a dummy user
  const { user, signOut } = useAuth(); // Get user and signOut from auth context

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // In a real implementation, you would update the document class or a theme context
  };

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { 
      scale: 1.05, 
      textShadow: "0 0 8px rgb(236, 72, 153, 0.8)",
      transition: { duration: 0.2, yoyo: Infinity, repeat: 1 }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 },
      textShadow: "0 0 8px rgba(236, 72, 153, 0.8)" 
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)",
      transition: { duration: 0.2 } 
    },
    tap: { scale: 0.95 }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0, 
      height: 0, 
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        when: "afterChildren" 
      } 
    },
    open: { 
      opacity: 1, 
      height: "auto", 
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.05 
      } 
    }
  };

  const mobileMenuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Find Roommates', path: '/roommates' },
    { title: 'How It Works', path: '/how-it-works' },
    { title: 'Pricing', path: '/pricing' },
  ];

  // Get background color based on scroll state and dark mode
  const getNavbarBg = () => {
    if (isDarkMode) {
      if (isScrolled || isMobileMenuOpen) {
        return 'bg-black/95 backdrop-blur-md border-b border-pink-600/10';
      }
      return 'bg-transparent';
    }
    return isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-sm' : 'bg-transparent';
  };

  // Get text color based on scroll state and dark mode
  const getTextColor = (isActive = false) => {
    if (isDarkMode) {
      return isActive ? 'text-pink-500' : 'text-gray-300 hover:text-pink-500';
    }
    
    if (isScrolled || isMobileMenuOpen) {
      return isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700';
    }
    return isActive ? 'text-white' : 'text-white/90 hover:text-white';
  };

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${getNavbarBg()}`}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Gradient accent that rises from the bottom in dark mode */}
      {isDarkMode && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-pink-600/30"></div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div 
            variants={logoVariants} 
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link href="/" className="flex items-center">
              <span className={`text-xl font-bold ${
                isDarkMode 
                  ? 'bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600' 
                  : isScrolled ? 'text-indigo-700' : 'text-white'
              } transition-all duration-300`}>
                RoomieMatch
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div key={link.path} variants={linkVariants} whileHover="hover">
                <Link 
                  href={link.path}
                  className={`relative text-sm font-medium transition-colors ${
                    router.pathname === link.path 
                      ? getTextColor(true)
                      : getTextColor()
                  }`}
                >
                  {link.title}
                  {router.pathname === link.path && isDarkMode && (
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                      layoutId="underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {router.pathname === link.path && !isDarkMode && (
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full bg-indigo-700"
                      layoutId="underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* Search Button */}
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${
                  isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900' : 
                  (isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10')
                }`}
              >
                <Search size={18} />
              </Button>
            </motion.div>
          </nav>

          {/* Desktop Auth Buttons & User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                className={`rounded-full ${
                  isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900' : 
                  (isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10')
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </motion.div>

            {user ? (
              <div className="flex items-center space-x-3">
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full relative ${
                      isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900' : 
                      (isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10')
                    }`}
                  >
                    <Bell size={18} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-xs text-white">
                      3
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full relative ${
                      isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900' : 
                      (isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10')
                    }`}
                  >
                    <MessageSquare size={18} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-xs text-white">
                      2
                    </span>
                  </Button>
                </motion.div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button 
                        variant="ghost" 
                        className={`rounded-full p-0 h-9 w-9 overflow-hidden ring-2 ${
                          isDarkMode 
                            ? 'ring-gray-800 hover:ring-pink-500/50' 
                            : 'ring-transparent hover:ring-indigo-300'
                        } transition-colors`}
                      >
                        <Avatar>
                          <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                          <AvatarFallback className={
                            isDarkMode ? "bg-gray-900 text-pink-500" : "bg-indigo-100 text-indigo-700"
                          }>
                            {user?.displayName ? user.displayName[0].toUpperCase() : <User size={16} />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-56 ${isDarkMode ? 'bg-gray-950 text-gray-200 border-gray-800' : ''}`}>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDarkMode ? "bg-gray-800" : ""} />
                    <DropdownMenuItem asChild className={isDarkMode ? "hover:bg-gray-900 focus:bg-gray-900 hover:text-pink-500" : ""}>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isDarkMode ? "hover:bg-gray-900 focus:bg-gray-900 hover:text-pink-500" : ""}>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isDarkMode ? "hover:bg-gray-900 focus:bg-gray-900 hover:text-pink-500" : ""}>
                      <Link href="/matches">My Matches</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isDarkMode ? "hover:bg-gray-900 focus:bg-gray-900 hover:text-pink-500" : ""}>
                      <Link href="/chat">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDarkMode ? "bg-gray-800" : ""} />
                    <DropdownMenuItem onClick={handleSignOut} className={isDarkMode ? "hover:bg-gray-900 focus:bg-gray-900 text-pink-500" : "text-red-600"}>
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* New Sign Out Button */}
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button 
                    variant="ghost"
                    onClick={handleSignOut}
                    className={
                      isDarkMode 
                        ? 'border border-gray-800 hover:border-pink-500/30 hover:bg-gray-900 text-pink-500' 
                        : (isScrolled ? 'border border-red-100 text-red-600 hover:bg-red-50' : 'border-white/30 text-white hover:bg-white/10')
                    }
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            ) : (
              <>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button 
                    asChild 
                    variant="ghost"
                    className={
                      isDarkMode 
                        ? 'border border-gray-800 hover:border-pink-500/30 hover:bg-gray-900 text-gray-300 hover:text-pink-500' 
                        : (isScrolled ? 'border hover:bg-gray-100' : 'border-white/30 text-white hover:bg-white/10')
                    }
                  >
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button 
                    asChild 
                    className={
                      isDarkMode 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0' 
                        : (isScrolled ? '' : 'bg-white text-indigo-700 hover:bg-white/90')
                    }
                  >
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMobileMenuOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className={
                    isDarkMode 
                      ? "text-pink-500" 
                      : (isScrolled || isMobileMenuOpen ? "text-gray-900" : "text-white")
                  } size={24} />
                ) : (
                  <Menu className={
                    isDarkMode 
                      ? "text-gray-300" 
                      : (isScrolled || isMobileMenuOpen ? "text-gray-900" : "text-white")
                  } size={24} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={`md:hidden overflow-hidden ${isDarkMode ? 'bg-black border-t border-gray-900 shadow-lg shadow-pink-900/10' : 'bg-white shadow-lg'}`}
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="px-4 py-2">
              <nav className="flex flex-col space-y-1 py-4">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    variants={mobileMenuItemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Link
                      href={link.path}
                      className={`block px-3 py-3 text-base font-medium rounded-md ${
                        router.pathname === link.path
                          ? (isDarkMode ? 'text-pink-500 bg-gray-900/50' : 'text-indigo-700 bg-indigo-50')
                          : (isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900/50' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50')
                      } transition-all duration-200`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.title}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Search */}
                <motion.div
                  variants={mobileMenuItemVariants}
                  className="mt-2 pt-2 border-t border-gray-800"
                >
                  <div className={`flex items-center px-3 py-3 rounded-md ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <Search size={18} className={isDarkMode ? 'text-pink-500' : 'text-gray-500'} />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className={`ml-2 bg-transparent border-none outline-none w-full ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                </motion.div>

                <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                  {user ? (
                    <>
                      <motion.div variants={mobileMenuItemVariants} className="flex items-center space-x-3 px-3 py-3">
                        <Avatar className="h-10 w-10 ring-2 ring-pink-500/20">
                          <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                          <AvatarFallback className={isDarkMode ? "bg-gray-900 text-pink-500" : "bg-indigo-100 text-indigo-700"}>
                            {user.displayName ? user.displayName[0].toUpperCase() : <User size={18} />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{user.displayName || "User"}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={mobileMenuItemVariants} whileHover={{ x: 5 }}>
                        <Link
                          href="/dashboard"
                          className={`block px-3 py-3 text-base font-medium rounded-md ${
                            isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900/50' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50'
                          } transition-all duration-200`}
                        >
                          Dashboard
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={mobileMenuItemVariants} whileHover={{ x: 5 }}>
                        <Link
                          href="/profile"
                          className={`block px-3 py-3 text-base font-medium rounded-md ${
                            isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900/50' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50'
                          } transition-all duration-200`}
                        >
                          Profile
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={mobileMenuItemVariants} whileHover={{ x: 5 }}>
                        <Link
                          href="/matches"
                          className={`block px-3 py-3 text-base font-medium rounded-md ${
                            isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900/50' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50'
                          } transition-all duration-200 flex justify-between items-center`}
                        >
                          <span>My Matches</span>
                          <Badge className={isDarkMode ? "bg-gray-900 text-pink-500 border border-pink-500/30" : "bg-indigo-100 text-indigo-700"}>New</Badge>
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={mobileMenuItemVariants} whileHover={{ x: 5 }}>
                        <Link
                          href="/chat"
                          className={`block px-3 py-3 text-base font-medium rounded-md ${
                            isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900/50' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50'
                          } transition-all duration-200 flex justify-between items-center`}
                        >
                          <span>Messages</span>
                          <Badge className={isDarkMode ? "bg-pink-500/20 text-pink-500" : "bg-red-100 text-red-700"}>2</Badge>
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={mobileMenuItemVariants} whileHover={{ x: 5 }} className="mt-3">
                        <button
                          onClick={handleSignOut}
                          className={`flex items-center w-full text-left px-3 py-3 text-base font-medium rounded-md ${
                            isDarkMode ? 'text-pink-500 hover:bg-gray-900/50' : 'text-red-600 hover:text-red-700 hover:bg-red-50/50'
                          } transition-all duration-200`}
                        >
                          <LogOut size={18} className="mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-3 py-3 px-2">
                      <motion.div variants={mobileMenuItemVariants}>
                        <Button 
                          asChild 
                          variant="outline" 
                          className={`w-full ${isDarkMode ? 'border-gray-800 text-gray-300 hover:border-pink-500/50 hover:text-pink-500 hover:bg-transparent' : ''}`}
                        >
                          <Link href="/auth/signin">
                            Sign In
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div variants={mobileMenuItemVariants}>
                        <Button 
                          asChild 
                          className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0' : ''}`}
                        >
                          <Link href="/auth/signup">
                            Sign Up
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Theme Toggle in Mobile */}
                  <motion.div variants={mobileMenuItemVariants} className="mt-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={toggleDarkMode}
                      className={`flex items-center w-full px-3 py-3 text-base font-medium rounded-md ${
                        isDarkMode ? 'text-gray-300 hover:text-pink-500 hover:bg-gray-900/50' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50'
                      } transition-all duration-200`}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun size={18} className="mr-3 text-pink-500" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon size={18} className="mr-3" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
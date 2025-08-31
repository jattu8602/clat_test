'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'

// Cache data outside component to persist across navigations
const paymentHistoryCache = {
  plans: null,
  userPayments: null,
  currentPlan: null,
  userStatus: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
}

export default function UserPaymentHistory() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState(paymentHistoryCache.plans || [])
  const [userPayments, setUserPayments] = useState(
    paymentHistoryCache.userPayments || []
  )
  const [currentPlan, setCurrentPlan] = useState(
    paymentHistoryCache.currentPlan || null
  )
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(!paymentHistoryCache.plans)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [razorpayKey, setRazorpayKey] = useState(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [userStatus, setUserStatus] = useState(
    paymentHistoryCache.userStatus || null
  )

  // Check if cache is still valid
  const isCacheValid = () => {
    if (!paymentHistoryCache.lastFetchTime) return false
    return (
      Date.now() - paymentHistoryCache.lastFetchTime <
      paymentHistoryCache.cacheExpiry
    )
  }

  useEffect(() => {
    if (session) {
      if (!paymentHistoryCache.plans || !isCacheValid()) {
        fetchData()
      } else {
        setLoading(false)
      }
      fetchRazorpayKey()
      loadRazorpayScript()
    }
  }, [session])

  // Monitor Razorpay loading state
  useEffect(() => {
    if (razorpayLoaded && window.Razorpay) {
      // Razorpay is ready
    }
  }, [razorpayLoaded])

  const loadRazorpayScript = () => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true)
      return
    }

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      setRazorpayLoaded(true)
      // Inject CSS to ensure Razorpay modal appears on top
      injectRazorpayStyles()
    }
    script.onerror = () => {
      setRazorpayLoaded(false)
    }
    document.body.appendChild(script)
  }

  const addRazorpayInteractionHandlers = () => {
    // Add click handlers to ensure the modal is interactive
    const modalElements = document.querySelectorAll(
      '.razorpay-checkout-frame, .razorpay-checkout'
    )

    modalElements.forEach((element) => {
      // Ensure the element is clickable
      element.style.pointerEvents = 'auto'
      element.style.cursor = 'default'

      // Add click handler to bring focus to the modal
      element.addEventListener('click', (e) => {
        e.stopPropagation()

        // Find and focus on any input fields
        const inputs = element.querySelectorAll('input, textarea, select')
        if (inputs.length > 0) {
          inputs[0].focus()
        }
      })

      // Also add mousedown handler for better interaction
      element.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        const target = e.target

        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT'
        ) {
          target.focus()
        }
      })
    })

    // Also try to focus on the modal itself
    const modal = document.querySelector('.razorpay-checkout-frame')
    if (modal) {
      modal.focus()
      modal.setAttribute('tabindex', '-1')
    }

    console.log('Added Razorpay interaction handlers')
  }

  const focusOnRazorpayInputs = () => {
    // Find and focus on input fields in the Razorpay modal
    const razorpayInputs = document.querySelectorAll(
      '.razorpay-checkout-frame input, .razorpay-checkout-frame textarea, .razorpay-checkout-frame select'
    )

    if (razorpayInputs.length > 0) {
      // Focus on the first input field
      razorpayInputs[0].focus()

      // Also ensure all inputs are interactive
      razorpayInputs.forEach((input) => {
        input.style.pointerEvents = 'auto'
        input.style.userSelect = 'text'
        input.style.webkitUserSelect = 'text'
        input.style.mozUserSelect = 'text'
        input.style.msUserSelect = 'text'

        // Add click event to ensure focus
        input.addEventListener(
          'click',
          () => {
            input.focus()
          },
          { once: true }
        )
      })

      console.log('Focused on Razorpay input field')
    } else {
      // If no inputs found, try to find them in iframes
      const iframes = document.querySelectorAll(
        '.razorpay-checkout-frame iframe'
      )
      iframes.forEach((iframe) => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document
          const iframeInputs = iframeDoc.querySelectorAll(
            'input, textarea, select'
          )
          iframeInputs.forEach((input) => {
            input.style.pointerEvents = 'auto'
            input.style.userSelect = 'text'
            input.focus()
          })
        } catch (e) {
          // Cross-origin iframe, can't access
        }
      })
    }

    // Also try to focus on any contact input specifically
    const contactInputs = document.querySelectorAll(
      'input[placeholder*="mobile"], input[placeholder*="phone"], input[type="tel"]'
    )
    contactInputs.forEach((input) => {
      input.style.pointerEvents = 'auto'
      input.style.userSelect = 'text'
      input.focus()
    })
  }

  const removeRazorpayDarkOverlays = () => {
    // Remove any dark overlays that Razorpay might have added
    const darkOverlays = document.querySelectorAll(
      '[style*="background-color: rgb(0, 0, 0)"], [style*="background-color: black"], .razorpay-backdrop, .razorpay-overlay'
    )

    darkOverlays.forEach((overlay) => {
      if (overlay.style) {
        overlay.style.backgroundColor = 'transparent'
        overlay.style.background = 'transparent'
      }
    })

    // Also check for any elements with dark backgrounds
    const allElements = document.querySelectorAll('*')
    allElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element)
      if (
        computedStyle.backgroundColor === 'rgb(0, 0, 0)' ||
        computedStyle.backgroundColor === 'black'
      ) {
        if (
          element.classList.contains('razorpay-checkout') ||
          element.classList.contains('razorpay-checkout-frame')
        ) {
          element.style.backgroundColor = 'transparent'
        }
      }
    })

    // Ensure the body doesn't have a dark background
    if (
      document.body.style.backgroundColor === 'rgb(0, 0, 0)' ||
      document.body.style.backgroundColor === 'black'
    ) {
      document.body.style.backgroundColor = 'transparent'
    }
  }

  const injectRazorpayStyles = () => {
    // Create and inject CSS to ensure Razorpay modal appears on top and has transparent background
    const style = document.createElement('style')
    style.textContent = `
      .razorpay-container {
        z-index: 999999 !important;
      }
      .razorpay-checkout-frame {
        z-index: 999999 !important;
      }
      .razorpay-checkout {
        z-index: 999999 !important;
      }
      .razorpay-checkout-frame iframe {
        z-index: 999999 !important;
      }
      .razorpay-checkout-frame {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 999999 !important;
      }

      /* Remove black background overlay */
      .razorpay-checkout-frame {
        background: transparent !important;
      }

      /* Make modal background transparent */
      .razorpay-checkout {
        background: transparent !important;
      }

      /* Remove any dark overlays */
      .razorpay-checkout-frame::before,
      .razorpay-checkout-frame::after {
        display: none !important;
      }

      /* Ensure the modal content has proper background */
      .razorpay-checkout-frame iframe {
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      }

      /* Remove any backdrop filters or dark backgrounds */
      .razorpay-checkout-frame {
        backdrop-filter: none !important;
        background-color: transparent !important;
      }

      /* Ensure the website background shows through */
      body.razorpay-open {
        overflow: hidden !important;
      }

      /* Custom modal styling */
      .razorpay-modal {
        background: rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(4px) !important;
      }

      /* Ensure input fields are interactive */
      .razorpay-checkout-frame input,
      .razorpay-checkout-frame textarea,
      .razorpay-checkout-frame select {
        pointer-events: auto !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }

      /* Force focus on input fields */
      .razorpay-checkout-frame input:focus,
      .razorpay-checkout-frame textarea:focus,
      .razorpay-checkout-frame select:focus {
        outline: 2px solid #3B82F6 !important;
        outline-offset: 2px !important;
        z-index: 1000000 !important;
      }

      /* Ensure modal is clickable */
      .razorpay-checkout-frame * {
        pointer-events: auto !important;
      }

      /* Remove any pointer-events: none that might interfere */
      .razorpay-checkout-frame {
        pointer-events: auto !important;
      }

      /* Ensure proper stacking context */
      .razorpay-checkout-frame iframe {
        position: relative !important;
        z-index: 1000000 !important;
      }
    `
    document.head.appendChild(style)
  }

  const fetchRazorpayKey = async () => {
    try {
      // Fetch the Razorpay key from an API endpoint
      const response = await fetch('/api/payments/razorpay-key')
      if (response.ok) {
        const data = await response.json()
        setRazorpayKey(data.key)
      }
    } catch (error) {
      console.error('Error fetching Razorpay key:', error)
    }
  }

  const fetchData = async () => {
    try {
      // Check plan expiry first
      await checkPlanExpiry()

      // Fetch available plans
      const plansResponse = await fetch('/api/payment-plans')
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlans(plansData.filter((plan) => plan.isActive))
        paymentHistoryCache.plans = plansData.filter((plan) => plan.isActive)
        paymentHistoryCache.lastFetchTime = Date.now()
      }

      // Fetch user's payment history
      const paymentsResponse = await fetch('/api/user/payments')
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setUserPayments(paymentsData)
        paymentHistoryCache.userPayments = paymentsData
        paymentHistoryCache.lastFetchTime = Date.now()
      }

      // Fetch current user status
      const statusResponse = await fetch('/api/user/status')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setUserStatus(statusData.user)
        paymentHistoryCache.userStatus = statusData.user
        paymentHistoryCache.lastFetchTime = Date.now()

        // Set current plan if user is paid
        if (statusData.user.isCurrentlyPaid && statusData.user.currentPlan) {
          // Find the corresponding payment for display
          const activePayment = userPayments.find(
            (payment) =>
              payment.status === 'SUCCESS' &&
              payment.plan.id === statusData.user.currentPlan.id
          )

          if (activePayment) {
            setCurrentPlan(activePayment)
            paymentHistoryCache.currentPlan = activePayment
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPlanExpiry = async () => {
    try {
      await fetch('/api/user/check-expiry', { method: 'POST' })
    } catch (error) {
      console.error('Error checking plan expiry:', error)
    }
  }

  const handlePurchase = (plan) => {
    if (!razorpayKey) {
      toast.error('Payment system is not ready. Please try again in a moment.')
      return
    }
    if (!razorpayLoaded) {
      toast.error(
        'Payment system is loading. Please wait a moment and try again.'
      )
      return
    }
    setSelectedPlan(plan)
    setIsPurchaseDialogOpen(true)
  }

  const closePurchaseDialog = () => {
    setIsPurchaseDialogOpen(false)
    setSelectedPlan(null)
    setIsProcessingPayment(false)
  }

  const initiatePayment = async () => {
    if (!razorpayKey) {
      toast.error('Payment system is not configured. Please contact support.')
      return
    }

    if (!razorpayLoaded || !window.Razorpay) {
      toast.error(
        'Payment system is not ready. Please refresh the page and try again.'
      )
      return
    }

    setIsProcessingPayment(true)
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.discount
            ? selectedPlan.price -
              (selectedPlan.price * selectedPlan.discount) / 100
            : selectedPlan.price,
        }),
      })

      if (response.ok) {
        const { orderId, amount, currency } = await response.json()

        // Initialize Razorpay
        const options = {
          key: razorpayKey,
          amount: amount * 100, // Razorpay expects amount in paise
          currency: currency,
          name: 'CLAT Prep',
          description: `Purchase: ${selectedPlan.name}`,
          order_id: orderId,
          handler: function (response) {
            // Handle successful payment
            handlePaymentSuccess(response)
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
          theme: {
            color: '#3B82F6',
            backdrop_color: 'transparent',
            hide_topbar: false,
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false)
            },
            escape: true,
            handleback: true,
            confirm_close: false,
            backdropclose: true,
            animation: true,
            // Ensure modal is interactive
            focus: true,
            autofocus: true,
          },
          // Ensure modal appears on top and handles focus properly
          config: {
            display: {
              blocks: {
                banks: {
                  name: 'Pay using any bank',
                  instruments: [
                    {
                      method: 'card',
                    },
                    {
                      method: 'netbanking',
                    },
                    {
                      method: 'wallet',
                    },
                    {
                      method: 'upi',
                    },
                  ],
                },
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: false,
                show_default_blocks: false,
              },
            },
          },
          // Additional options to ensure proper modal behavior
          retry: {
            enabled: true,
            max_count: 3,
          },
          callback_url: window.location.origin + '/dashboard/payment-history',
          cancel_url: window.location.origin + '/dashboard/payment-history',
          // Custom styling options
          style: {
            color: '#3B82F6',
            background: 'transparent',
          },
          // Ensure proper focus and interaction
          notes: {
            planId: selectedPlan.id,
            userId: session.user.id,
            planName: selectedPlan.name,
          },
          // Force modal to be interactive
          remember_customer: false,
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            contact: '',
          },
        }

        console.log('Opening Razorpay with options:', options)

        const razorpay = new window.Razorpay(options)

        // Ensure the modal opens on top
        setTimeout(() => {
          razorpay.open()

          // Additional cleanup to remove dark backgrounds
          setTimeout(() => {
            removeRazorpayDarkOverlays()

            // Actively focus on input fields
            setTimeout(() => {
              focusOnRazorpayInputs()

              // Add additional click handlers to ensure interaction
              addRazorpayInteractionHandlers()
            }, 500)

            // Set up a mutation observer to continuously remove dark overlays
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                      // Element node
                      if (
                        node.style &&
                        (node.style.backgroundColor === 'rgb(0, 0, 0)' ||
                          node.style.backgroundColor === 'black')
                      ) {
                        node.style.backgroundColor = 'transparent'
                      }
                      // Check child elements too
                      const darkChildren = node.querySelectorAll(
                        '[style*="background-color: rgb(0, 0, 0)"], [style*="background-color: black"]'
                      )
                      darkChildren.forEach((child) => {
                        if (child.style) {
                          child.style.backgroundColor = 'transparent'
                        }
                      })
                    }
                  })
                }
              })
            })

            // Start observing
            observer.observe(document.body, {
              childList: true,
              subtree: true,
            })

            // Stop observing after 10 seconds
            setTimeout(() => {
              observer.disconnect()
            }, 10000)
          }, 200)
        }, 100)
      } else {
        // Handle API errors
        const errorData = await response.json()
        console.error('Payment API error:', errorData)
        toast.error(
          `Failed to create order: ${errorData.error || 'Unknown error'}`
        )
        setIsProcessingPayment(false)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create payment order. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  const handlePaymentSuccess = async (response) => {
    try {
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          planId: selectedPlan.id,
        }),
      })

      if (verifyResponse.ok) {
        setIsPurchaseDialogOpen(false)
        setSelectedPlan(null)

        // Refresh user status and data
        await fetchData()

        // Show success message
        toast.success('Payment successful! You are now a paid user.')

        // Refresh sidebar stats if available
        if (window.refreshSidebarStats) {
          window.refreshSidebarStats()
        }

        // Refresh header notifications if available
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }

        // Force a page refresh to update the UI
        window.location.reload()
      } else {
        const errorData = await verifyResponse.json()
        toast.error(
          `Payment verification failed: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error(
        'Payment was successful but verification failed. Please contact support.'
      )
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const calculateRemainingDays = (payment) => {
    const startDate = new Date(payment.createdAt)
    const endDate = new Date(
      startDate.getTime() + payment.plan.duration * 24 * 60 * 60 * 1000
    )
    const now = new Date()
    const remainingMs = endDate - now
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))
    return Math.max(0, remainingDays)
  }

  const formatDuration = (plan) => {
    if (plan.durationType === 'until_date' && plan.untilDate) {
      return `Until ${new Date(plan.untilDate).toLocaleDateString()}`
    }
    return `${plan.duration} ${plan.durationType}`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
            Payment History & Plans
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Manage your subscription and view payment history
          </p>
        </div>

        {/* Payment System Status - Only show if there are issues */}
        {!razorpayLoaded && (
          <Card className="mb-6 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span>Initializing payment system...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {razorpayLoaded && !razorpayKey && (
          <Card className="mb-6 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <span>
                  ⚠️ Payment system is temporarily unavailable. Please try again
                  later.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Plan Status */}
        {userStatus?.isCurrentlyPaid && userStatus?.currentPlan && (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-700/20"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span>Current Active Plan</span>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-green-100 text-sm font-medium">
                    Plan
                  </span>
                  <div className="font-bold text-xl text-white mt-1">
                    {userStatus.currentPlan.name}
                  </div>
                </div>
                <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-green-100 text-sm font-medium">
                    Duration
                  </span>
                  <div className="font-bold text-xl text-white mt-1">
                    {formatDuration(userStatus.currentPlan)}
                  </div>
                </div>
                <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-green-100 text-sm font-medium">
                    Days Remaining
                  </span>
                  <div className="font-bold text-2xl text-yellow-300 mt-1">
                    {userStatus.daysRemaining} days
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans for Free Users */}
        {!userStatus?.isCurrentlyPaid && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
              Choose Your Plan
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="animate-pulse border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan, index) => {
                  const getPlanGradient = () => {
                    const gradients = [
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-pink-500',
                      'from-orange-500 to-red-500',
                      'from-green-500 to-emerald-500',
                      'from-indigo-500 to-purple-500',
                      'from-pink-500 to-rose-500',
                    ]
                    return gradients[index % gradients.length]
                  }

                  return (
                    <Card
                      key={plan.id}
                      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-105"
                    >
                      {/* Gradient Header */}
                      <div
                        className={`h-2 bg-gradient-to-r ${getPlanGradient()}`}
                      />

                      {/* Popular Badge */}
                      {index === 1 && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            {plan.name}
                          </CardTitle>
                          {plan.discount && plan.discount > 0 && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-md">
                              {plan.discount}% OFF
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Price Section */}
                        <div className="text-center">
                          <div className="flex items-baseline justify-center gap-2">
                            {plan.discount && plan.discount > 0 && (
                              <span className="text-2xl text-slate-400 line-through">
                                ₹{plan.price}
                              </span>
                            )}
                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ₹
                              {plan.discount
                                ? (
                                    plan.price -
                                    (plan.price * plan.discount) / 100
                                  ).toFixed(0)
                                : plan.price}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {formatDuration(plan)}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              Access to all premium tests
                            </span>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              Detailed performance analytics
                            </span>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              Unlimited test attempts
                            </span>
                          </div>
                        </div>

                        {plan.description && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                              {plan.description}
                            </p>
                          </div>
                        )}

                        <Button
                          className={`w-full py-3 text-lg font-semibold bg-gradient-to-r ${getPlanGradient()} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white border-0`}
                          onClick={() => handlePurchase(plan)}
                          disabled={!razorpayLoaded || !razorpayKey}
                        >
                          {!razorpayLoaded ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Loading...
                            </>
                          ) : !razorpayKey ? (
                            'Unavailable'
                          ) : (
                            'Get Started'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
            Payment History
          </h2>
          {userPayments.length === 0 ? (
            <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Payment History
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  You haven't made any payments yet. Choose a plan above to get
                  started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPayments.map((payment) => (
                <Card
                  key={payment.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            payment.status === 'SUCCESS'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              payment.status === 'SUCCESS'
                                ? 'text-green-600 dark:text-green-400'
                                : payment.status === 'PENDING'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {payment.status === 'SUCCESS' ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            ) : payment.status === 'PENDING' ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            )}
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Plan
                          </span>
                          <div className="font-bold text-lg text-slate-900 dark:text-white">
                            {payment.plan.name}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Amount
                        </span>
                        <div className="font-bold text-xl text-slate-900 dark:text-white">
                          ₹{payment.amount}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Status
                        </span>
                        <Badge
                          className={`mt-1 ${
                            payment.status === 'SUCCESS'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
                              : payment.status === 'PENDING'
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0'
                          }`}
                        >
                          {payment.status}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Date
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {new Date(payment.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Dialog */}
        <Dialog
          open={isPurchaseDialogOpen}
          onOpenChange={(open) => {
            if (!open) closePurchaseDialog()
          }}
        >
          <DialogContent className="bg-white dark:bg-slate-900 max-w-md border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                Confirm Purchase
              </DialogTitle>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {selectedPlan.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Original Price:</span>
                      <span>₹{selectedPlan.price}</span>
                    </div>
                    {selectedPlan.discount && selectedPlan.discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount ({selectedPlan.discount}%):</span>
                        <span>
                          -₹
                          {(
                            (selectedPlan.price * selectedPlan.discount) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-slate-200 dark:border-slate-700 pt-2 text-slate-900 dark:text-white">
                      <span>Final Price:</span>
                      <span>
                        ₹
                        {selectedPlan.discount
                          ? (
                              selectedPlan.price -
                              (selectedPlan.price * selectedPlan.discount) / 100
                            ).toFixed(2)
                          : selectedPlan.price}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Duration: {formatDuration(selectedPlan)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={closePurchaseDialog}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={initiatePayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

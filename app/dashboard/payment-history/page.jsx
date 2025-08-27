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

export default function UserPaymentHistory() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState([])
  const [userPayments, setUserPayments] = useState([])
  const [currentPlan, setCurrentPlan] = useState(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [razorpayKey, setRazorpayKey] = useState(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [userStatus, setUserStatus] = useState(null)

  useEffect(() => {
    if (session) {
      fetchData()
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
      }

      // Fetch user's payment history
      const paymentsResponse = await fetch('/api/user/payments')
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setUserPayments(paymentsData)
      }

      // Fetch current user status
      const statusResponse = await fetch('/api/user/status')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setUserStatus(statusData.user)

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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payment History & Plans</h1>

      {/* Payment System Status - Only show if there are issues */}
      {!razorpayLoaded && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Initializing payment system...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {razorpayLoaded && !razorpayKey && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
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
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-800">Current Active Plan</span>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Plan:</span>
                <div className="font-semibold text-lg">
                  {userStatus.currentPlan.name}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duration:</span>
                <div className="font-semibold">
                  {formatDuration(userStatus.currentPlan)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Days Remaining:</span>
                <div className="font-semibold text-lg text-green-600">
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
          <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="relative hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      {plan.discount && plan.discount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          {plan.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    {plan.thumbnailUrl && (
                      <img
                        src={plan.thumbnailUrl}
                        alt={plan.name}
                        className="w-full h-32 object-cover rounded-md mt-3"
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {formatDuration(plan)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Original Price:
                        </span>
                        <span className="font-medium">₹{plan.price}</span>
                      </div>

                      {plan.discount && plan.discount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Discount:
                          </span>
                          <span className="font-medium text-green-600">
                            {plan.discount}%
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Final Price:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ₹
                          {plan.discount
                            ? (
                                plan.price -
                                (plan.price * plan.discount) / 100
                              ).toFixed(2)
                            : plan.price}
                        </span>
                      </div>

                      {plan.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {plan.description}
                        </p>
                      )}

                      <Button
                        className="w-full mt-4"
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
                          'Purchase Plan'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
        {userPayments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No payment history found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userPayments.map((payment) => (
              <Card
                key={payment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-600">Plan:</span>
                      <div className="font-semibold">{payment.plan.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Amount:</span>
                      <div className="font-semibold">₹{payment.amount}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge
                        variant={
                          payment.status === 'SUCCESS'
                            ? 'default'
                            : payment.status === 'PENDING'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={
                          payment.status === 'SUCCESS'
                            ? 'bg-green-600'
                            : payment.status === 'PENDING'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Date:</span>
                      <div className="font-semibold">
                        {new Date(payment.createdAt).toLocaleDateString()}
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
        <DialogContent className="bg-white dark:bg-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedPlan.name}
                </h3>
                <p className="text-gray-600 mb-4">{selectedPlan.description}</p>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span>₹{selectedPlan.price}</span>
                  </div>
                  {selectedPlan.discount && selectedPlan.discount > 0 && (
                    <div className="flex justify-between text-green-600">
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
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
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

                <div className="text-sm text-gray-600 mt-2">
                  Duration: {formatDuration(selectedPlan)}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closePurchaseDialog}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
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
  )
}

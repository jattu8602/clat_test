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

export default function UserPaymentHistory() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState([])
  const [userPayments, setUserPayments] = useState([])
  const [currentPlan, setCurrentPlan] = useState(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
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

        // Find current active plan
        const activePayment = paymentsData.find(
          (payment) =>
            payment.status === 'SUCCESS' &&
            new Date(payment.createdAt) <= new Date() &&
            new Date(
              payment.createdAt.getTime() +
                payment.plan.duration * 24 * 60 * 60 * 1000
            ) > new Date()
        )

        if (activePayment) {
          setCurrentPlan(activePayment)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (plan) => {
    setSelectedPlan(plan)
    setIsPurchaseDialogOpen(true)
  }

  const initiatePayment = async () => {
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
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        // Handle API errors
        const errorData = await response.json()
        alert(`Failed to create order: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create payment order. Please try again.')
    } finally {
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
        fetchData() // Refresh data
        alert('Payment successful! You are now a paid user.')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
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

      {/* Current Plan Status */}
      {currentPlan && (
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
                  {currentPlan.plan.name}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duration:</span>
                <div className="font-semibold">
                  {formatDuration(currentPlan.plan)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Days Remaining:</span>
                <div className="font-semibold text-lg text-green-600">
                  {calculateRemainingDays(currentPlan)} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans for Free Users */}
      {!currentPlan && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="relative hover:shadow-lg transition-shadow"
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
                        <span className="text-sm text-gray-600">Discount:</span>
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
                    >
                      Purchase Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Card key={payment.id}>
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
        onOpenChange={setIsPurchaseDialogOpen}
      >
        <DialogContent className="bg-white dark:bg-slate-900">
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
                  onClick={() => setIsPurchaseDialogOpen(false)}
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

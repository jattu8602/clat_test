'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, CreditCard, Calendar, DollarSign } from 'lucide-react'

export default function PaymentHistoryPage() {
  const payments = [
    {
      id: 1,
      testName: 'Advanced Legal Reasoning',
      amount: '₹299',
      date: '2024-01-15',
      status: 'completed',
      transactionId: 'TXN123456789',
      paymentMethod: 'Credit Card',
      invoice: 'INV-2024-001',
    },
    {
      id: 2,
      testName: 'Full CLAT Mock Test',
      amount: '₹499',
      date: '2024-01-10',
      status: 'completed',
      transactionId: 'TXN123456788',
      paymentMethod: 'UPI',
      invoice: 'INV-2024-002',
    },
    {
      id: 3,
      testName: 'CLAT Success Package',
      amount: '₹799',
      date: '2024-01-05',
      status: 'pending',
      transactionId: 'TXN123456787',
      paymentMethod: 'Net Banking',
      invoice: 'INV-2024-003',
    },
    {
      id: 4,
      testName: 'Legal Aptitude Mastery',
      amount: '₹199',
      date: '2024-01-01',
      status: 'failed',
      transactionId: 'TXN123456786',
      paymentMethod: 'Credit Card',
      invoice: 'INV-2024-004',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalSpent = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseInt(p.amount.replace('₹', '')), 0)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-2">
          View and manage your payment transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              On completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (payments.filter((p) => p.status === 'completed').length /
                  payments.length) *
                  100
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your payment history and transaction details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {payment.testName}
                    </h4>
                    <span className="text-lg font-bold text-gray-900">
                      {payment.amount}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{payment.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-4 w-4" />
                      <span>{payment.paymentMethod}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Transaction ID: {payment.transactionId}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Download your payment history for record keeping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

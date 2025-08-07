import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, TrendingUp, History } from 'lucide-react'

interface Commodity {
  id: number
  name: string
  type?: string
  currentPrice: number
  previousPrice?: number
  priceChange?: number
  priceChangePercent?: number
  lastUpdated: string
  unit: string
}

interface Order {
  id: number
  userId: number
  commodityId: number
  type: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  status: string
  createdAt: string
  processedAt?: string
  processedBy?: number
}

const UserDashboard: React.FC = () => {
  const { user, logout, token, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('commodities')
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [tradingStates, setTradingStates] = useState<{[key: number]: {isTrading: boolean, orderType: 'buy' | 'sell', quantity: string}}>({})


  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [commoditiesRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/commodities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/transaction/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (commoditiesRes.ok) setCommodities(await commoditiesRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }


  const toggleTrading = (commodityId: number) => {
    setTradingStates(prev => ({
      ...prev,
      [commodityId]: {
        isTrading: !prev[commodityId]?.isTrading,
        orderType: prev[commodityId]?.orderType || 'buy',
        quantity: prev[commodityId]?.quantity || ''
      }
    }))
  }

  const setOrderTypeForCommodity = (commodityId: number, orderType: 'buy' | 'sell') => {
    setTradingStates(prev => ({
      ...prev,
      [commodityId]: { ...prev[commodityId], orderType }
    }))
  }

  const setQuantityForCommodity = (commodityId: number, quantity: string) => {
    setTradingStates(prev => ({
      ...prev,
      [commodityId]: { ...prev[commodityId], quantity }
    }))
  }

  const placeInlineOrder = async (commodityId: number) => {
    const tradingState = tradingStates[commodityId]
    if (!tradingState?.quantity) {
      setError('Please enter quantity')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/transaction/place`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          commodityId: commodityId,
          transactionType: tradingState.orderType.toUpperCase(),
          quantity: parseInt(tradingState.quantity)
        })
      })

      if (response.ok) {
        setSuccess('Order placed successfully!')
        setTradingStates(prev => ({
          ...prev,
          [commodityId]: { ...prev[commodityId], isTrading: false, quantity: '' }
        }))
        fetchData()
        refreshUser()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to place order')
      }
    } catch (err) {
      setError('Failed to place order')
    }
  }

  const renderCommodities = () => (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Available Balance</h3>
              <p className="text-2xl font-bold text-blue-600">₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-blue-500">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commodities.map((commodity) => (
          <Card key={commodity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{commodity.name}</CardTitle>
                  <CardDescription>{commodity.unit}</CardDescription>
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded ${
                  (commodity.priceChange || 0) >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(commodity.priceChange || 0) >= 0 ? '↑' : '↓'} {(commodity.priceChangePercent || 0).toFixed(2)}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">₹{commodity.currentPrice}</div>
                <div className="text-sm text-gray-600">
                  Previous: ₹{commodity.previousPrice || commodity.currentPrice}
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {commodity.lastUpdated ? new Date(commodity.lastUpdated).toLocaleString() : 'Unknown'}
                </div>
                {!tradingStates[commodity.id]?.isTrading ? (
                  <Button 
                    className="w-full mt-3" 
                    onClick={() => toggleTrading(commodity.id)}
                  >
                    Trade
                  </Button>
                ) : (
                  <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant={tradingStates[commodity.id]?.orderType === 'buy' ? 'default' : 'outline'}
                        onClick={() => setOrderTypeForCommodity(commodity.id, 'buy')}
                        className="flex-1"
                      >
                        Buy
                      </Button>
                      <Button 
                        size="sm" 
                        variant={tradingStates[commodity.id]?.orderType === 'sell' ? 'default' : 'outline'}
                        onClick={() => setOrderTypeForCommodity(commodity.id, 'sell')}
                        className="flex-1"
                      >
                        Sell
                      </Button>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={tradingStates[commodity.id]?.quantity || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || /^\d+$/.test(value)) {
                          setQuantityForCommodity(commodity.id, value)
                        }
                      }}
                      placeholder="Enter quantity (whole numbers only)"
                      className="text-sm"
                    />
                    {tradingStates[commodity.id]?.quantity && (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>₹{(parseInt(tradingStates[commodity.id]?.quantity || '0') * commodity.currentPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => placeInlineOrder(commodity.id)}
                        disabled={!tradingStates[commodity.id]?.quantity}
                        className="flex-1"
                      >
                        Place Order
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleTrading(commodity.id)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )


  const renderOrders = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Order History</h3>
      <div className="grid gap-4">
        {orders.map((order) => {
          const commodity = commodities.find(c => c.id === order.commodityId)
          
          return (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Order #{order.id}</h4>
                    <p className="text-sm text-gray-600">
                      {order.type.toUpperCase()} {order.quantity} {commodity?.unit || 'units'} of {commodity?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{order.totalAmount?.toFixed(2) || '0.00'}</div>
                    <div className="text-xs text-gray-600">@ ₹{order.pricePerUnit || '0.00'}</div>
                    <Badge variant={
                      order.status === 'approved' ? 'default' :
                      order.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {orders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No orders yet. Start trading to see your order history!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">IndiTrad</h1>
                <p className="text-sm text-gray-600">Trading Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-600">Wallet: ₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'commodities', label: 'Market Prices', icon: TrendingUp },
                { id: 'orders', label: 'Order History', icon: History }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'commodities' && renderCommodities()}
            {activeTab === 'orders' && renderOrders()}
          </>
        )}
      </div>
    </div>
  )
}

export default UserDashboard

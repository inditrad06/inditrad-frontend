import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, TrendingUp, ShoppingCart, History } from 'lucide-react'

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
  orderType: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  status: string
  createdAt: string
  processedAt?: string
  processedBy?: number
}

const UserDashboard: React.FC = () => {
  const { user, logout, token } = useAuth()
  const [activeTab, setActiveTab] = useState('commodities')
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedCommodity, setSelectedCommodity] = useState<number | null>(null)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchData()
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

  const placeOrder = async () => {
    if (!selectedCommodity || !quantity) {
      setError('Please select a commodity and enter quantity')
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
          commodityId: selectedCommodity,
          orderType: orderType,
          quantity: parseFloat(quantity)
        })
      })

      if (response.ok) {
        setSuccess('Order placed successfully!')
        setSelectedCommodity(null)
        setQuantity('')
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to place order')
      }
    } catch (err) {
      setError('Failed to place order')
    }
  }

  const selectedCommodityData = commodities.find(c => c.id === selectedCommodity)
  const totalAmount = selectedCommodityData && quantity ? 
    (parseFloat(quantity) * selectedCommodityData.currentPrice).toFixed(2) : '0.00'

  const renderCommodities = () => (
    <div className="space-y-6">
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
                <div className="text-2xl font-bold">${commodity.currentPrice}</div>
                <div className="text-sm text-gray-600">
                  Previous: ${commodity.previousPrice || commodity.currentPrice}
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {new Date(commodity.lastUpdated).toLocaleString()}
                </div>
                <Button 
                  className="w-full mt-3" 
                  onClick={() => {
                    setSelectedCommodity(commodity.id)
                    setActiveTab('trade')
                  }}
                >
                  Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderTrade = () => (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Place Order
          </CardTitle>
          <CardDescription>
            Current wallet balance: ${user?.walletBalance.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Commodity</label>
            <Select value={selectedCommodity?.toString() || ''} onValueChange={(value) => setSelectedCommodity(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((commodity) => (
                  <SelectItem key={commodity.id} value={commodity.id.toString()}>
                    {commodity.name} - ${commodity.currentPrice}/{commodity.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Order Type</label>
            <Select value={orderType} onValueChange={(value: 'buy' | 'sell') => setOrderType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          {selectedCommodityData && quantity && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Price per unit:</span>
                <span>${selectedCommodityData.currentPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>{quantity} {selectedCommodityData.unit}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total Amount:</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          )}

          <Button onClick={placeOrder} className="w-full" disabled={!selectedCommodity || !quantity}>
            Place {orderType.toUpperCase()} Order
          </Button>
        </CardContent>
      </Card>
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
                      {order.orderType.toUpperCase()} {order.quantity} {commodity?.unit} of {commodity?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${order.totalAmount.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">@ ${order.pricePerUnit}</div>
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
                <p className="text-xs text-gray-600">Wallet: ${user?.walletBalance.toFixed(2)}</p>
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
                { id: 'trade', label: 'Place Order', icon: ShoppingCart },
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
            {activeTab === 'trade' && renderTrade()}
            {activeTab === 'orders' && renderOrders()}
          </>
        )}
      </div>
    </div>
  )
}

export default UserDashboard

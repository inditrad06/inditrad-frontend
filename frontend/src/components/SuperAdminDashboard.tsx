import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, Users, TrendingUp, DollarSign, Settings, Edit, Eye } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  walletBalance: number
  admin?: any
  createdAt: string
  status: string
}

interface Admin {
  id: number
  username: string
  email: string
  name: string
  mobile: string
  status: string
  createdAt: string
}

interface Commodity {
  id: number
  name: string
  unit: string
  currentPrice: number
  lastUpdated: string
}

interface Order {
  id: number
  userId?: number
  commodityId?: number
  type: string
  quantity: number
  pricePerUnit?: number
  price?: number
  totalAmount?: number
  status: string
  createdAt?: string
  timestamp?: string
  processedAt?: string
  processedBy?: number
}

const SuperAdminDashboard: React.FC = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAdminUsers, setSelectedAdminUsers] = useState<User[]>([])
  const [showAdminDetails, setShowAdminDetails] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, adminsRes, commoditiesRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/superadmin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/superadmin/admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/commodities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/transaction/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (adminsRes.ok) setAdmins(await adminsRes.json())
      if (commoditiesRes.ok) setCommodities(await commoditiesRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }


  const fetchAdminUsers = async (adminId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/${adminId}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const adminUsers = await response.json()
        setSelectedAdminUsers(adminUsers)
        setShowAdminDetails(true)
      }
    } catch (err) {
      setError('Failed to fetch admin users')
    }
  }

  const updateCommodityPrice = async (commodityId: number, newPrice: number) => {
    try {
      const response = await fetch(`${API_URL}/api/commodities/${commodityId}/price`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: newPrice })
      })

      if (response.ok) {
        fetchData()
      } else {
        setError('Failed to update commodity price')
      }
    } catch (err) {
      setError('Failed to update commodity price')
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{admins.length + users.length}</div>
          <p className="text-xs text-muted-foreground">
            {admins.length} Admins, {users.length} Users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground">
            {orders.filter(o => o.status === 'pending').length} Pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wallet Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${users.reduce((sum, u) => sum + (u.walletBalance || 0), 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commodities</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{commodities.length}</div>
          <p className="text-xs text-muted-foreground">
            Active commodities
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderCommodities = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Commodity Management</h3>
      </div>
      
      <div className="grid gap-4">
        {commodities.map((commodity) => (
          <Card key={commodity.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-semibold">{commodity.name}</h4>
                    <p className="text-sm text-gray-600">{commodity.unit}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{commodity.currentPrice}</div>
                    <div className="text-sm text-gray-600">
                      Updated: {commodity.lastUpdated ? new Date(commodity.lastUpdated).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="New price"
                    className="w-24"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newPrice = parseFloat((e.target as HTMLInputElement).value)
                        if (newPrice > 0) {
                          updateCommodityPrice(commodity.id, newPrice)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                <p className="text-sm text-gray-600">Super Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-600">Super Administrator</p>
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
                { id: 'overview', label: 'Overview' },
                { id: 'commodities', label: 'Commodities' },
                { id: 'users', label: 'Users' },
                { id: 'orders', label: 'Orders' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
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


        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'commodities' && renderCommodities()}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => navigate('/create-admin')}>Add Admin</Button>
                    <Button onClick={() => navigate('/create-user')}>Add User</Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Admins ({admins.length})</h4>
                    {admins.map((admin) => (
                      <Card key={admin.id} className="mb-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{admin.username}</h4>
                              <p className="text-sm text-gray-600">{admin.email || admin.name}</p>
                              <p className="text-xs text-gray-500">
                                Created: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant="default">Admin</Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => fetchAdminUsers(admin.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Users
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">All Users ({users.length})</h4>
                    {users.map((u) => (
                      <Card key={u.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{u.username}</h4>
                              <p className="text-sm text-gray-600">{u.email}</p>
                              <p className="text-xs text-gray-500">
                                Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant="secondary">User</Badge>
                              <div className="text-right">
                                <div className="font-semibold">₹{(u.walletBalance || 0).toFixed(2)}</div>
                                <div className="text-xs text-gray-600">Wallet Balance</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {showAdminDetails && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Admin Users ({selectedAdminUsers.length})</h4>
                      <Button size="sm" variant="outline" onClick={() => setShowAdminDetails(false)}>
                        Close
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {selectedAdminUsers.map((user) => (
                        <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded">
                          <span>{user.username}</span>
                          <span className="text-sm text-gray-600">₹{(user.walletBalance || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Management</h3>
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Order #{order.id}</h4>
                            <p className="text-sm text-gray-600">
                              {order.type.toUpperCase()} - {order.quantity} units
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={
                              order.status === 'approved' ? 'default' :
                              order.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {order.status}
                            </Badge>
                            <div className="text-right">
                              <div className="font-semibold">₹{((order.price || order.pricePerUnit || 0) * (order.quantity || 0)).toFixed(2)}</div>
                              <div className="text-xs text-gray-600">Total Amount</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SuperAdminDashboard

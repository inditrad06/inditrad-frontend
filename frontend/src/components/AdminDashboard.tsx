import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { LogOut, Users, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import UpdateWalletModal from './UpdateWalletModal'
import EditUserModal from './EditUserModal'

interface User {
  id: number
  username: string
  email: string
  name: string
  mobile: string
  role: string
  walletBalance: number
  adminId?: number
  createdAt: string
  status: string
  isActive: boolean
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

const AdminDashboard: React.FC = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const API_URL = 'http://localhost:8080'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, ordersRes, commoditiesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/${user?.id}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/transaction/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/commodities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (commoditiesRes.ok) setCommodities(await commoditiesRes.json())
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const processOrder = async (orderId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`${API_URL}/api/transaction/orders/${orderId}/process`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchData()
      } else {
        setError('Failed to process order')
      }
    } catch (err) {
      setError('Failed to process order')
    }
  }

  const toggleUserStatus = async (userId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setError('');
        fetchData();
      } else {
        setError('Failed to update user status');
      }
    } catch (err) {
      setError('Failed to update user status');
    }
  };
  
  const openUpdateWalletModal = (userId: number) => {
    setSelectedUserId(userId);
    setWalletModalOpen(true);
  };
  
  const openEditUserModal = (user: User) => {
    setSelectedUser(user);
    setEditUserModalOpen(true);
  };
  
  const closeWalletModal = () => {
    setWalletModalOpen(false);
    setSelectedUserId(null);
  };

  const myUsers = users
  const pendingOrders = orders.filter(o => o.status === 'pending')

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{myUsers.length}</div>
          <p className="text-xs text-muted-foreground">
            Users under your management
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders.length}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting your approval
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
            ₹{myUsers.reduce((sum, u) => sum + u.walletBalance, 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Your users' wallets
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
            All orders from your users
          </p>
        </CardContent>
      </Card>
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
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-600">Administrator</p>
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
                { id: 'orders', label: 'Orders' },
                { id: 'users', label: 'My Users' },
                { id: 'commodities', label: 'Commodities' }
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
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Management</h3>
                <div className="grid gap-4">
                  {orders.map((order) => {
                    const commodity = commodities.find(c => c.id === order.commodityId)
                    const orderUser = users.find(u => u.id === order.userId)
                    const pricePerUnit = order.price || order.pricePerUnit || 0
                    const totalAmount = pricePerUnit * (order.quantity || 0)
                    const createdAt = order.timestamp || order.createdAt
                    
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">Order #{order.id}</h4>
                              <p className="text-sm text-gray-600">
                                {orderUser?.username || 'Unknown User'} - {order.type.toUpperCase()} {order.quantity} {commodity?.unit || 'units'} of {commodity?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {createdAt ? new Date(createdAt).toLocaleDateString() : 'Pending'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-semibold">₹{totalAmount.toFixed(2)}</div>
                                <div className="text-xs text-gray-600">@ ₹{pricePerUnit.toFixed(2)}</div>
                              </div>
                              <Badge variant={
                                order.status === 'approved' ? 'default' :
                                order.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {order.status}
                              </Badge>
                              {order.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => processOrder(order.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => processOrder(order.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">My Users</h3>
                  <Button onClick={() => navigate('/create-user')}>Add User</Button>
                </div>
                <div className="grid gap-4">
                  {myUsers.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{u.username}</h4>
                            {u.email && <p className="text-sm text-gray-600">{u.email}</p>}
                            <p className="text-xs text-gray-500">
                              Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="font-semibold">₹{u.walletBalance?.toFixed(2) || '0.00'}</div>
                            <div className="text-xs text-gray-600">Wallet Balance</div>
                            <Badge 
                              variant={u.status === 'ACTIVE' ? 'default' : 'destructive'}
                              className={u.status === 'ACTIVE' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                            >
                              {u.status || 'ACTIVE'}
                            </Badge>
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                                {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openUpdateWalletModal(u.id)}>
                                Update Wallet
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openEditUserModal(u)}>
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'commodities' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Commodity Prices</h3>
                <div className="grid gap-4">
                  {commodities.map((commodity) => (
                    <Card key={commodity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{commodity.name}</h4>
                            <p className="text-sm text-gray-600">{commodity.unit}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">${commodity.currentPrice}</div>
                            <div className={`text-sm flex items-center justify-end ${
                              (commodity.priceChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(commodity.priceChange || 0) >= 0 ? '↑' : '↓'} 
                              {(commodity.priceChangePercent || 0).toFixed(2)}%
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
      
      {/* Modals */}
      {walletModalOpen && selectedUserId && (
        <UpdateWalletModal
          userId={selectedUserId}
          isOpen={walletModalOpen}
          onClose={closeWalletModal}
          onSuccess={fetchData}
        />
      )}
      {editUserModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={editUserModalOpen}
          onClose={() => setEditUserModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}

export default AdminDashboard

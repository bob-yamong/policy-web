'use client'

import { useState, useEffect } from 'react'
import { Search, Settings, FileText, Box, Filter, RefreshCw, Activity, Cpu, HardDrive, Database, CheckCircle, User, Server, AlertTriangle, ShieldCheck, Lock, Globe, ArrowLeft } from 'lucide-react'
import yaml from 'js-yaml'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import { containerStructure } from './axios-struct'





const actionCategories = {
  Network: ['Connection Block', 'Port Block', 'IP Block'],
  Filesystem: ['Read Block', 'Write Block', 'Execute Block'],
  Process: ['Process Creation Block', 'Process Termination Block', 'Process Modification Block']
}

const predefinedPolicies = [
  { 
    name: 'Web Server Rules', 
    icon: Globe,
    description: 'Secure configuration for web servers',
    rules: [
      { type: 'allow', action: 'Connection', target: 'Ports 80, 443' },
      { type: 'block', action: 'Connection', target: 'All other ports' },
      { type: 'allow', action: 'Process', target: 'nginx, apache' },
      { type: 'block', action: 'Filesystem', target: 'Write to /etc/nginx, /etc/apache2' }
    ]
  },
  { 
    name: 'Block Root User', 
    icon: Lock,
    description: 'Prevent root user actions for enhanced security',
    rules: [
      { type: 'block', action: 'Process', target: 'Execution as root user' },
      { type: 'block', action: 'Filesystem', target: 'Write to /root directory' },
      { type: 'allow', action: 'Process', target: 'Execution as non-root users' }
    ]
  },
  { 
    name: 'Block Container Escape', 
    icon: ShieldCheck,
    description: 'Prevent potential container escape vulnerabilities',
    rules: [
      { type: 'block', action: 'Process', target: 'Mount operations' },
      { type: 'block', action: 'Filesystem', target: 'Access to host system directories' },
      { type: 'block', action: 'Network', target: 'Direct hardware access' }
    ]
  },
]

export function ContainerPolicyManagerComponent() {
  const [activeTab, setActiveTab] = useState('policy')
  const [selectedContainer, setSelectedContainer] = useState('')
  const [policyOption, setPolicyOption] = useState('')
  const [loggingOption, setLoggingOption] = useState('medium')
  const [createPolicyOption, setCreatePolicyOption] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [selectedArgument, setSelectedArgument] = useState('')
  const [customPolicyStep, setCustomPolicyStep] = useState(1)
  const [username, setUsername] = useState('JohnDoe')
  const [serverIP, setServerIP] = useState('113.198.229.153')
  const [isEditing, setIsEditing] = useState(false)
  const [tempUsername, setTempUsername] = useState('')
  const [tempServerIP, setTempServerIP] = useState('')
  const [isApplyingPolicy, setIsApplyingPolicy] = useState(false)
  const [containerLogOption, setContainerLogOption] = useState('all')
  const [isWhitelist, setIsWhitelist] = useState(true)
  const [selectedPredefinedPolicy, setSelectedPredefinedPolicy] = useState(null)
  const [containerList,setContainerList] = useState<containerStructure[]>([]);


  
useEffect(()=> {
  axios.get('http://113.198.229.153:4001/api/v1/container/13').then((res)=>{ console.log(res.data.containers); setContainerList(res.data.containers)}).catch((err)=>console.log(err));
},[]);
  
  const renderBackButton = (onClick) => (
    <Button 
      variant="outline" 
      className="mb-4" 
      onClick={onClick}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
  )

  const renderContainerList = () => (
   
    <>
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Select Container</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {containerList &&  containerList.map(container => (
          <Card key={container} className="cursor-pointer hover:shadow-md transition-shadow">
           <CardHeader>
             <CardTitle>{container.name}</CardTitle>
           </CardHeader>
           <CardContent>
             <Button onClick={() => setSelectedContainer(container.name)} className="bg-blue-500 hover:bg-blue-600 text-white">Select</Button>
          </CardContent>
          </Card>
        ))}
      </div>
    </>
  )

  const renderPolicyOptions = () => (
    <>
      {renderBackButton(() => setSelectedContainer(''))}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Policy Options for {selectedContainer}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setPolicyOption('check')}>
          <CardHeader>
            <CardTitle>Check Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View applied policies</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setPolicyOption('logging')}>
          <CardHeader>
            <CardTitle>Check Logging Option</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and change logging settings</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setPolicyOption('create')}>
          <CardHeader>
            <CardTitle>Create Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create new policies</p>
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderCheckPolicy = () => (
    <>
      {renderBackButton(() => setPolicyOption(''))}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Applied Policies for {selectedContainer}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            <li>Network: Block incoming connections on port 22</li>
            <li>Filesystem: Restrict write access to /etc directory</li>
            <li>Process: Prevent execution of sudo command</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )

  const renderLoggingOption = () => (
    <>
      {renderBackButton(() => setPolicyOption(''))}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Logging Options for {selectedContainer}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Logging Level: {loggingOption.charAt(0).toUpperCase() + loggingOption.slice(1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${loggingOption === 'high' ? 'bg-red-100' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">High</h3>
              <p>Logs all system calls using tracepoint and LSM, and logs critical events based on user policy.</p>
            </div>
            <div className={`p-4 rounded-md ${loggingOption === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">Medium</h3>
              <p>Logs only important system calls and policy violation logs.</p>
            </div>
            <div className={`p-4 rounded-md ${loggingOption === 'low' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">Low</h3>
              <p>Logs only policy violation logs.</p>
            </div>
          </div>
          <Button onClick={() => setLoggingOption('high')} className="mt-4 mr-2 bg-red-500 hover:bg-red-600 text-white">Set High</Button>
          <Button onClick={() => setLoggingOption('medium')} className="mt-4 mr-2 bg-yellow-500 hover:bg-yellow-600 text-white">Set Medium</Button>
          <Button onClick={() => setLoggingOption('low')} className="mt-4 bg-green-500 hover:bg-green-600 text-white">Set Low</Button>
        </CardContent>
      </Card>
    </>
  )

  const renderCreatePolicy = () => (
    <>
      {renderBackButton(() => setPolicyOption(''))}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Create Policy for {selectedContainer}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCreatePolicyOption('predefined')}>
          <CardHeader>
            <CardTitle>Apply Predefined Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Choose from a set of predefined policies</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setCreatePolicyOption('custom'); setCustomPolicyStep(1); }}>
          <CardHeader>
            <CardTitle>Create Custom Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Define a custom policy for this container</p>
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderPredefinedPolicies = () => {
    const applyPredefinedPolicy = () => {
      setIsApplyingPolicy(true)
      setTimeout(() => {
        setIsApplyingPolicy(false)
        setActiveTab('containers')
        setSelectedContainer(selectedContainer)
      }, 2000)
    }

    const generateYaml = (policy) => {
      return yaml.dump({
        container: selectedContainer,
        policy: policy.name,
        rules: policy.rules
      })
    }

    return (
      <>
        {renderBackButton(() => setCreatePolicyOption(''))}
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Predefined Policies</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predefinedPolicies.map((policy) => (
            <Card key={policy.name} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {policy.icon && <policy.icon className="mr-2 h-6 w-6" />}
                  {policy.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{policy.description}</p>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => setSelectedPredefinedPolicy(policy)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedPredefinedPolicy && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{selectedPredefinedPolicy.name} Details</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Rules:</h3>
              <ul className="list-disc list-inside mb-4">
                {selectedPredefinedPolicy.rules.map((rule, index) => (
                  <li key={index}>
                    {rule.type === 'allow' ? 'Allow' : 'Block'} {rule.action} for {rule.target}
                  </li>
                ))}
              </ul>
              <h3 className="font-semibold mb-2">Policy YAML:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">
                {generateYaml(selectedPredefinedPolicy)}
              </pre>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={applyPredefinedPolicy}
                disabled={isApplyingPolicy}
              >
                {isApplyingPolicy ? 'Applying Policy...' : 'Apply Policy'}
              </Button>
              {isApplyingPolicy && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  const renderCustomPolicy = () => {
    const applyCustomPolicy = () => {
      setIsApplyingPolicy(true)
      setTimeout(() => {
        setIsApplyingPolicy(false)
        setActiveTab('containers')
        
        setSelectedContainer(selectedContainer)
      }, 2000)
    }

    const generateYaml = () => {
      const policy = {
        container: selectedContainer,
        action: selectedAction,
        argument: selectedArgument,
        type: isWhitelist ? 'whitelist' : 'blacklist'
      }
      return yaml.dump(policy)
    }

    return (
      <>
        {renderBackButton(() => setCreatePolicyOption(''))}
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Create Custom Policy</h1>
        <Card>
          <CardHeader>
            <CardTitle>{customPolicyStep === 1 ? 'Select Action' : 'Enter Argument'}</CardTitle>
          </CardHeader>
          <CardContent>
            {customPolicyStep === 1 ? (
              <div className="space-y-4">
                {Object.entries(actionCategories).map(([category, actions]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">{category}</h3>
                    <Select onValueChange={(value) => { setSelectedAction(value); setCustomPolicyStep(2); }}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${category} action`} />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map(action => (
                          <SelectItem key={action} value={action}>{action}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Enter Argument for: {selectedAction}</h3>
                <Input
                  type="text"
                  placeholder={
                    selectedAction.includes('Network') ? "Enter IP, port, or protocol" :
                    selectedAction.includes('Filesystem') ? "Enter file path" :
                    selectedAction.includes('Process') ? "Enter process name" :
                    "Enter argument"
                  }
                  value={selectedArgument}
                  onChange={(e) => setSelectedArgument(e.target.value)}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="policy-type"
                    checked={isWhitelist}
                    onCheckedChange={setIsWhitelist}
                  />
                  <Label htmlFor="policy-type">
                    {isWhitelist ? 'Whitelist' : 'Blacklist'}
                  </Label>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Policy Summary (YAML)</h3>
                  <pre className="bg-blue-50 p-4 rounded-md overflow-x-auto">
                    {generateYaml()}
                  </pre>
                  <div className="flex justify-between">
                    <Button onClick={() => setCustomPolicyStep(1)} className="bg-gray-500 hover:bg-gray-600 text-white">Back</Button>
                    <Button onClick={applyCustomPolicy} className="bg-blue-500 hover:bg-blue-600 text-white">
                      {isApplyingPolicy ? 'Applying Policy...' : 'Apply Custom Policy'}
                    </Button>
                  </div>
                  {isApplyingPolicy && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  const renderPolicyContent = () => {
    if (!selectedContainer) return renderContainerList()
    if (!policyOption) return renderPolicyOptions()
    if (policyOption === 'check') return renderCheckPolicy()
    if (policyOption === 'logging') return renderLoggingOption()
    if (policyOption === 'create') {
      if (!createPolicyOption) return renderCreatePolicy()
      if (createPolicyOption === 'predefined') return renderPredefinedPolicies()
      if (createPolicyOption === 'custom') return renderCustomPolicy()
    }
  }

  const renderContainers = () => {
    const sampleData = [
      { name: '00:00', cpu: 40, memory: 24, network: 24 },
      { name: '03:00', cpu: 30, memory: 13, network: 22 },
      { name: '06:00', cpu: 20, memory: 98, network: 22 },
      { name: '09:00', cpu: 27, memory: 39, network: 20 },
      { name: '12:00', cpu: 18, memory: 48, network: 21 },
      { name: '15:00', cpu: 23, memory: 38, network: 25 },
      { name: '18:00', cpu: 34, memory: 43, network: 21 },
    ]

    const generateLogs = () => {
      const logTypes = ['INFO', 'DEBUG', 'WARN', 'ERROR']
      const logs = []
      for (let i = 0; i < 100; i++) {
        const date = new Date(Date.now() - i * 60000)
        const logType = logTypes[Math.floor(Math.random() * logTypes.length)]
        logs.push(`[${date.toISOString()}] ${logType}: Sample log message ${i + 1}`)
      }
      return logs.join('\n')
    }

    if (selectedContainer) {
      return (
        <>
          {renderBackButton(() => setSelectedContainer(''))}
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Container Details: {selectedContainer}</h1>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Container Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="log-option">Log Option</Label>
                  <Select value={containerLogOption} onValueChange={setContainerLogOption}>
                    <SelectTrigger id="log-option">
                      <SelectValue placeholder="Select log option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Logs</SelectItem>
                      <SelectItem value="error">Error Logs</SelectItem>
                      <SelectItem value="warn">Warning Logs</SelectItem>
                      <SelectItem value="info">Info Logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <pre className="bg-blue-50 p-4 rounded-md overflow-x-auto h-64 overflow-y-scroll text-sm">
                  {generateLogs()}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU (%)" />
                      <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory (%)" />
                      <Line type="monotone" dataKey="network" stroke="#f59e0b" name="Network (Mbps)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )
    }

    return (
      <>
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Containers</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Server Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Cpu className="h-8 w-8 mr-2 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">CPU Usage</p>
                  <p className="text-lg font-semibold">65%</p>
                </div>
              </div>
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 mr-2 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Memory Usage</p>
                  <p className="text-lg font-semibold">8.2 GB / 16 GB</p>
                </div>
              </div>
              <div className="flex items-center">
                <Database className="h-8 w-8 mr-2 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Storage Usage</p>
                  <p className="text-lg font-semibold">234 GB / 500 GB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-xl mb-4">Total Containers: {containerList.length}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containerList &&  containerList.map(container => (
            <Card key={container.name} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{container.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setSelectedContainer(container.name)} className="bg-blue-500 hover:bg-blue-600 text-white">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  const handleEditInfo = () => {
    if (isEditing) {
      setUsername(tempUsername)
      setServerIP(tempServerIP)
      setIsEditing(false)
    } else {
      setTempUsername(username)
      setTempServerIP(serverIP)
      setIsEditing(true)
    }
  }

  const renderSettings = () => (
    <>
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Settings</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-500" />
                  {isEditing ? (
                    <Input
                      id="username"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                    />
                  ) : (
                    <span>{username}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverIP">Server IP Address</Label>
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  {isEditing ? (
                    <Input
                      id="serverIP"
                      value={tempServerIP}
                      onChange={(e) => setTempServerIP(e.target.value)}
                    />
                  ) : (
                    <span>{serverIP}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleEditInfo}
        >
          {isEditing ? 'Save Changes' : 'Change Info'}
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Policy Manager</h2>
          <nav>
            <Button variant="ghost" className="w-full justify-start mb-2 text-white hover:bg-blue-700" onClick={() => {
              setActiveTab('policy')
              setSelectedContainer('')
              setPolicyOption('')
              setCreatePolicyOption('')
              setCustomPolicyStep(1)
            }}>
              <FileText className="mr-2 h-4 w-4" />
              Policy
            </Button>
            <Button variant="ghost" className="w-full justify-start mb-2 text-white hover:bg-blue-700" onClick={() => {
              setActiveTab('containers')
             setSelectedContainer('')
            }}>
              <Box className="mr-2 h-4 w-4" />
              Containers
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700" onClick={() => setActiveTab('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'policy' && renderPolicyContent()}
        {activeTab === 'containers' && renderContainers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  )
}
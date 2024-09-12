import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Card, Table, Button, Modal, Form, Select, notification, Input, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserOutlined, LogoutOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text } = Typography;
const { Option } = Select;
const { Header, Content, Sider } = Layout;

interface User {
  _id: string;
  email: string;
  role: 'Superadmin' | 'Admin' | 'Superuser' | 'User';
  createdAt: string;
  avatar?: string;
}

interface CurrentUser {
  role: string;
  email: string;
}

interface UserProfile extends User {
  key: string; // Add `key` to match the `usersWithKey` type
}

const roleOptions = ['Admin', 'Superuser', 'User'];

const Dashboard: React.FC = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [newUserPassword, setNewUserPassword] = useState<string | null>(null);

  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get<CurrentUser>('https://refine-role-base-project.onrender.com/api/me', { headers: getAuthHeader() });
      setCurrentUser(response.data);
    } catch (error: any) {
      notification.error({ message: 'Failed to fetch user data', description: error.message });
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const endpoint = currentUser?.role === 'Admin' ? 'my-users' : 'users';
      const response = await axios.get<{ data: UserProfile[] }>(`https://refine-role-base-project.onrender.com/api/${endpoint}`, { headers: getAuthHeader() });
      console.log('Fetched Users Data:', response.data); // Log response data for debugging
      const filteredUsers = response.data.data.filter(user => currentUser?.email !== user.email);
      setAllUsers(filteredUsers);
    } catch (error: any) {
      notification.error({ message: 'Failed to fetch users', description: error.message });
      console.error('Failed to fetch users:', error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      fetchUsers();
    };
    fetchData();
  }, [currentUser?.role]);

  const usersWithKey = allUsers.map((user, i) => ({
    key: user._id,
    index: i + 1,
    email: user.email,
    role: user.role,
    createdAt: new Date(user.createdAt).toLocaleString(),
    avatar: user.avatar || 'https://www.gravatar.com/avatar/default',
  }));

  const handleEdit = (record: UserProfile) => {
    setEditingUser(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleSave = async (values: { role: string }) => {
    if (editingUser) {
      const endpoint = editingUser.role === 'Admin' 
        ? `https://refine-role-base-project.onrender.com/api/my-users/${editingUser.key}` 
        : `https://refine-role-base-project.onrender.com/api/users/${editingUser.key}`;
  
      try {
        await axios.put(endpoint, { role: values.role }, { headers: getAuthHeader() });
        notification.success({ message: 'User role updated successfully' });
        setEditingUser(null);
        setIsModalVisible(false);
        fetchUsers();
      } catch (error: any) {
        notification.error({ message: 'Failed to update user role', description: error.message });
        console.error('Failed to update user role:', error);
      }
    }
  };

  const handleDelete = async (record: UserProfile) => {
    try {
      await axios.delete(`https://refine-role-base-project.onrender.com/api/users/${record.key}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      notification.success({ message: 'User deleted successfully' });
      fetchUsers();
    } catch (error: any) {
      notification.error({ message: 'Failed to delete user', description: error.message });
      console.error('Failed to delete user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateUser = async (values: { email: string; role: string }) => {
    try {
      const password = uuidv4();
      const createData = {
        email: values.email,
        role: values.role,
        createdBy: currentUser?.role === 'Admin' ? currentUser?.email : undefined,
        password: password,
      };

      await axios.post('https://refine-role-base-project.onrender.com/api/create-user', createData, { headers: getAuthHeader() });
      setNewUserPassword(password);

      notification.success({ message: 'User created successfully' });
      setIsCreateUserModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      notification.error({ message: 'Failed to create user', description: error.message });
      console.error('Failed to create user:', error);
    }
  };

  const handleProfileCancel = () => {
    setIsProfileModalVisible(false);
    setSelectedProfile(null);
  };

  const renderRoleMessage = (role: string) => {
    const roleMessages: Record<string, JSX.Element> = {
      'Superadmin': <Text>Welcome, <b style={{ color: "darkblue" }}>Superadmin</b>! You have unrestricted access to manage all aspects of the system.</Text>,
      'Admin': <Text>Welcome, Admin! You have access to manage users and view data within your scope.</Text>,
      'Superuser': <Text>Welcome, Superuser! You can manage specific data and perform certain administrative tasks.</Text>,
      'User': <Text>Welcome, User! You have basic access to view and manage your personal data.</Text>,
    };
    return roleMessages[role] || <Text>Welcome! Here you can view and manage your data.</Text>;
  };

  const columns = [
    { title: 'No.', dataIndex: 'index', key: 'index' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: UserProfile) => (
        <>
          <Button icon={<EyeOutlined />} type="link" onClick={() => { setSelectedProfile(record); setIsProfileModalVisible(true); }} style={{ marginRight: 8 }}>
            View
          </Button>
          {(currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') && (
            <>
              <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
                Edit
              </Button>
              {currentUser?.role === 'Superadmin' && (
                <Button icon={<DeleteOutlined />} type="default" danger onClick={() => handleDelete(record)}>
                  Delete
                </Button>
              )}
            </>
          )}
        </>
      ),
    },
  ];
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={256} className="site-layout-background" breakpoint="lg" style={{ backgroundColor: "#fff" }} collapsedWidth="0">
        <Menu mode="inline" defaultSelectedKeys={['1']} items={[
          { key: '1', icon: <UserOutlined />, label: 'Dashboard', onClick: () => navigate('/dashboard') },
          (currentUser?.role === 'Admin' || currentUser?.role === 'Superadmin') && { key: '2', icon: <PlusOutlined />, label: 'Create User', onClick: () => setIsCreateUserModalVisible(true) },
          { key: '3', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
        ].filter(Boolean)} />
      </Sider>
      <Layout style={{ padding: '0 24px', minHeight: 280 }}>
        <Header className="site-layout-background" style={{ padding: 0, backgroundColor: "#fff" }}>
          <Title level={2}>Dashboard</Title>
        </Header>
        <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
          {currentUser && renderRoleMessage(currentUser.role)}
          <Table columns={columns} dataSource={usersWithKey} />
        </Content>
      </Layout>

      <Modal title="Edit User" visible={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form layout="vertical" onFinish={handleSave} initialValues={editingUser ? { role: editingUser.role } : {}}>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role' }]}>
            <Select>
              {roleOptions.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Create User" visible={isCreateUserModalVisible} onCancel={() => setIsCreateUserModalVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={handleCreateUser}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter an email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role' }]}>
            <Select>
              {roleOptions.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
            <Button onClick={() => setIsCreateUserModalVisible(false)} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
          {newUserPassword && <Text type="success">New user password: {newUserPassword}</Text>}
        </Form>
      </Modal>

      <Modal title="User Profile" visible={isProfileModalVisible} onCancel={handleProfileCancel} footer={null}>
        {selectedProfile && (
          <Card
            title={<Title level={4}>{selectedProfile.email}</Title>}
            extra={<Avatar src={selectedProfile.avatar} />}
            style={{ width: '100%' }}
          >
            <Text>Role: {selectedProfile.role}</Text><br />
            <Text>Created At: {new Date(selectedProfile.createdAt).toLocaleString()}</Text>
          </Card>
        )}
      </Modal>
    </Layout>
  );
};

export default Dashboard;

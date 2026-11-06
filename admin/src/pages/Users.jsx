import { useEffect, useState } from 'react';
import api from '../api/client';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users || []);
    };

    loadUsers().catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <h2>User Management</h2>
        <span>{users.length} users</span>
      </div>
      <div className="admin-table admin-table--users">
        <div className="admin-table__row admin-table__head">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
        </div>
        {users.map((user) => (
          <div className="admin-table__row" key={user._id}>
            <span>{user.name}</span>
            <span>{user.email}</span>
            <span>{user.isAdmin ? 'Admin' : 'Customer'}</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Users;

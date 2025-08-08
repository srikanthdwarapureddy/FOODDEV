import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const updateData = {
                name: formData.name,
                email: formData.email
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const result = await updateProfile(updateData);

            if (result.success) {
                setMessage('Profile updated successfully!');
                setIsEditing(false);
                setFormData({
                    ...formData,
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setMessage(result.error || 'Failed to update profile');
            }
        } catch (error) {
            setMessage('An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>User Profile</h2>
                
                {message && (
                    <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    {isEditing && (
                        <>
                            <div className="form-group">
                                <label>New Password (leave blank to keep current):</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </>
                    )}

                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button type="submit" disabled={loading} className="save-btn">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user?.name || '',
                                            email: user?.email || '',
                                            password: '',
                                            confirmPassword: ''
                                        });
                                        setMessage('');
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(true)}
                                className="edit-btn"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>

                <div className="profile-info">
                    <p><strong>User ID:</strong> {user?._id}</p>
                    <p><strong>Account Type:</strong> {user?.isAdmin ? 'Admin' : 'User'}</p>
                </div>

                <button onClick={logout} className="logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile; 
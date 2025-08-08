import React, { useContext, useState } from 'react'
import './PlaceOder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets'
import PaymentForm from '../../components/PaymentForm/PaymentForm'

const PlaceOrder = () => {
  const { getTotalCartAmount, food_list, cartItems, clearCart } = useContext(StoreContext);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 2;
  const tax = getTotalCartAmount() * 0.08;
  const finalTotal = getTotalCartAmount() + deliveryFee + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- ADDED: Submit order to backend ---
  const submitOrderToBackend = async (order) => {
    try {
      console.log('Submitting order to backend:', order);
      
      // Check if backend is reachable
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/orders/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return { 
          success: false, 
          message: `Server error: ${response.status} - ${errorText}` 
        };
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      return data;
    } catch (err) {
      console.error('Order submission error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please check if backend is running.' 
        };
      }
      return { 
        success: false, 
        message: `Network error: ${err.message}` 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    
    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipCode', 'phone'];
    const isValid = requiredFields.every(field => formData[field].trim() !== '');
    
    if (!isValid) {
      alert('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (getTotalCartAmount() === 0) {
      alert('Your cart is empty');
      setIsSubmitting(false);
      return;
    }

    // Prepare order data for backend
    const items = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find(product => product._id === itemId);
        if (itemInfo) {
          items.push({
            name: itemInfo.name,
            quantity: cartItems[itemId],
            price: itemInfo.price
          });
        }
      }
    }
    const orderData = {
      customerName: formData.firstName + ' ' + formData.lastName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
      items,
      subtotal: getTotalCartAmount(),
      deliveryFee: deliveryFee,
      tax: tax,
      total: finalTotal,
      paymentMethod: paymentMethod,
      status: 'Pending'
    };

    // If payment method is card, show payment form
    if (paymentMethod === 'card') {
      setCurrentOrder(orderData);
      setShowPaymentForm(true);
      setIsSubmitting(false);
      return;
    }

    // For cash on delivery or digital wallet, proceed with order
    const response = await submitOrderToBackend(orderData);
    
    if (response.success) {
      setOrderNumber(response.orderNumber);
      setOrderPlaced(true);
      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
      }, 2000);
    } else {
      alert(response.message || 'Failed to place order. Please try again.');
      setOrderPlaced(false);
    }
    
    setIsSubmitting(false);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Update order with payment information
      const orderWithPayment = {
        ...currentOrder,
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id
      };

      const response = await submitOrderToBackend(orderWithPayment);
      
      if (response.success) {
        setOrderNumber(response.orderNumber);
        setOrderPlaced(true);
        setShowPaymentForm(false);
        setCurrentOrder(null);
        // Clear cart after successful order
        setTimeout(() => {
          clearCart();
        }, 2000);
      } else {
        alert(response.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Payment success handling error:', error);
      alert('Payment successful but order placement failed. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
    setShowPaymentForm(false);
    setCurrentOrder(null);
  };

  // Get cart items for display
  const getCartItems = () => {
    const items = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find(product => product._id === itemId);
        if (itemInfo) {
          items.push({
            ...itemInfo,
            quantity: cartItems[itemId]
          });
        }
      }
    }
    return items;
  };

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="order-success-container">
          <div className="success-icon">
            <img src={assets.parcel_icon} alt="Success" />
          </div>
          <h1>Order Placed Successfully!</h1>
          <div className="order-details">
            <p><strong>Order Number:</strong> {orderNumber}</p>
            <p><strong>Total Amount:</strong> ${finalTotal.toFixed(2)}</p>
            <p><strong>Estimated Delivery:</strong> 25-35 minutes</p>
          </div>
          <div className="success-message">
            <p>Thank you for your order! We're preparing your delicious meal.</p>
            <p>You'll receive a confirmation email shortly.</p>
          </div>
          <button 
            className="continue-shopping-btn"
            onClick={() => window.location.href = '/'}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (showPaymentForm && currentOrder) {
    return (
      <div className="payment-page">
        <div className="payment-page-container">
          <div className="payment-header">
            <h1>Secure Payment</h1>
            <p>Complete your payment to place your order</p>
          </div>
          
          <div className="payment-content">
            <div className="order-summary-payment">
              <h3>Order Summary</h3>
              <div className="payment-order-items">
                {getCartItems().map((item, index) => (
                  <div key={index} className="payment-order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="payment-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${getTotalCartAmount().toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row total-final">
                  <span><strong>Total</strong></span>
                  <span><strong>${finalTotal.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
            
            <div className="payment-form-container">
              <PaymentForm
                amount={finalTotal}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isProcessing={isSubmitting}
                setIsProcessing={setIsSubmitting}
              />
            </div>
          </div>
          
          <button 
            className="back-to-order-btn"
            onClick={() => {
              setShowPaymentForm(false);
              setCurrentOrder(null);
            }}
          >
            ← Back to Order Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-order">
      <div className="place-order-container">
        <div className="place-order-header">
          <h1>Complete Your Order</h1>
          <p>Fill in your delivery details to place your order</p>
        </div>

        <form onSubmit={handleSubmit} className="place-order-form">
          <div className="form-sections">
            {/* Delivery Information */}
            <div className="form-section">
              <h2>Delivery Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="street"
                  placeholder="Street address"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="card"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="card">
                    <span className="payment-icon">💳</span>
                    Credit/Debit Card
                  </label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="cash"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="cash">
                    <span className="payment-icon">💵</span>
                    Cash on Delivery
                  </label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="digital"
                    name="payment"
                    value="digital"
                    checked={paymentMethod === 'digital'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="digital">
                    <span className="payment-icon">📱</span>
                    Digital Wallet
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {getCartItems().map((item, index) => (
                <div key={index} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${getTotalCartAmount().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="total-row total-final">
                <span><strong>Total</strong></span>
                <span><strong>${finalTotal.toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="delivery-info">
              <div className="delivery-time">
                <span className="delivery-icon">🚚</span>
                <div>
                  <strong>Estimated Delivery</strong>
                  <p>25-35 minutes</p>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="place-order-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : `Place Order - $${finalTotal.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;
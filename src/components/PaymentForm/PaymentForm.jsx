import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

const PaymentFormContent = ({ amount, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setError('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError('Failed to initialize payment');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      onPaymentError && onPaymentError(stripeError.message);
    } else if (paymentIntent.status === 'succeeded') {
      setProcessing(false);
      onPaymentSuccess && onPaymentSuccess(paymentIntent);
    } else {
      setError('Payment failed. Please try again.');
      setProcessing(false);
      onPaymentError && onPaymentError('Payment failed');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <h3>Payment Amount</h3>
        <div className="amount-display">${amount.toFixed(2)}</div>
      </div>

      <div className="card-element-container">
        <label htmlFor="card-element">Credit or debit card</label>
        <div className="card-element-wrapper">
          <CardElement
            id="card-element"
            options={cardElementOptions}
            className="card-element"
          />
        </div>
      </div>

      {error && (
        <div className="payment-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || isProcessing}
        className="payment-button"
      >
        {processing || isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      <div className="payment-security">
        <div className="security-badges">
          <span className="security-badge">🔒 Secure</span>
          <span className="security-badge">💳 Stripe</span>
          <span className="security-badge">🛡️ Protected</span>
        </div>
        <p className="security-text">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>
    </form>
  );
};

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  );
};

export default PaymentForm; 
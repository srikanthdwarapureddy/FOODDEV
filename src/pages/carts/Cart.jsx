import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  // Calculate totals
  const getCartItemCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalCount += cartItems[item];
      }
    }
    return totalCount;
  };

  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 2;

  const handleCheckout = () => {
    if (getTotalCartAmount() === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/order');
  };

  return (
    <div className='cart'>
      <div className="cart-container">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <p className="cart-subtitle">Review your delicious selections</p>
        </div>

        <div className="cart-items">
          <div className="cart-items-title">
            <p>Items</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
          </div>
          <br />
          <hr />
          
          {food_list.map((item, index) => {
            if (cartItems[item._id] > 0) {
              return (
                <div key={index}>
                  <div className="cart-items-title cart-items-item">
                    <img src={item.image} alt="" />
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <div className="cart-quantity-controls">
                      <img 
                        onClick={() => removeFromCart(item._id)} 
                        src={assets.remove_icon_red} 
                        alt="Remove" 
                        className="quantity-btn"
                      />
                      <p className="quantity-display">{cartItems[item._id]}</p>
                      <img 
                        onClick={() => addToCart(item._id)} 
                        src={assets.add_icon_green} 
                        alt="Add" 
                        className="quantity-btn"
                      />
                    </div>
                    <p>${item.price * cartItems[item._id]}</p>
                    <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                  </div>
                  <hr />
                </div>
              )
            }
          })}
        </div>

        {getTotalCartAmount() === 0 ? (
          <div className="empty-cart">
            <img src={assets.basket_icon} alt="Empty Cart" className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some delicious food items to get started!</p>
          </div>
        ) : (
          <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Totals</h2>
              <div>
                <div className="cart-total-details">
                  <p>Subtotal</p>
                  <p>${getTotalCartAmount()}</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <p>Delivery Fee</p>
                  <p>${deliveryFee}</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>${getTotalCartAmount() + deliveryFee}</b>
                </div>
              </div>
              <button onClick={handleCheckout} className="checkout-btn">
                PROCEED TO CHECKOUT
              </button>
            </div>

            <div className="cart-promocode">
              <div>
                <p>If you have a promo code, Enter it here</p>
                <div className="cart-promocode-input">
                  <input type="text" placeholder='Promo code' />
                  <button>Submit</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
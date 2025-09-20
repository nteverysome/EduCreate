import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

/**
 * Subscription Plan Card Component
 * Displays a subscription plan with its details and a subscribe button
 */
const PlanCard = ({ plan, onSelectPlan, isSelected }) => {
  return (
    <div 
      className={`border rounded-lg p-6 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
      onClick={() => onSelectPlan(plan)}
    >
      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
      <div className="text-3xl font-bold mb-4">
        ${plan.price}<span className="text-sm font-normal text-gray-500">/month</span>
      </div>
      <ul className="mb-6 space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        className={`w-full py-2 px-4 rounded-md transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
};

/**
 * Payment Form Component
 * Handles the Stripe payment form and subscription creation
 */
const PaymentForm = ({ selectedPlan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !session) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: session.user.email,
          name: session.user.name
        }
      });
      
      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }
      
      // Create subscription on the server
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId: selectedPlan.id,
          customerId: session.user.stripeCustomerId // Assuming this is stored in the session
        })
      });
      
      const subscription = await response.json();
      
      if (!response.ok) {
        throw new Error(subscription.error || 'Failed to create subscription');
      }
      
      // Handle subscription status
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        onSuccess(subscription);
      } else if (subscription.status === 'incomplete') {
        // Handle additional authentication if required
        const { error: confirmationError } = await stripe.confirmCardPayment(subscription.clientSecret);
        
        if (confirmationError) {
          throw new Error(confirmationError.message);
        } else {
          onSuccess(subscription);
        }
      }
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Payment Information</h3>
        <div className="p-3 border border-gray-300 rounded-md bg-white">
          <CardElement 
            options={{
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
            }}
          />
        </div>
      </div>
      
      {paymentError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {paymentError}
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : `Subscribe for $${selectedPlan.price}/month`}
        </button>
      </div>
    </form>
  );
};

/**
 * Subscription Success Component
 * Displayed after successful subscription
 */
const SubscriptionSuccess = ({ subscription, onDone }) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Successful!</h3>
      <p className="text-gray-600 mb-6">
        Thank you for subscribing to our {subscription.plan.name} plan. Your subscription is now active.
      </p>
      <button
        onClick={onDone}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

/**
 * Main Stripe Subscription Component
 * Manages the subscription flow from plan selection to payment
 */
const StripeSubscription = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('select-plan'); // 'select-plan', 'payment', 'success'
  const [subscription, setSubscription] = useState(null);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [plans, setPlans] = useState([]);
  
  useEffect(() => {
    // Fetch available subscription plans
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/payments/plans');
        const data = await response.json();
        
        if (response.ok) {
          setPlans(data.plans);
        }
      } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
      }
    };
    
    fetchPlans();
  }, []);
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };
  
  const handleProceedToPayment = () => {
    if (selectedPlan) {
      setStep('payment');
    }
  };
  
  const handlePaymentSuccess = (newSubscription) => {
    setSubscription(newSubscription);
    setStep('success');
  };
  
  const handleCancel = () => {
    setStep('select-plan');
  };
  
  const handleDone = () => {
    // Redirect to dashboard or reload user session
    window.location.href = '/dashboard';
  };
  
  if (!session) {
    return (
      <div className="text-center py-8">
        <p>Please sign in to subscribe to a plan.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {step === 'select-plan' && (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Choose a Subscription Plan</h2>
            <p className="text-gray-600">Select the plan that best fits your needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelectPlan={handleSelectPlan}
                isSelected={selectedPlan?.id === plan.id}
              />
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={handleProceedToPayment}
              disabled={!selectedPlan}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        </>
      )}
      
      {step === 'payment' && selectedPlan && (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Complete Your Subscription</h2>
            <p className="text-gray-600">You&apos;re subscribing to the {selectedPlan.name} plan</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <Elements stripe={stripePromise}>
              <PaymentForm 
                selectedPlan={selectedPlan} 
                onSuccess={handlePaymentSuccess} 
                onCancel={handleCancel} 
              />
            </Elements>
          </div>
        </>
      )}
      
      {step === 'success' && subscription && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <SubscriptionSuccess 
            subscription={subscription} 
            onDone={handleDone} 
          />
        </div>
      )}
    </div>
  );
};

export default StripeSubscription;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      subtitle: 'PERSONAL USE',
      price: '0DA',
      priceSub: null,
      priceBelow: '/MO',
      features: [
        'Basic shipping features',
        'Low-priority delivery',
        '3 active shipment posts'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'current',
      recommended: false,
      isBusiness: false
    },
    {
      name: 'Individual',
      subtitle: 'REGULAR SHIPPERS',
      price: '3000DA',
      priceSub: null,
      priceBelow: '/MO',
      features: [
        'Real-time tracking',
        'Priority support 24/7',
        'Unlimited shipment posts',
        'Advanced route analytics'
      ],
      buttonText: 'Select Plan',
      buttonVariant: 'select',
      recommended: true,
      isBusiness: false
    },
    {
      name: 'Business',
      subtitle: 'LOGISTICS MODELS',
      price: '10000DA',
      priceSub: null,
      priceBelow: '/MO',
      features: [
        'Fleet management suite',
        'Bulk shipment tools',
        'Enterprise API access',
        'Dedicated account manager'
      ],
      buttonText: 'Upgrade to Business',
      buttonVariant: 'upgrade',
      recommended: false,
      isBusiness: true
    }
  ];

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="subscription-screen">
      <div className="subscription-container">
        <div className="subscription-header">
          <button className="subscription-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 className="subscription-header-title">Subscription Plans</h1>
          <ThemeToggle />
        </div>

        <div className="subscription-body">
          <div className="subscription-title-section">
            <p className="subscription-main-subtitle">
              Choose your<br />momentum
            </p>
            <p className="subscription-description">
              Scale your logistics with precision vitality and industrial speed.
            </p>
          </div>

          <div className="plans-list">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`plan-card ${plan.recommended ? 'plan-card-recommended' : ''} ${plan.isBusiness ? 'plan-card-business' : ''}`}
              >
                {plan.recommended && (
                  <div className="plan-recommended-badge">RECOMMENDED</div>
                )}
                
                <div className="plan-price-corner">
                  <div className="plan-price-corner-wrapper">
                    <span className="plan-price-corner-main">{plan.price}</span>
                    {plan.priceBelow && (
                      <span className="plan-price-corner-below">{plan.priceBelow}</span>
                    )}
                  </div>
                </div>
                
                <div className="plan-card-content">
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-subtitle">{plan.subtitle}</p>
                  
                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="plan-feature-item">
                        <span className="plan-feature-check">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={`plan-action-btn ${plan.buttonVariant === 'current' ? 'plan-btn-current' : plan.buttonVariant === 'select' ? 'plan-btn-select' : 'plan-btn-upgrade'}`}
                    disabled={plan.buttonVariant === 'current'}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
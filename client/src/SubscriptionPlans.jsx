import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from './ConfirmDialog';
import { createSubscription, deleteSubscription, getMySubscription, updateSubscription } from './services/subscriptionService';
import './SubscriptionPlans.css';

const SubscriptionPlans = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [mySub, setMySub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingTier, setActionLoadingTier] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const plans = useMemo(() => [
    {
      name: 'Free',
      tier: 'Free',
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
      tier: 'Individual',
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
      tier: 'Business',
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
  ], []);

  const loadMySubscription = async () => {
    setLoading(true);
    setError('');

    try {
      const sub = await getMySubscription();
      setMySub(sub || null);
    } catch (err) {
      setError(err?.message || 'Failed to load your subscription.');
      setMySub(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMySubscription();
  }, []);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('dashboard');
      return;
    }

    navigate('/dashboard');
  };

  const handleSelectOrUpdate = async (plan) => {
    setError('');
    setActionLoadingTier(plan.tier);

    try {
      if (!mySub) {
        const created = await createSubscription({ tier: plan.tier, isActive: true });
        setMySub(created);
      } else {
        const updated = await updateSubscription(mySub.sub_ID, {
          tier: plan.tier,
          isActive: true,
          endDate: mySub.endDate || null,
        });
        setMySub(updated);
      }
    } catch (err) {
      setError(err?.message || 'Failed to update subscription.');
    } finally {
      setActionLoadingTier('');
    }
  };

  const handleDelete = async () => {
    if (!mySub?.sub_ID) return;

    setDeleteLoading(true);
    setError('');

    try {
      await deleteSubscription(mySub.sub_ID);
      setMySub(null);
    } catch (err) {
      setError(err?.message || 'Failed to delete subscription.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDetails = () => {
    if (!mySub?.sub_ID) return;
    onNavigate?.('subscriptionDetails', { subscriptionId: mySub.sub_ID, from: 'subscription' });
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
          {error ? <p className="subscription-error-banner">{error}</p> : null}

          <div className="subscription-title-section">
            <p className="subscription-main-subtitle">
              Choose your<br />momentum
            </p>
            <p className="subscription-description">
              Scale your logistics with precision vitality and industrial speed.
            </p>
            <p className="subscription-description" style={{ marginTop: 6 }}>
              {loading
                ? 'Loading your current subscription...'
                : mySub
                ? `Current tier: ${mySub.tier} (ID #${mySub.sub_ID})`
                : 'You have no active subscription yet.'}
            </p>

            {mySub && (
              <div className="subscription-top-actions">
                <button className="plan-action-btn plan-btn-select" onClick={openDetails} type="button">
                  View Details
                </button>
                <button
                  className="plan-action-btn plan-btn-upgrade"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={deleteLoading}
                  type="button"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Subscription'}
                </button>
              </div>
            )}
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
                    disabled={loading || actionLoadingTier === plan.tier || mySub?.tier === plan.tier}
                    onClick={() => handleSelectOrUpdate(plan)}
                    type="button"
                  >
                    {actionLoadingTier === plan.tier
                      ? 'Processing...'
                      : mySub?.tier === plan.tier
                      ? 'Current Plan'
                      : mySub
                      ? `Update to ${plan.tier}`
                      : `Select ${plan.tier}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Subscription"
        message="Do you want to delete your current subscription?"
        confirmLabel="Yes"
        cancelLabel="No"
        loading={deleteLoading}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          setConfirmDeleteOpen(false);
        }}
      />
    </div>
  );
};

export default SubscriptionPlans;
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../lib/api/billing';
import { PlanInterval } from '../types';

export default function BillingPage() {
  const queryClient = useQueryClient();

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: billingApi.getPlans,
  });

  const { data: subscription, isLoading: isLoadingSub } = useQuery({
    queryKey: ['subscription'],
    queryFn: billingApi.getMySubscription,
    retry: false,
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: number) => billingApi.createCheckoutSession({ plan_id: planId }),
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      alert('Failed to start subscription: ' + error);
    }
  });

  const handleSubscribe = (planId: number) => {
    subscribeMutation.mutate(planId);
  };

  if (isLoadingPlans || isLoadingSub) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-gray-500 sm:text-center">
          Choose the plan that fits your investment goals.
        </p>
      </div>
      
      {subscription && (
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Current Plan: <span className="font-bold">{subscription.plan.name}</span> ({subscription.status})
                </p>
              </div>
            </div>
          </div>
      )}

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {plans?.map((plan) => (
          <div key={plan.id} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                <span className="text-base font-medium text-gray-500">/{plan.interval === PlanInterval.YEARLY ? 'yr' : 'mo'}</span>
              </p>
              <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscription?.plan_id === plan.id}
                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    subscription?.plan_id === plan.id
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {subscription?.plan_id === plan.id ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
              <ul className="mt-6 space-y-4">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// 수강권 확인 유틸리티
// localStorage 기반 구독 정보 조회

export interface Subscription {
  id: string;
  email: string;
  plan: 'Digital TOEFL' | 'High School Success' | 'Free';
  startDate: string;
  expiryDate: string;
  paymentMethod: 'PayPal' | 'QR Code' | 'Credit Card' | 'Bank Transfer' | 'None';
  status: 'Active' | 'Expired' | 'Cancelled';
  amount: number;
}

// Check if user has an active subscription
export function hasActiveSubscription(): boolean {
  const subscriptions: Subscription[] = JSON.parse(localStorage.getItem('toefl_subscriptions') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('toefl_current_user') || '{}');

  if (!currentUser.email) {
    return false;
  }

  const userSubscription = subscriptions.find((sub) =>
    sub.email === currentUser.email && sub.status === 'Active'
  );

  if (!userSubscription) {
    return false;
  }

  // Check if subscription is still valid
  const expiryDate = new Date(userSubscription.expiryDate);
  const today = new Date();

  return expiryDate >= today;
}

// Get subscription expiry date for the current user
export function getSubscriptionExpiryDate(): Date | null {
  const subscriptions: Subscription[] = JSON.parse(localStorage.getItem('toefl_subscriptions') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('toefl_current_user') || '{}');

  if (!currentUser.email) return null;

  const userSubscription = subscriptions.find((sub) =>
    sub.email === currentUser.email && sub.status === 'Active'
  );

  if (!userSubscription) return null;

  return new Date(userSubscription.expiryDate);
}

// Set current user (call after login)
export function setCurrentUser(email: string) {
  localStorage.setItem('toefl_current_user', JSON.stringify({ email }));
}

// Clear current user (call after logout)
export function clearCurrentUser() {
  localStorage.removeItem('toefl_current_user');
}

// Cache subscriptions to localStorage
export function cacheSubscriptions(subscriptions: Subscription[]) {
  localStorage.setItem('toefl_subscriptions', JSON.stringify(subscriptions));
}

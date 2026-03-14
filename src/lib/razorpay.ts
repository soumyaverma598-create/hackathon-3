export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }

    // Create and load Razorpay script
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
}

import * as functions from 'firebase-functions';
import * as express from 'express';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Define the type for RevenueCat event data
interface RevenueCatEvent {
  event: string;
  product_id: string;
  // Add more fields based on the RevenueCat webhook payload structure
}

// Webhook route to handle RevenueCat events
app.post('/revenuecat-webhook', (req, res) => {
  const event: RevenueCatEvent = req.body;

  // Log the event for debugging
  console.log('Received RevenueCat event:', event);

  // Handle different event types from RevenueCat
  switch (event.event) {
    case 'INITIAL_PURCHASE':
      console.log('Initial purchase for product:', event.product_id);
      // Add logic to handle initial purchase (e.g., grant premium access)
      break;
    case 'RENEWAL':
      console.log('Subscription renewed for product:', event.product_id);
      // Add logic to handle subscription renewal
      break;
    case 'CANCELLATION':
      console.log('Subscription canceled for product:', event.product_id);
      // Add logic to handle subscription cancellation (e.g., revoke access)
      break;
    default:
      console.log('Unhandled event:', event.event);
  }

  // Respond with a 200 status to acknowledge the event
  res.status(200).send('Event received');
});

// Export the function to Firebase
exports.api = functions.https.onRequest(app);

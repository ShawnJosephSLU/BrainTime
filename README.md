# BrainTime - Online Assessment Platform

BrainTime is an online platform designed for educators, trainers, and quiz enthusiasts to create secure, timed assessments. The platform provides tiered subscription plans that encompass features such as student management, analytics, and seamless integration with Stripe for facilitating payments.

## Project Overview

BrainTime.org aspires to position itself as the leading exam creation platform, emphasizing security, adaptability, and an intuitive user interface. By harnessing the MERN stack and integrating with Stripe, it offers scalable solutions that cater to diverse educational requirements.

### Tech Stack

- **MongoDB**: Database for storing user data, quizzes, and responses
- **Express.js**: Backend API framework
- **React**: Frontend UI library with TypeScript
- **Node.js**: JavaScript runtime for the backend
- **TypeScript**: Used throughout the project for type safety
- **Stripe**: Payment processing for subscription plans

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Stripe account for payment processing
- SMTP server for email verification

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/braintime.git
   cd braintime
   ```

2. Install backend dependencies:
   ```
   cd Backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../Frontend
   npm install
   ```

4. Set up environment variables:
   - Copy the `.env.example` file to `.env` in the root directory
   - Update the environment variables with your own values

### Setting Up Stripe Integration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard and update the `.env` file:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

3. Run the script to automatically create the subscription products and prices in Stripe:
   ```
   cd Backend
   npm run setup:stripe
   ```
   This script will:
   - Create the Basic, Pro, and Enterprise products in your Stripe account
   - Create monthly and annual price plans for each product
   - Automatically update your `.env` file with the product and price IDs

4. Verify the Stripe setup:
   ```
   npm run test:stripe
   ```
   This will test the connection to Stripe and verify that the products and prices were created correctly.

5. Set up Stripe webhooks:
   - Go to the Stripe dashboard > Developers > Webhooks
   - Add an endpoint with the URL: `https://your-domain.com/webhooks/stripe`
   - Select the following events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Get the webhook signing secret and add it to your `.env` file

### Setting Up Email Verification

1. Configure your SMTP server details in the `.env` file:
   ```
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=465
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_email_password
   ```

2. Test the email service:
   ```
   cd Backend
   npx ts-node src/scripts/testEmailService.ts your-test-email@example.com
   ```
   This will verify the connection to your SMTP server and send a test email.

3. The system will automatically send verification emails when users register. You can test the full verification flow with:
   ```
   npx ts-node src/scripts/testEmailVerification.ts
   ```
   This interactive script will guide you through the registration, verification, and login process.

### Running the Application

1. Start the backend server:
   ```
   cd Backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd Frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## Subscription Plans

BrainTime offers three subscription tiers:

1. **Basic Plan ($5.99/month)**
   - 5 live exams
   - 50 students
   - Basic analytics

2. **Pro Plan ($12.99/month)**
   - 50 live exams
   - 150 students
   - Advanced analytics
   - Priority support

3. **Enterprise Plan ($24.99/month)**
   - Unlimited exams
   - 10 students
   - Premium analytics
   - 24/7 support
   - Custom branding

All plans include a 30-day free trial and offer a 20% discount for annual billing.

## Project Structure

### Backend

```
Backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # MongoDB schema models
├── routes/           # API routes
├── services/         # Business logic
│   ├── email/        # Email verification service
│   └── stripe/       # Stripe integration
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── .env              # Environment variables
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
├── src/              # TypeScript source files
└── server.ts         # Entry point
```

### Frontend

```
Frontend/
├── public/           # Static files
├── src/
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Reusable UI components
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API service calls
│   ├── types/        # TypeScript interfaces
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Main App component
│   └── main.tsx      # Entry point
├── index.html        # HTML entry point
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Stripe Documentation](https://stripe.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)

<<<<<<< HEAD
# zuckai
=======
# Zuck AI - Facebook Ad Strategist Assistant

An Ivy League-level AI assistant for Facebook Ads that analyzes your ad creative and provides intelligent GPT-powered recommendations. Zuck AI learns from real campaign results to continuously improve its suggestions.

## 🚀 Features

- **AI-Powered Analysis**: Get detailed analysis of your Facebook ad creative, targeting, and strategy using GPT-4o
- **Smart Recommendations**: Receive 2-5 new campaign ideas tailored to your specific goals
- **Continuous Learning**: Zuck learns from real campaign results to provide better recommendations over time
- **Industry Insights**: Access anonymized data from successful campaigns across similar industries
- **User Authentication**: Secure user accounts with Supabase Auth
- **Subscription Plans**: Three-tier pricing (Starter $20, Builder $50, Pro $100/month)
- **Real-time Analysis**: Get instant feedback and recommendations
- **Campaign Tracking**: Track performance and get follow-up optimization suggestions

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4o
- **Payments**: Stripe
- **Vector DB**: pgvector (for semantic search)
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd zucky.ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Enable the pgvector extension for embeddings

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **ads**: Ad creative and basic information
- **facebook_ads**: Facebook-specific campaign settings
- **ai_analyses**: GPT analysis results and prompts
- **ad_results**: Real campaign performance data
- **subscriptions**: Stripe subscription management
- **plans**: Available subscription plans

## 🔧 API Routes

- `POST /api/analyze` - Run AI analysis on uploaded ads
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/user` - Get current user data

## 🎯 User Flow

1. **Sign Up/Login**: Users create accounts or sign in
2. **Upload Ad**: Users input their Facebook ad details (headline, text, targeting, etc.)
3. **AI Analysis**: Zuck AI analyzes the ad and provides recommendations
4. **View Results**: Users see detailed analysis and 2-5 campaign suggestions
5. **Track Performance**: Users can optionally submit real campaign results
6. **Continuous Learning**: System learns from results to improve future recommendations

## 💰 Subscription Plans

- **Starter ($20/month)**: 5 ad analyses per month, basic recommendations, email support
- **Builder ($50/month)**: 25 ad analyses per month, advanced recommendations, priority support, campaign templates
- **Pro ($100/month)**: Unlimited analyses, premium recommendations, phone support, custom strategies, API access

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_production_stripe_publishable_key
STRIPE_SECRET_KEY=your_production_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_production_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- User authentication and authorization
- Secure API routes
- Environment variable protection
- Input validation and sanitization

## 📈 Future Enhancements

- **Semantic Search**: Implement pgvector for finding similar successful campaigns
- **Advanced Analytics**: Dashboard with performance metrics
- **A/B Testing**: Built-in ad testing capabilities
- **API Access**: Public API for enterprise customers
- **Mobile App**: React Native mobile application
- **Team Collaboration**: Multi-user workspaces
- **Integration**: Connect with Facebook Ads API directly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@zuckai.com or join our Slack channel.

## 🙏 Acknowledgments

- OpenAI for GPT-4o technology
- Supabase for the amazing backend platform
- Stripe for payment processing
- The Facebook Ads community for inspiration

---

Built with ❤️ by the Zuck AI team 
>>>>>>> 2608568 (zuck ai)

# LinklyMedia

LinklyMedia is a comprehensive platform for billboard advertising, connecting advertisers, partners, and users in a seamless ecosystem for booking, managing, and promoting billboard spaces. The platform allows users to browse, book, and review billboards, while partners can list and manage their advertising spaces. Built with a modern tech stack, it ensures scalability, security, and an intuitive user experience.

## Features

### User Management
- **Registration and Login**: Secure user registration with role-based access (User, Partner, Admin).
- **Profile Management**: Users can view and update their profiles, including personal details and preferences.
- **Authentication**: JWT-based token authentication with refresh token support for secure sessions.
- **Logout**: Secure logout with token invalidation.

### Billboard Management
- **Browse Billboards**: View all available billboards with filtering by city, size, format, orientation, price, and rating.
- **Search Billboards**: Full-text search across billboard titles and descriptions.
- **Detailed View**: Get detailed information about a specific billboard, including reviews and ratings.
- **Cart Functionality**: Add billboards to cart, remove items, and view cart summary with total pricing.
- **Reviews and Ratings**: Users can add reviews and ratings to billboards, with automatic average rating calculation.
- **Like Billboards**: Users can like billboards for future reference.
- **Top Billboards**: Retrieve top billboards based on traffic score and location.

### Partner Management
- **Partner Registration**: Partners can register with business details, GST, PAN, and address information.
- **Billboard Listings**: Partners can add, update, and delete their billboard listings.
- **Order Management**: Handle incoming bookings and manage order statuses.
- **Earnings Tracking**: Track total listings, earnings, and ratings.

### Admin Features
- **User Oversight**: Admins can manage users, partners, and overall platform operations.
- **Content Moderation**: Oversee billboard listings and reviews.

### Additional Features
- **Geolocation Services**: Automatic city detection using Geoapify for location-based recommendations.
- **Image Management**: Cloudinary integration for uploading and managing billboard images.
- **Payment Integration**: Support for digital payments and Cash on Delivery (COD).
- **CORS Support**: Configured for frontend-backend communication.
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS.

## Tech Stack

### Frontend
- **React**: Component-based UI library for building interactive interfaces.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for responsive design.
- **Lucide React**: Icon library for consistent and scalable icons.
- **Phosphor Icons**: Additional icon set for enhanced UI elements.
- **React Router DOM**: Client-side routing for single-page application navigation.

### Backend
- **Go**: High-performance programming language for backend development.
- **Gin**: Lightweight web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for flexible data storage.
- **JWT**: JSON Web Tokens for secure authentication.
- **Bcrypt**: Password hashing for security.
- **Validator**: Input validation for API requests.
- **CORS**: Cross-Origin Resource Sharing for web security.

### Services and Integrations
- **Cloudinary**: Cloud-based image and video management.
- **Geoapify**: Geolocation and reverse geocoding services.
- **MongoDB Driver**: Official Go driver for MongoDB interactions.

## Project Structure

```
LinklyMedia/
├── functions.txt                          # List of API functions and features
├── package.json                           # Root package.json (if any)
├── LinklyMedia-Frontend/                  # Frontend application
│   ├── public/                            # Static assets
│   │   ├── images/                        # Image files (logos, icons, etc.)
│   │   └── vite.svg                       # Vite logo
│   ├── src/                               # Source code
│   │   ├── assets/                        # Additional assets
│   │   ├── components/                    # Reusable React components
│   │   │   ├── layouts/                   # Layout components (Navbar, Footer)
│   │   │   └── [Component].jsx            # Individual components (Adv, Brand, etc.)
│   │   ├── pages/                         # Page components
│   │   │   ├── Home.jsx                   # Home page
│   │   │   ├── SignIn.jsx                 # Sign-in page
│   │   │   ├── Billboards.jsx             # Billboards listing page
│   │   │   ├── Digitalscreen.jsx          # Digital screen page
│   │   │   ├── Influencermarket.jsx       # Influencer marketing page
│   │   │   └── Btlmarket.jsx              # BTL marketing page
│   │   ├── App.jsx                        # Main App component with routing
│   │   ├── main.jsx                       # Entry point
│   │   └── index.css                      # Global styles
│   ├── package.json                       # Frontend dependencies
│   ├── vite.config.js                     # Vite configuration
│   ├── index.html                         # HTML template
│   └── README.md                          # Frontend-specific README
├── LinklyServer/                          # Backend application
│   ├── main.go                            # Entry point for the Go server
│   ├── go.mod                             # Go module file
│   ├── go.sum                             # Go dependencies checksum
│   ├── controllers/                       # API controllers
│   │   ├── userControllers.go             # User-related endpoints
│   │   ├── billboardControllers.go        # Billboard-related endpoints
│   │   ├── partnerControllers.go          # Partner-related endpoints
│   │   ├── adminControllers.go            # Admin-related endpoints
│   │   └── billing.go                     # Billing and payment logic
│   ├── models/                            # Data models
│   │   ├── userModel.go                   # User and Partner models
│   │   ├── billboardModel.go              # Billboard and related models
│   │   └── admin.Model.go                 # Admin models
│   ├── routes/                            # Route definitions
│   │   ├── unProtectedRoutes.go           # Public routes
│   │   └── protectedRoutes.go             # Protected routes (requires auth)
│   ├── middleware/                        # Custom middleware
│   │   └── authMiddleware.go              # Authentication middleware
│   ├── database/                          # Database connection
│   │   └── databaseConnection.go          # MongoDB connection setup
│   ├── services/                          # External services
│   │   ├── cloudnary.go                   # Cloudinary integration
│   │   └── geoapify.go                    # Geoapify geolocation service
│   └── utils/                             # Utility functions
│       ├── tokenUtils.go                  # JWT token utilities
│       ├── utils.go                       # General utilities
│       └── cart.go                        # Cart-related utilities
```

## Installation

### Prerequisites
- **Node.js** (v16 or higher) for frontend
- **Go** (v1.19 or higher) for backend
- **MongoDB** (local or cloud instance)
- **Git** for cloning the repository

### Clone the Repository
```bash
git clone https://github.com/yourusername/LinklyMedia.git
cd LinklyMedia
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd LinklyServer
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

3. Set up environment variables (create a `.env` file):
   ```
   MONGODB_URI=mongodb://localhost:27017/linklymedia
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_URL=your_cloudinary_url
   GEOAPIFY_API_KEY=your_geoapify_api_key
   ```

4. Run the server:
   ```bash
   go run main.go
   ```
   The server will start on `https://linklymedia1.onrender.com`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../LinklyMedia-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Usage

### Running the Application
1. Ensure MongoDB is running.
2. Start the backend server (`go run main.go` in LinklyServer).
3. Start the frontend (`npm run dev` in LinklyMedia-Frontend).
4. Open `http://localhost:5173` in your browser.

### User Roles
- **User**: Can browse billboards, add to cart, leave reviews, and book advertisements.
- **Partner**: Can manage billboard listings, view orders, and track earnings.
- **Admin**: Oversees platform operations, user management, and content.

### Key Workflows
1. **User Registration**: Register as a User or Partner via the sign-in page.
2. **Browsing Billboards**: Navigate to the Billboards page to view and filter listings.
3. **Booking Process**: Add billboards to cart, proceed to checkout, and complete payment.
4. **Partner Dashboard**: Partners can add new billboards and manage existing ones.
5. **Review System**: Users can rate and review billboards after booking.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `POST /api/refresh` - Refresh access token
- `POST /api/logout` - Logout user

### User Profile
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)

### Billboards
- `GET /api/billboards` - Get all billboards
- `GET /api/billboards/:id` - Get billboard by ID
- `GET /api/billboards/search?query=...` - Search billboards
- `GET /api/billboards/top` - Get top billboards by location
- `POST /api/billboards/:id/review` - Add review to billboard
- `POST /api/cart/add` - Add billboard to cart (protected)
- `DELETE /api/cart/remove/:id` - Remove from cart (protected)
- `GET /api/cart` - Get cart items (protected)
- `POST /api/billboards/:id/like` - Like a billboard (protected)

### Partner
- `POST /api/partner/billboard` - Add new billboard (protected, partner only)
- `PUT /api/partner/billboard/:id` - Update billboard (protected, partner only)
- `DELETE /api/partner/billboard/:id` - Delete billboard (protected, partner only)
- `GET /api/partner/listings` - Get partner's listings (protected, partner only)
- `GET /api/partner/orders` - Get partner's orders (protected, partner only)

### Admin
- `GET /api/admin/users` - Get all users (protected, admin only)
- `GET /api/admin/partners` - Get all partners (protected, admin only)
- `PUT /api/admin/user/:id` - Update user status (protected, admin only)

### Additional
- `POST /api/order/calculate` - Calculate order price
- `POST /api/billboard/available/:id` - Check billboard availability

## Contributing

We welcome contributions to LinklyMedia! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a Pull Request.

### Development Guidelines
- Follow Go and React best practices.
- Write clear, concise commit messages.
- Ensure all tests pass before submitting.
- Update documentation as needed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact:
- Email: support@linklymedia.com
- GitHub Issues: [LinklyMedia Issues](https://github.com/yourusername/LinklyMedia/issues)

---

*LinklyMedia - Connecting Advertisers to the Perfect Billboard Spaces*

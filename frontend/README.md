# SettleUp Frontend

A modern React-based frontend for the SettleUp application.

## Features

- **Dashboard**: Overview of users, groups, expenses, and balances
- **User Management**: View and manage users with balance information
- **Group Management**: Create and manage groups with member details
- **Expense Management**: Add and track expenses with automatic splitting
- **Split Management**: View and manage individual splits and payments
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Backend Spring Boot application running on `http://localhost:8080`

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Users.js
│   │   ├── Groups.js
│   │   ├── Expenses.js
│   │   └── Splits.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The frontend communicates with the Spring Boot backend through the API service in `src/services/api.js`. Make sure your backend is running on `http://localhost:8080` before using the frontend.

## Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- **Custom color scheme** with primary, success, warning, and danger colors

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Backend Connection Issues
- Ensure the Spring Boot backend is running on `http://localhost:8080`
- Check that CORS is properly configured on the backend
- Verify the API endpoints are working using tools like Postman

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

### Port Conflicts
- If port 3000 is in use, React will automatically suggest an alternative port
- You can also manually specify a port: `PORT=3001 npm start`

## Development

### Adding New Features
1. Create new components in the `src/components/` directory
2. Add new pages in the `src/pages/` directory
3. Update the API service in `src/services/api.js` for new endpoints
4. Add routing in `src/App.js`

### Styling Guidelines
- Use Tailwind CSS utility classes for styling
- Follow the established color scheme (primary, success, warning, danger)
- Ensure responsive design for mobile devices
- Use consistent spacing and typography

## Deployment

To build for production:
```bash
npm run build
```

The build files will be created in the `build/` directory, which can be deployed to any static hosting service.

## Contributing

1. Follow the existing code style and structure
2. Test your changes thoroughly
3. Ensure the application works on both desktop and mobile
4. Update documentation as needed 
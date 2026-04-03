# Wesselli Client

React frontend for the Wesselli Logistics Platform.

## Features
- Responsive UI with dark/light theme
- User authentication
- Shipment and route management
- Interactive maps (Leaflet)
- Real-time updates

## Tech Stack
- React 19
- React Router DOM
- React Leaflet
- Lucide React icons
- CSS Modules

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running

### Installation
```bash
npm install
npm start
```

The app will run on `http://localhost:3000`

## Project Structure
```
src/
├── components/      # Reusable components
├── pages/          # Page components
├── services/       # API services
├── utils/          # Utilities
├── ThemeContext.jsx # Theme provider
└── App.jsx         # Main app
```

## Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Environment Variables
Create `.env` in client/:
```
REACT_APP_API_URL=http://localhost:3000/api
```

## Contributing
Follow the main project guidelines.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Doctor Discovery Application

A React-based application that allows users to discover doctors through an intuitive search interface with filtering and sorting capabilities.

## Features

- Autocomplete-enabled search bar for finding doctors by name
- Filter doctors by consultation type (Video Consult/In Clinic)
- Filter doctors by multiple specialties
- Sort doctors by fees (low to high) or experience (high to low)
- State persistence through URL parameters
- Responsive design for all screen sizes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Axios

## Project Structure

```
src/
  ├── components/
  │   └── DoctorDiscovery.tsx
  ├── App.tsx
  └── index.tsx
public/
  └── index.html
```

## API Integration

The application fetches doctor data from:
```
https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json
``` 
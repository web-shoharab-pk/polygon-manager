# Polygon Manager

A Next.js application for managing and visualizing geographical polygons on an interactive map. Built with React, TypeScript, and Leaflet.

## Features

- Interactive map visualization using Leaflet
- Draw, edit, and delete polygons
- Search and filter polygons
- Import/Export GeoJSON data
- Responsive design with dark mode support
- Real-time polygon area calculation
- Color customization for polygons

## Tech Stack

- **Framework**: Next.js 15.1
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: SCSS Modules
- **Map Library**: Leaflet with React-Leaflet
- **Form Handling**: React Hook Form
- **Data Format**: GeoJSON

## Project Structure

src/
├── components/
│ ├── common/
│ │ ├── Header.tsx 
│ │ └── Header.module.scss
│ ├── MapComponent.tsx 
│ └── MapComponent.module.scss
│  
├── pages/
│ ├── app.tsx 
│ ├── document.tsx 
│ ├── index.tsx 
│ └── polygons/ 
├── store/
│ ├── polygonSlice.ts # Redux slice for polygon state
│ └── store.ts # Redux store configuration
└── styles/
├── globals.scss # Global styles
└── Polygons.module.scss # Polygon page styles

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

# or

```bash
yarn install
```

# or

```bash
pnpm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Features in Detail

### Map Component

- Draw polygons with intersection prevention
- Automatic area calculation
- Polygon center markers with tooltips
- User location detection
- Custom styling options

### Polygon Management

- CRUD operations for polygons
- Real-time search functionality
- Color customization with hex input
- Responsive grid layout
- Form validation

### Data Management

- GeoJSON import/export
- Automatic data persistence
- Unique ID generation for polygons
- Area calculation in square kilometers

## Styling

The project uses SCSS modules for component-specific styling with:

- Responsive design
- Dark mode support
- Custom color schemes
- Flexible grid layouts
- Interactive animations

## State Management

Redux Toolkit is used for state management with:

- Centralized polygon state
- Action creators for CRUD operations
- TypeScript type safety
- Efficient updates with ImmerJS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Deployment

The application can be easily deployed on Vercel:

1. Push your code to GitHub
2. Import your repository on Vercel
3. Deploy with environment variables if needed

For more details on deployment, check the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying).

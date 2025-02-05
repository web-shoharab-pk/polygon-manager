# Polygon Manager

A Next.js application for managing and visualizing geographical polygons on an interactive map. Built with React, TypeScript, and Leaflet.

## Features

- 🗺️ Interactive map visualization using Leaflet
- ✏️ Draw, edit, and delete polygons with intersection prevention
- 🔍 Advanced search and filtering capabilities
- 💾 Import/Export GeoJSON data
- 📐 Real-time polygon area calculation
- 🎨 Custom polygon styling and color management

## Tech Stack

- **Framework**: Next.js 15.1
- **Language**: TypeScript 5.0+
- **State Management**: Redux Toolkit
- **Styling**: SCSS Modules
- **Map Library**: Leaflet with React-Leaflet
- **Form Handling**: React Hook Form
- **Data Format**: GeoJSON

## Project Structure

```
src/
├── components/
│ ├── common/
│ │ ├── Header.tsx
│ │ └── Header.module.scss
│ ├── MapComponent.tsx
│ └── MapComponent.module.scss
│
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── polygons/
├── store/
│   ├── slices/
│   │   └── polygonSlice.ts
│   └── store.ts
└── styles/
    ├── globals.scss # Global styles
    └── Polygons.module.scss # Polygon page styles
```

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository

```bash
git clone https://github.com/web-shoharab-pk/polygon-manager
cd polygon-manager
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Core Features

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

### User Interface

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

The application can be easily deployed on Vercel:

1. Push your code to GitHub
2. Import your repository on Vercel
3. Deploy with environment variables if needed

- [Leaflet](https://leafletjs.com/) for the mapping functionality
- [Next.js](https://nextjs.org/) team for the amazing framework
- All our contributors and supporters

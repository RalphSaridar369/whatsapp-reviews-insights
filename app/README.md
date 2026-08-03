# WhatsApp Reviews Insights Dashboard

A React-based web application for exploring and analyzing clustered WhatsApp reviews. This dashboard provides an interactive interface to visualize review topics, sentiment patterns, and user feedback.

## Features

- **Overview Dashboard**: View key metrics including total reviews, topics found, average rating, and unclustered percentage
- **Topic Clustering Visualization**: Browse 66 clustered topics with bar charts showing volume (length) and sentiment (color)
- **Detailed Topic Analysis**: Drill down into individual topics to see:
  - Topic description and representative keywords
  - Review count and average rating
  - Rating distribution histogram
  - Individual reviews within the topic
- **Sentiment-based Color Coding**: Visual indicators for good (green), average (yellow), and bad (red) ratings

## Tech Stack

- **React 19** - UI library with React Compiler enabled for optimization
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization library
- **React Icons** - Icon library

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
cd app
npm install
```

### Development

Run the development server:

```bash
npm run dev
```
### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
app/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ClustersList.tsx
│   │   ├── Header.tsx
│   │   ├── HomeCard.tsx
│   │   ├── Overlay.tsx
│   │   ├── Reviews.tsx
│   │   └── ScoreHistogram.tsx
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   └── ClusterDetails.tsx
│   ├── data/           # Static data files
│   │   ├── clusters.json
│   │   └── reviews.json
│   ├── context/        # React context providers
│   ├── App.tsx         # Main app component with routing
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── package.json
```

## Data

The dashboard uses pre-processed data from the semantic review clustering pipeline:
- `clusters.json` - Contains topic information, descriptions, and statistics
- `reviews.json` - Contains individual reviews grouped by topic

To update the data, run the clustering pipeline in the `semantic-review-clustering/` directory and copy the output files to `app/src/data/`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

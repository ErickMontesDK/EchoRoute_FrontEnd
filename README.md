# EchoRoute · Frontend

EchoRoute is a field operations platform for delivery and sales teams. Drivers check in at each client by scanning a QR code, the app records the visit with the phone's GPS and checks how far they were from the client, and admins follow everything on a live map and dashboard. It is used in production by a distribution company.

This repo is the React web app. The API lives in [EchoRoute_BackEnd](https://github.com/ErickMontesDK/EchoRoute_BackEnd).

**Live demo:** [echoroute-wine.vercel.app](https://echoroute-wine.vercel.app/) (read-only)
Log in as `admin` / `echo1234` for the admin view, or `deliverer` / `echo1234` for the driver view.

## Features

- **Role-based app:** admins, operators and deliverers each get their own screens and permissions
- **QR check-in:** deliverers scan a client's code with the phone camera to register a visit
- **Geolocation:** each visit stores the device's coordinates; the backend validates the distance to the client
- **Live map:** clients and visits on an interactive Leaflet map, filterable by route
- **Admin dashboard:** visit stats, paginated and searchable tables, and Excel exports
- **JWT auth** with token refresh and protected routes

## Stack

React 19 · TypeScript · React Router · TanStack Table · Axios · Leaflet · Luxon · deployed on Vercel

## Structure

```
src/
├── features/     # one folder per domain: clients, visits, users, business...
│   └── <feature>/ api/ components/ hooks/ utils/
├── components/   # layout, map, scanner, dashboard, shared inputs
├── hooks/        # geolocation, pagination, permissions, scanner
└── api/          # Axios instance with JWT handling
```

## Running locally

```bash
npm install
REACT_APP_API_URL=http://localhost:8000/api npm start
```

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the EchoRoute API |
| `REACT_APP_DEMO_MODE` | `True` shows the demo credentials on the login page |

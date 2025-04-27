# Custom Google Search Console Report Builder

A powerful tool for building custom reports based on data from Google Search Console (GSC). With features like drag-and-drop report creation, CSV export, data duration selection, and integration with Next.js authentication (Next Auth), this app helps you visualize and analyze your website's performance with ease.

## Features

- **Sign In with Next Auth**: Securely sign in using your Google account to access your reports and metrics.
- **Custom Report Building**: Drag and drop data types like clicks, impressions, and more to build your own custom reports.
- **Google Search Console Integration**: Fetch data directly from Google Search Console to generate detailed reports on your website's performance.
- **CSV Export**: Export your custom reports in CSV format for easy analysis and sharing.
- **Data Duration Selection**: Choose the time range for the data you want to visualize (daily, weekly, or custom).
- **Real-Time Data**: Get up-to-date data from Google Search Console to monitor your site's performance.
- **User Access Control**: Manage user permissions and access to your reports.
- **Comprehensive Metrics**: Track important GSC metrics such as clicks, impressions, average position, and more.


### Technologies Used
1. Next.js for the frontend

2. Next Auth for authentication

3. Google Search Console API for fetching GSC data

4. Tailwind CSS for styling

5. Tabler Icons for UI components



## Installation

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gsc-report-builder.git
cd gsc-report-builder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Create a .env.local in your root

```bash
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GSC_API_KEY=your-gsc-api-key
```

### 4. Done! Run your app using

```bash
npm run dev
```
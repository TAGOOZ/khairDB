# Charity Management System

## Google Drive Integration Setup

To enable document storage for individuals using Google Drive:

1. Create a Google Cloud Project:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google Drive API

2. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Fill in the details and grant necessary permissions
   - Create and download the JSON credentials file

3. Set up the Master Folder:
   - Create a folder in Google Drive called "Individuals"
   - Share this folder with the service account email
   - Copy the folder ID from the URL (long string after /folders/)

4. Configure Environment Variables:
   Copy the following variables to your `.env` file and fill in the values:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
   GOOGLE_DRIVE_INDIVIDUALS_FOLDER_ID=your_master_folder_id
   ```

## Features

- Automatic Google Drive folder creation for each individual
- Secure document storage with proper permissions
- Easy access to documents through shareable links
- Integration with individual management system

## Development

1. Install dependencies:
```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values

3. Run the development server:
```bash
   npm run dev
   ```

## Security Considerations

- Keep your service account credentials secure
- Never commit the `.env` file to version control
- Regularly audit folder permissions in Google Drive
- Monitor API usage and quotas

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
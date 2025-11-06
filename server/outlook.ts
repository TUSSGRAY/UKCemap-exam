import { Client } from '@microsoft/microsoft-graph-client';

let connectionSettings: any;

async function getAccessToken() {
  // Force refresh connection settings every time to avoid stale tokens
  connectionSettings = null;
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=outlook',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );

  const data = await response.json();
  connectionSettings = data.items?.[0];

  console.log('Connection settings retrieved:', {
    hasSettings: !!connectionSettings,
    hasOAuth: !!connectionSettings?.settings?.oauth,
    hasCredentials: !!connectionSettings?.settings?.oauth?.credentials,
    hasAccessToken: !!connectionSettings?.settings?.oauth?.credentials?.access_token
  });

  // Try multiple paths to find the access token
  const accessToken = 
    connectionSettings?.settings?.oauth?.credentials?.access_token ||
    connectionSettings?.settings?.access_token;

  if (!connectionSettings || !accessToken) {
    console.error('Failed to retrieve Outlook connection. Settings:', JSON.stringify(connectionSettings, null, 2));
    throw new Error('Outlook not connected or access token not found');
  }
  
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableOutlookClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const client = await getUncachableOutlookClient();
  
  const message = {
    subject: subject,
    body: {
      contentType: 'HTML',
      content: htmlContent
    },
    toRecipients: [
      {
        emailAddress: {
          address: to
        }
      }
    ]
  };

  await client.api('/me/sendMail').post({
    message: message,
    saveToSentItems: true
  });
}

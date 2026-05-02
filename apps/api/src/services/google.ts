import { google } from 'googleapis';
import { prisma } from '../utils/prisma';

export class GoogleService {
  private static getClient(accessToken: string, refreshToken: string) {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    return client;
  }

  static async getTokens(userId: string) {
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId }
    });

    if (!integration) throw new Error('Google integration not found');
    return integration;
  }

  static async listDriveFiles(userId: string, query?: string) {
    const tokens = await this.getTokens(userId);
    const auth = this.getClient(tokens.accessToken, tokens.refreshToken);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: query || "mimeType != 'application/vnd.google-apps.folder'",
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink)',
      spaces: 'drive',
    });

    return response.data.files;
  }

  static async syncCalendarEvent(userId: string, task: { id: string, title: string, description?: string, dueDate: Date }) {
    const tokens = await this.getTokens(userId);
    const auth = this.getClient(tokens.accessToken, tokens.refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `Task: ${task.title}`,
      description: task.description || '',
      start: {
        dateTime: task.dueDate.toISOString(),
      },
      end: {
        // Default 1 hour duration for tasks synced to calendar
        dateTime: new Date(task.dueDate.getTime() + 60 * 60 * 1000).toISOString(),
      },
    };

    // Note: A real implementation would track the Google Calendar Event ID inside the Task model
    // to allow updating existing events rather than just inserting.
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  static async createMeetLink(userId: string, summary: string) {
    const tokens = await this.getTokens(userId);
    const auth = this.getClient(tokens.accessToken, tokens.refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary,
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 3600000).toISOString() }, // 1 hour from now
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    return response.data.hangoutLink;
  }
}

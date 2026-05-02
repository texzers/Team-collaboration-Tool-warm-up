import { Queue, Worker, Job } from 'bullmq';
import puppeteer from 'puppeteer';
import Redis from 'ioredis';
import path from 'path';
import fs from 'fs';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const reportQueue = new Queue('reports', { connection });

// Define the worker
export const reportWorker = new Worker('reports', async (job: Job) => {
  const { projectId, type, data } = job.data;
  
  console.log(`Starting PDF generation for job ${job.id} (Project: ${projectId})`);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // In a real scenario, we'd render an EJS template or navigate to a hidden React route
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; }
            h1 { color: #1a56db; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>TeamFlow Project Report</h1>
          <h2>Project ID: ${projectId}</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr><th>Task Title</th><th>Status</th><th>Assignee</th></tr>
            </thead>
            <tbody>
              ${data.tasks.map((t: any) => `
                <tr>
                  <td>${t.title}</td>
                  <td>${t.status}</td>
                  <td>${t.assignees?.map((a: any) => a.displayName).join(', ') || 'Unassigned'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'tmp', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `report-${job.id}.pdf`);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();
    
    // Upload the file to GCS or AWS S3 in a real scenario
    // For demo, we just return the local path
    return { success: true, path: outputPath, url: `/api/reports/download/${job.id}` };

  } catch (error) {
    console.error(`Failed to generate PDF for job ${job.id}`, error);
    throw error;
  }
}, { connection });

reportWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed! Output: ${job.returnvalue.path}`);
  // Emit socket event to the user to notify them the report is ready
});

reportWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

import fs from 'fs';
import { Resend } from 'resend';

// 1. Initialize Resend with your secure API key
const resend = new Resend(process.env.RESEND_API_KEY);

try {
  // 2. Read and parse your lessons.json file
  const fileData = fs.readFileSync('./lessons.json', 'utf8');
  const { lessons } = JSON.parse(fileData);

  if (!lessons || lessons.length === 0) {
    console.log('No lessons found in the file.');
    process.exit(0);
  }

  // 3. Select a lesson dynamically using the current day of the year
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use the modulo operator (%) to cycle back to 0 if the day exceeds the list size
  const lessonIndex = dayOfYear % lessons.length;
  const selectedLesson = lessons[lessonIndex];

  // 4. Construct and dispatch the email payload via Resend
  const { data, error } = await resend.emails.send({
    from: 'Daily Insight <onboarding@resend.dev>',
    to: [process.env.TO_EMAIL],
    subject: `Daily Insight: Day ${dayOfYear}`,
    text: selectedLesson,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Your Daily Insight</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #444; background-color: #fafafa; padding: 15px; border-left: 4px solid #0070f3; border-radius: 4px;">
          "${selectedLesson}"
        </p>
        <footer style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
          Automated by Daily Lesson App • Day ${dayOfYear} of the year
        </footer>
      </div>
    `
  });

  if (error) {
    console.error('Resend API Error:', error);
    process.exit(1);
  }

  console.log(`Success: Sent lesson index ${lessonIndex}. Message ID: ${data.id}`);

} catch (error) {
  console.error('An error occurred while running the script:', error);
  process.exit(1);
}

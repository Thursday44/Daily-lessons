import fs from 'fs';
import sgMail from '@sendgrid/mail';

// 1. Initialize SendGrid with your secure API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  // Use the modulo operator (%) to cleanly cycle back to 0 if the day exceeds the list size
  const lessonIndex = dayOfYear % lessons.length;
  const selectedLesson = lessons[lessonIndex];

  // 4. Construct and dispatch the email payload
  const emailPayload = {
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
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
  };

  await sgMail.send(emailPayload);
  console.log(`Success: Sent lesson index ${lessonIndex} to your inbox.`);

} catch (error) {
  console.error('An error occurred while running the script:', error);
  process.exit(1);
}

const nodemailer = require('nodemailer');


const apiToken = '05138ad95d1375bd004a25194688ac82'; // Your Mailtrap API token
const usernames = ['api', 'smtp@mailtrap.io'];

function trySend(user) {
  const transporter = nodemailer.createTransport({
    host: 'live.smtp.mailtrap.io',
    port: 587,
    auth: {
      user,
      pass: apiToken
    }
  });

  transporter.sendMail({
    from: 'Scaffold Test <signup@scaffoldtool.com>',
    to: 'ngai01foj@eacademia.uk',
    subject: `Mailtrap SMTP Test (user: ${user})`,
    text: 'This is a test email sent via Mailtrap SMTP from Node.js'
  }, (err, info) => {
    if (err) {
      console.error(`Error with user '${user}':`, err);
      if (user === usernames[0]) {
        // Try the next username
        trySend(usernames[1]);
      }
    } else {
      console.log(`Success with user '${user}':`, info);
    }
  });
}

trySend(usernames[0]);

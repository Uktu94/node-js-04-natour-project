const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

// Related to our app,like db confings, error handling, env variables

//  START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on ${PORT}...`);
});

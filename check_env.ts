import dotenv from 'dotenv';
dotenv.config();
const key = process.env.GEMINI_API_KEY;
if (key) {
  const masked = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : key;
  console.log(`KEY: ${masked} (len: ${key.length})`);
} else {
  console.log("NO KEY");
}

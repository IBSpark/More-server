import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const [result] = await client.listVoices();
    return res.status(200).json(result.voices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch voices" });
  }
}
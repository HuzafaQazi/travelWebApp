export default function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch the userId from localStorage or cookies in the client-side request
    const userId = req.cookies.userId; // or req.headers.authorization if you're using headers

    // Respond with the userId
    res.status(200).json({ userId });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

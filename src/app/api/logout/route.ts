import { withAuth } from 'next-firebase-auth';

const handler = withAuth()((req, res) => {
  res.status(200).json({ success: true });
});

export default handler; 
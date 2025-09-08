import { NextApiRequest, NextApiResponse } from 'next';
import swagger from '@/utils/swagger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return the OpenAPI specification
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swagger.generateSpec());
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

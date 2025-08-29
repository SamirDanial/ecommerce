import express from 'express';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { dashboardService } from '../services/dashboardService';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateClerkToken);

// GET /api/admin/dashboard - Get dashboard data
router.get('/', async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

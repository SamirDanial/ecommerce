import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Unified search endpoint
router.get('/', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Search query is required',
        products: [],
        categories: []
      });
    }

    const searchTerm = query.trim();
    
    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [searchTerm] } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        images: {
          select: {
            url: true,
            alt: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: 10 // Limit results for search dropdown
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true
      },
      take: 5 // Limit results for search dropdown
    });

    res.json({
      products,
      categories
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      products: [],
      categories: []
    });
  }
});

export default router;

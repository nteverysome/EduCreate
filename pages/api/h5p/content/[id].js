import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API handler for H5P content
 * 
 * This API endpoint retrieves H5P content by ID and returns the necessary data
 * for rendering the content in the frontend.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Content ID is required' });
  }
  
  try {
    // Fetch H5P content from database
    const h5pContent = await prisma.h5pContent.findUnique({
      where: { id: parseInt(id) },
      include: {
        libraries: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!h5pContent) {
      return res.status(404).json({ error: 'H5P content not found' });
    }
    
    // Check if user has access to this content
    const isOwner = h5pContent.userId === session.user.id;
    const isPublic = h5pContent.isPublic;
    
    if (!isOwner && !isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Return H5P content data
    return res.status(200).json({
      id: h5pContent.id,
      title: h5pContent.title,
      contentType: h5pContent.contentType,
      content: h5pContent.content,
      metadata: h5pContent.metadata,
      slug: h5pContent.slug,
      createdAt: h5pContent.createdAt,
      updatedAt: h5pContent.updatedAt,
      author: h5pContent.user,
      libraries: h5pContent.libraries.map(lib => ({
        id: lib.id,
        name: lib.name,
        version: lib.version
      }))
    });
  } catch (error) {
    console.error('Error fetching H5P content:', error);
    return res.status(500).json({ error: 'Failed to fetch H5P content' });
  }
}
/**
 * Image Version Cleanup API
 * 
 * DELETE /api/images/[id]/versions/cleanup
 * - Clean up old versions based on retention policy
 * - Keep the most recent N versions
 * - Delete old version files from Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { del } from '@vercel/blob';

/**
 * Version Retention Policy
 * 
 * Default: Keep the most recent 10 versions per image
 * This can be configured per user or globally
 */
const DEFAULT_MAX_VERSIONS = 10;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const imageId = params.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const maxVersions = parseInt(searchParams.get('maxVersions') || String(DEFAULT_MAX_VERSIONS));
    const dryRun = searchParams.get('dryRun') === 'true';

    // Get all versions for this image, ordered by version number (newest first)
    const allVersions = await prisma.imageVersion.findMany({
      where: {
        imageId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    // If total versions <= maxVersions, no cleanup needed
    if (allVersions.length <= maxVersions) {
      return NextResponse.json({
        success: true,
        message: 'No cleanup needed',
        totalVersions: allVersions.length,
        maxVersions,
        versionsToDelete: 0,
      });
    }

    // Versions to keep (most recent N)
    const versionsToKeep = allVersions.slice(0, maxVersions);
    
    // Versions to delete (older versions)
    const versionsToDelete = allVersions.slice(maxVersions);

    // If dry run, just return what would be deleted
    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Dry run - no versions deleted',
        totalVersions: allVersions.length,
        maxVersions,
        versionsToKeep: versionsToKeep.length,
        versionsToDelete: versionsToDelete.length,
        versionsToDeleteList: versionsToDelete.map(v => ({
          id: v.id,
          version: v.version,
          url: v.url,
          createdAt: v.createdAt,
        })),
      });
    }

    // Delete old versions
    const deletedVersions = [];
    const failedDeletions = [];

    for (const version of versionsToDelete) {
      try {
        // Delete from Vercel Blob
        if (version.blobPath) {
          await del(version.blobPath);
        }

        // Delete from database
        await prisma.imageVersion.delete({
          where: { id: version.id },
        });

        deletedVersions.push({
          id: version.id,
          version: version.version,
          url: version.url,
        });
      } catch (error) {
        console.error(`Failed to delete version ${version.id}:`, error);
        failedDeletions.push({
          id: version.id,
          version: version.version,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedVersions.length} old versions`,
      totalVersions: allVersions.length,
      maxVersions,
      versionsKept: versionsToKeep.length,
      versionsDeleted: deletedVersions.length,
      deletedVersions,
      failedDeletions: failedDeletions.length > 0 ? failedDeletions : undefined,
    });
  } catch (error) {
    console.error('Version cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup versions',
      },
      { status: 500 }
    );
  }
}

/**
 * Get version cleanup status
 * 
 * GET /api/images/[id]/versions/cleanup
 * - Check how many versions exist
 * - Check if cleanup is needed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const imageId = params.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const maxVersions = parseInt(searchParams.get('maxVersions') || String(DEFAULT_MAX_VERSIONS));

    // Get version count
    const versionCount = await prisma.imageVersion.count({
      where: { imageId },
    });

    // Get oldest and newest versions
    const oldestVersion = await prisma.imageVersion.findFirst({
      where: { imageId },
      orderBy: { version: 'asc' },
    });

    const newestVersion = await prisma.imageVersion.findFirst({
      where: { imageId },
      orderBy: { version: 'desc' },
    });

    const needsCleanup = versionCount > maxVersions;
    const versionsToDelete = needsCleanup ? versionCount - maxVersions : 0;

    return NextResponse.json({
      success: true,
      imageId,
      totalVersions: versionCount,
      maxVersions,
      needsCleanup,
      versionsToDelete,
      oldestVersion: oldestVersion ? {
        version: oldestVersion.version,
        createdAt: oldestVersion.createdAt,
      } : null,
      newestVersion: newestVersion ? {
        version: newestVersion.version,
        createdAt: newestVersion.createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Version cleanup status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cleanup status',
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

/**
 * Pusher 私有頻道認證端點
 * 
 * 用於驗證用戶是否有權訂閱私有頻道
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. 解析請求體
    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // 3. 驗證頻道權限
    // 只允許用戶訂閱自己的私有頻道
    const expectedChannel = `private-user-${session.user.id}`;
    if (channelName !== expectedChannel) {
      return NextResponse.json(
        { error: 'Forbidden: You can only subscribe to your own channel' },
        { status: 403 }
      );
    }

    // 4. 生成認證簽名
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    // 5. 返回認證結果
    return NextResponse.json(authResponse);

  } catch (error) {
    console.error('[Pusher Auth Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


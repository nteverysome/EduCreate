-- Supabase 資料庫遷移腳本
-- 此腳本將建立與現有 Prisma schema 相容的資料表

-- 建立 enum 類型
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TemplateType" AS ENUM ('DRAG_DROP', 'QUIZ', 'PRESENTATION', 'GAME');
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE');
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'PUSH', 'SMS');

-- 建立 User 資料表
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 建立 PasswordReset 資料表
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- 建立 Template 資料表
CREATE TABLE "Template" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "TemplateType" NOT NULL,
    "thumbnail" TEXT,
    "config" JSONB NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- 建立 H5PContent 資料表
CREATE TABLE "H5PContent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" TEXT NOT NULL,
    "contentPath" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "H5PContent_pkey" PRIMARY KEY ("id")
);

-- 建立 Activity 資料表
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB,
    "elements" JSONB NOT NULL DEFAULT '[]',
    "type" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "h5pContentId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- 建立 Plan 資料表
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "features" TEXT[],

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- 建立 Subscription 資料表
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "endDate" TIMESTAMPTZ,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMPTZ,
    "currentPeriodEnd" TIMESTAMPTZ,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- 建立唯一索引
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");
CREATE UNIQUE INDEX "PasswordReset_userId_key" ON "PasswordReset"("userId");
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- 建立外鍵約束
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_h5pContentId_fkey" FOREIGN KEY ("h5pContentId") REFERENCES "H5PContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "H5PContent" ADD CONSTRAINT "H5PContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_updated_at BEFORE UPDATE ON "Activity" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_h5pcontent_updated_at BEFORE UPDATE ON "H5PContent" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "H5PContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策
-- 用戶只能查看和修改自己的資料
CREATE POLICY "Users can view own profile" ON "User" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON "User" FOR UPDATE USING (auth.uid()::text = id);

-- 用戶只能查看和修改自己的活動
CREATE POLICY "Users can view own activities" ON "Activity" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create activities" ON "Activity" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own activities" ON "Activity" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own activities" ON "Activity" FOR DELETE USING (auth.uid()::text = "userId");

-- 用戶只能查看和修改自己的 H5P 內容
CREATE POLICY "Users can view own h5p content" ON "H5PContent" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create h5p content" ON "H5PContent" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own h5p content" ON "H5PContent" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own h5p content" ON "H5PContent" FOR DELETE USING (auth.uid()::text = "userId");

-- 用戶只能查看自己的訂閱
CREATE POLICY "Users can view own subscription" ON "Subscription" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can update own subscription" ON "Subscription" FOR UPDATE USING (auth.uid()::text = "userId");
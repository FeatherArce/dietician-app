"use client";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import { FormValues } from "@/components/form";
import PageAuthBlocker from "@/components/page/PageAuthBlocker";
import PageContainer from "@/components/page/PageContainer";
import FullShopForm from "@/components/shop/ShopForm";
import { toast } from "@/components/Toast";
import { createLunchShop } from "@/data-access/lunch/lunch-shop";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaArrowLeft,
  FaPlus
} from "react-icons/fa";

export default function NewShopPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { response, result } = await createLunchShop(values);

      console.log('Response:', response);

      if (response.ok && result.success && result?.data?.shop?.id) {
        toast.success('商店建立成功');
        router.push(`/lunch/shops/${result?.data?.shop?.id}`);
      } else {
        console.error('API Error:', response);
        toast.error(`建立商店失敗: ${result.message || '未知錯誤'}`);
        throw new Error(result.message || `建立商店失敗 (狀態碼: ${response.status})`);
      }
    } catch (error) {
      console.error('Failed to create shop:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageAuthBlocker
        description="您需要登入才能建立商店"
        loading={authLoading}
      />
    );
  }

  return (
    <PageContainer>
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          lunchBreadcrumbHomeItem,
          { label: '商店管理', href: '/lunch/shops' },
          { label: '建立商店', current: true }
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-circle"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <FaPlus className="w-8 h-8 text-primary" />
            <span>建立新商店</span>
          </h1>
          <p className="text-base-content/70 mt-1">
            新增商店資訊
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <FullShopForm
          initialValues={{
            is_active: true
          }}
          mode="create"
          loading={loading}
          onFinish={handleSubmit}
        />
      </div>
    </PageContainer>
  );
}
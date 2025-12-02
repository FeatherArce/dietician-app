"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaEdit,
  FaStore,
  FaToggleOn,
  FaToggleOff,
  FaPhone,
  FaMapMarkerAlt,
  FaUtensils,
  FaCalendarAlt,
  FaShoppingCart,
  FaPlus,
  FaEye
} from "react-icons/fa";
import { Shop } from "@/prisma-generated/postgres-client";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import PageLink from "@/components/ui/PageLink";
import Fieldset from "@/components/ui/Fieldset";
import PageContainer from "@/components/page/PageContainer";
import { IShop } from "@/types/LunchEvent";
import { API_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app-constants";
import { getLunchShopById } from "@/data-access/lunch/lunch-shop";
import { ShopWithArgs } from "@/types/api/lunch";

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<ShopWithArgs | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchShop = useCallback(async () => {
    try {
      const { response, result } = await getLunchShopById(shopId);
      if (response.ok && result.success && result.data?.shop) {        
        setShop(result.data?.shop);
      } else {
        router.push(ROUTE_CONSTANTS.LUNCH_SHOPS);
      }
    } catch (error) {
      console.error("Failed to fetch shop:", error);
      router.push(ROUTE_CONSTANTS.LUNCH_SHOPS);
    } finally {
      setLoading(false);
    }
  }, [shopId, router]);

  useEffect(() => {
    if (shopId) {
      fetchShop();
    }
  }, [shopId, fetchShop]);

  const toggleShopStatus = async () => {
    if (!shop) return;

    setUpdating(true);
    try {
      const response = await fetch(API_CONSTANTS.LUNCH_SHOP_DETAIL_ENDPOINT(shopId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !shop.is_active }),
      });

      if (response.ok) {
        await fetchShop();
      }
    } catch (error) {
      console.error("Failed to update shop status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">找不到商店</h2>
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            返回上一頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          lunchBreadcrumbHomeItem,
          { label: '商店管理', href: ROUTE_CONSTANTS.LUNCH_SHOPS },
          { label: shop.name, current: true }
        ]}
      />

      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <FaStore className="w-8 h-8 text-primary" />
              <span>{shop.name}</span>
              <span
                className={`badge ${shop.is_active ? "badge-success" : "badge-error"
                  }`}
              >
                {shop.is_active ? "營業中" : "暫停營業"}
              </span>
            </h1>
            <p className="text-base-content/70 mt-1">
              商店詳細資料與菜單管理
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={ROUTE_CONSTANTS.LUNCH_SHOP_EDIT(shopId)}
            className="btn btn-ghost"
          >
            <FaEdit className="w-4 h-4" />
            編輯
          </Link>
          <button
            className={`btn ${shop.is_active ? "btn-error" : "btn-success"}`}
            onClick={toggleShopStatus}
            disabled={updating}
          >
            {updating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : shop.is_active ? (
              <>
                <FaToggleOff className="w-4 h-4" />
                暫停營業
              </>
            ) : (
              <>
                <FaToggleOn className="w-4 h-4" />
                恢復營業
              </>
            )}
          </button>
        </div>
      </div>

      {/* 基本資料 */}
      <div className="">
        <Fieldset
          legend="基本資料"
          items={[
            // { label: '商店 ID', content: shop.id },
            { label: '名稱', content: shop.name },
            { label: '地址', content: shop.address || '無' },
            { label: '電話', content: shop.phone || '無' },
            { label: '描述', content: shop.description || '無' },
            { label: '狀態', content: shop.is_active ? '可用' : '停用' },
            { label: '活動次數', content: `${shop?.events?.length || 0} 次` },
            { label: '菜單數量', content: `${shop?.menus?.length || 0} 個` },
            { label: '菜單項目數量', content: `${shop.menus?.reduce((total, menu) => total + (menu?.items?.length || 0), 0) || 0} 個` },
          ]}
          colSpan={{
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
          }}
        />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">菜單管理</h3>
          <PageLink
            href={ROUTE_CONSTANTS.LUNCH_SHOP_MENU_NEW(shopId)}
            className="btn btn-primary"
          >
            <FaPlus className="w-4 h-4" />
            新增菜單
          </PageLink>
        </div>

        {shop.menus && shop.menus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(shop?.menus || []).map((menu) => (
              <div key={menu.id} className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="card-title">{menu.name}</h4>
                      {menu.description && (
                        <p className="text-sm text-base-content/70 mt-1">
                          {menu.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`badge ${menu.is_available ? "badge-success" : "badge-error"
                        } badge-sm`}
                    >
                      {menu.is_available ? "可用" : "停用"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm text-base-content/70">
                      {menu.categories?.length || 0} 個分類, {menu.items?.length || 0} 個項目
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {menu.categories?.map((category) => (
                        <span key={category.id} className="badge badge-outline badge-xs">
                          {category.name} ({category.items?.length || 0})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <Link
                      href={ROUTE_CONSTANTS.LUNCH_SHOP_MENU_DETAIL(shopId, menu.id)}
                      className="btn btn-primary btn-sm"
                    >
                      <FaEye className="w-3 h-3" />
                      管理
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUtensils className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h4 className="text-lg font-semibold mb-2">尚無菜單</h4>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
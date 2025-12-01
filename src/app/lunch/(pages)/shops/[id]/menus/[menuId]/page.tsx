"use client";
import Breadcrumb, { lunchBreadcrumbHomeItem } from "@/components/Breadcrumb";
import MenuItemTable from "@/components/menu/MenuItemTable";
import PageContainer from "@/components/page/PageContainer";
import { authFetch } from "@/libs/auth-fetch";
import { cn } from "@/libs/utils";
import { Menu } from "@/prisma-generated/postgres-client";
import { getLunchShopById } from "@/services/client/lunch/lunch-shop";
import { MenuWithArgs, ShopWithArgs } from "@/types/api/lunch";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaToggleOff,
  FaToggleOn,
  FaUtensils,
} from "react-icons/fa";

export const MENU_DEFAULT_ID = "default";

export default function MenuDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const menuId = params.menuId as string;
  const { data: session, status } = useSession();
  const authLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const [isPending, startTransition] = useTransition();
  const [shopData, setShopData] = useState<ShopWithArgs | undefined>(undefined);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const selectedMenu = useMemo(() => {
    if (!selectedMenuId) return null;

    const foundMenu =
      shopData?.menus?.find((m) => m.id === selectedMenuId) || null;
    return foundMenu;
  }, [selectedMenuId, shopData]);

  const getShop = useCallback(async () => {
    startTransition(async () => {
      try {
        const { response, result } = await getLunchShopById(shopId);
        if (!response.ok || result.success === false) {
          throw new Error(`Error fetching shop data: ${response.statusText}`);
        }

        const newShopData: ShopWithArgs = result.data?.shop as ShopWithArgs;
        setShopData(newShopData);

        let selectedMenu: MenuWithArgs | undefined = undefined;
        if (menuId === MENU_DEFAULT_ID) {
          selectedMenu = (newShopData?.menus || [])?.[0] || null;
        } else {
          selectedMenu = (newShopData?.menus || [])?.find(
            (m: MenuWithArgs) => m.id === menuId
          );
        }
        if (selectedMenu) {
          setMenu(selectedMenu);
          setSelectedMenuId(selectedMenu.id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.back();
      }
    });
  }, [router, shopId, menuId]);

  // 獲取菜單資料
  useEffect(() => {
    getShop();
  }, [getShop]);

  const toggleMenuStatus = useCallback(async () => {
    if (!menu) return;

    setUpdating(true);
    try {
      const response = await authFetch(
        `/api/lunch/shops/${shopId}/menus/${menuId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_available: !menu.is_available }),
        }
      );

      if (response.ok) {
        setMenu((prev) =>
          prev ? { ...prev, is_available: !prev.is_available } : null
        );
      }
    } catch (error) {
      console.error("Failed to update menu status:", error);
    } finally {
      setUpdating(false);
    }
  }, [shopId, menuId, menu]);

  // if (!shopData || !menu) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold mb-4">菜單不存在</h2>
  //         <p className="mb-4">找不到指定的菜單</p>
  //         <button onClick={() => router.back()} className="btn btn-primary">
  //           返回
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <PageContainer>
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          lunchBreadcrumbHomeItem,
          { label: "商店管理", href: "/lunch/shops" },
          { label: shopData?.name || "", href: `/lunch/shops/${shopId}` },
          { label: menu?.name || "", current: true },
        ]}
      />

      {/* 頁面標題 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <FaUtensils className="w-8 h-8 text-primary" />
              <span>{menu?.name || "預設菜單"}</span>
              <span
                className={cn(
                  'badge',
                  menu?.is_available ? "badge-success" : "badge-error"
                )}
              >
                {menu?.is_available ? "啟用中" : "已停用"}
              </span>
            </h1>
            <p className="text-base-content/70 mt-1">
              {shopData?.name || "餐廳"} - 菜單管理
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/lunch/shops/${shopId}/menus/${menuId}/edit`}
            className="btn btn-ghost"
          >
            <FaEdit className="w-4 h-4" />
            編輯菜單
          </Link>
          <button
            className={cn("btn", menu?.is_available ? "btn-error" : "btn-success")}
            onClick={toggleMenuStatus}
            disabled={updating}
          >
            {updating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : menu?.is_available ? (
              <>
                <FaToggleOff className="w-4 h-4" />
                停用
              </>
            ) : (
              <>
                <FaToggleOn className="w-4 h-4" />
                啟用
              </>
            )}
          </button>
        </div>
      </div>

      {/* 菜單描述 */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h3 className="card-title text-lg">菜單描述</h3>
          <p className="text-base-content/70">{menu?.description}</p>
        </div>
      </div>

      {/* 菜單管理區域 */}
      <div className="w-full">
        <div className="space-y-6">
          {/* 菜單選擇 */}
          {/* <div className="w-full">
            <h2 className="card-title text-xl mb-4">選擇菜單</h2>
            <div className="flex justify-between items-center gap-2">
              <Select
                label="選擇菜單"
                layoutOptions={{ className: "w-80" }}
                value={selectedMenuId}
                onChange={(value) => { setSelectedMenuId(value) }}
                options={(shopData?.menus || [])?.map(menu => ({
                  value: menu.id,
                  label: menu.name
                }))}
              />
              <Link
                href={`/lunch/shops/${shopId}/menus/new`}
                className="btn btn-primary btn-sm"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                建立菜單
              </Link>
            </div>
          </div> */}

          {/* {(!shopData?.menus || shopData.menus.length === 0) && (
            <div className="text-center py-4">
              <p className="text-base-content/70">
                此商店尚未建立菜單，請先建立菜單。
              </p>
            </div>
          )} */}

          <div className="grid grid-cols-1 gap-6">
            {/* 分類管理 */}
            {/* <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <MenuCategoryManager
                    menuId={selectedMenuId}
                    categories={selectedMenu?.categories || []}
                    onCategoriesChange={(newCategories) => {
                      // 應該是要去更新前端的 categories 狀態
                    }}
                  />
                </div>
              </div> */}

            {/* 項目管理 */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                {/* <MenuItemManager
                    menuId={selectedMenuId}
                    items={selectedMenu?.items || []}
                    categories={selectedMenu?.categories || []}
                    onItemsChange={(newItems) => {
                      // 應該是要去更新前端的 items 狀態
                    }}
                  /> */}
                <MenuItemTable
                  shopId={shopId}
                  menuId={selectedMenuId}
                  loading={isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

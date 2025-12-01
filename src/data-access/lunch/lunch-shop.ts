import { FormValues } from "@/components/form";
import { BatchCreateMenuItemSheetData } from "@/components/menu/BatchImportMenuModal";
import { authFetch } from "@/libs/auth-fetch";
import { ShopFilters } from "@/services/lunch";
import { DeleteShopMenuItemResponse, GetShopResponse, GetShopsResponse, PostBatchShopMenuItemsResponse, PostShopResponse } from "@/types/api/lunch";

const shopsPath = '/api/lunch/shops';
const menuPath = '/api/lunch/menus';

// #region Shops

export async function getLunchShops(filters: ShopFilters = {}) {
     const query = new URLSearchParams();
     if (filters.isActive !== undefined) {
          query.append('is_active', String(filters.isActive));
     }
     const response = await authFetch(`${shopsPath}?${query.toString()}`);
     const result: GetShopsResponse = await response.json();
     return { response, result };
}

export async function createLunchShop(values: FormValues) {
     const response = await authFetch(shopsPath, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
     });

     const result: PostShopResponse = await response.json();
     return { response, result };
}

export async function updateLunchShop(shopId: string, values: FormValues) {
     const response = await authFetch(`${shopsPath}/${shopId}`, {
          method: 'PATCH',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
     });
     const result: PostShopResponse = await response.json();
     return { response, result };
}

export async function getLunchShopById(shopId: string) {
     const response = await authFetch(`${shopsPath}/${shopId}`);
     const result: GetShopResponse = await response.json();
     return { response, result };
}

// #endregion

// #region Menus

export async function getLunchShopMenus(shopId: string) {
     const response = await authFetch(`${shopsPath}/${shopId}/menus`);
     const result = await response.json();
     return { response, result };
}

// #endregion

// #region Menu Items

export async function getLunchShopMenuItems(menuId: string) {
     const response = await authFetch(`${menuPath}/${menuId}/items`);
     const result = await response.json();
     return { response, result };
}

export async function createLunchShopMenuItem(shopId: string, menuId: string, values: FormValues) {
     const response = await authFetch(`${shopsPath}/${shopId}/menus/${menuId}/items`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
     });

     const result = await response.json();
     return { response, result };
}

export async function batchCreateLunchShopMenuItems(shopId: string, menuId: string, values: BatchCreateMenuItemSheetData[]) {
     const response = await authFetch(`${shopsPath}/${shopId}/menus/${menuId}/items/batch`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
     });

     const result: PostBatchShopMenuItemsResponse = await response.json();
     return { response, result };
}

export async function updateLunchShopMenuItem(menuId: string, itemId: string, values: FormValues) {
     const response = await authFetch(`${menuPath}/${menuId}/items/${itemId}`, {
          method: 'PATCH',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
     });

     const result = await response.json();
     return { response, result };
}

export async function deleteLunchShopMenuItem(shopId: string, menuId: string, itemId: string) {
     const response = await authFetch(`${shopsPath}/${shopId}/menus/${menuId}/items/${itemId}`, {
          method: 'DELETE',
     });
     const result: DeleteShopMenuItemResponse = await response.json();
     return { response, result };
}

// #endregion
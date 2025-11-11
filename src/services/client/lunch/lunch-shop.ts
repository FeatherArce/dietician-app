import { FormValues } from "@/components/form2";
import { authFetch } from "@/libs/auth-fetch";
import { LunchEvent } from "@/prisma-generated/postgres-client";


const shopsPath = '/api/lunch/shops';
const menuPath = '/api/lunch/menus';

export async function getLunchShops() {
     const response = await authFetch(shopsPath);
     const result = await response.json();
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

     const result = await response.json();
     return { response, result };
}

export async function getLunchShopById(shopId: string) {
     const response = await authFetch(`${shopsPath}/${shopId}`);
     const result = await response.json();
     return { response, result };
}

export async function getLunchShopMenus(shopId: string) {
     const response = await authFetch(`${shopsPath}/${shopId}/menus`);
     const result = await response.json();
     return { response, result };
}

export async function getLunchShopMenuItems(menuId: string) {
     const response = await authFetch(`${menuPath}/${menuId}/items`);
     const result = await response.json();
     return { response, result };
}

export async function createLunchShopMenuItem(menuId: string, values: FormValues) {
     const response = await authFetch(`${menuPath}/${menuId}/items`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
     });

     const result = await response.json();
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

export async function deleteLunchShopMenuItem(menuId: string, itemId: string) {
     const response = await authFetch(`${menuPath}/${menuId}/items/${itemId}`, {
          method: 'DELETE',
     });
     const result = await response.json();
     return { response, result };
}
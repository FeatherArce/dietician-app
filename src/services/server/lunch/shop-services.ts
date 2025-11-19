import { Prisma } from "@/prisma-generated/postgres-client";
import prisma from "@/services/prisma";

// Shop Service 類型定義
export type CreateShopData = {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active?: boolean;
};

export type UpdateShopData = Partial<CreateShopData>;

export interface ShopFilters {
  isActive?: boolean;
  searchName?: string;
}

// Menu Service 類型定義
export type CreateMenuData = {
  name: string;
  description?: string;
  shop_id: string;
  is_available?: boolean;
  is_default?: boolean;
};

export type UpdateMenuData = Partial<Omit<CreateMenuData, "shop_id">>;

// MenuCategory Service 類型定義
export type CreateMenuCategoryData = {
  name: string;
  description?: string;
  menu_id: string;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateMenuCategoryData = Partial<
  Omit<CreateMenuCategoryData, "menu_id">
>;

// MenuItem Service 類型定義
export type CreateMenuItemData = {
  name: string;
  description?: string;
  price: number;
  menu_id: string;
  category_id?: string;
  is_available?: boolean;
  sort_order?: number;
  image_url?: string;
};

export type UpdateMenuItemData = Partial<Omit<CreateMenuItemData, "menu_id">>;

// Shop Service
export const shopService = {
  // 獲取商店列表
  async getShops(filters: ShopFilters = {}) {
    try {
      const where: Prisma.ShopWhereInput = {};

      if (filters.isActive !== undefined) {
        where.is_active = filters.isActive;
      }

      if (filters.searchName) {
        where.name = {
          contains: filters.searchName,
        };
      }

      const shops = await prisma.shop.findMany({
        where,
        include: {
          menus: true,
          _count: {
            select: {
              menus: true,
              events: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return shops;
    } catch (error) {
      console.error("Error fetching shops:", error);
      throw new Error("Failed to fetch shops");
    }
  },

  // 獲取單一商店（包含菜單）
  async getShopById(id: string) {
    try {
      const shop = await prisma.shop.findUnique({
        where: { id },
        include: {
          menus: {
            where: { is_available: true },
            include: {
              categories: {
                where: { is_active: true },
                include: {
                  items: {
                    where: { is_available: true },
                    orderBy: { sort_order: "asc" },
                  },
                },
                orderBy: { sort_order: "asc" },
              },
              items: {
                where: {
                  is_available: true,
                  category_id: null, // 沒有分類的項目
                },
                orderBy: { sort_order: "asc" },
              },
              _count: {
                select: { items: true },
              },
            },
            orderBy: [{ is_default: "desc" }, { name: "asc" }],
          },
          _count: {
            select: {
              menus: true,
              events: true,
            },
          },
        },
      });
      return shop;
    } catch (error) {
      console.error("Error fetching shop:", error);
      throw new Error("Failed to fetch shop");
    }
  },

  // 新增商店
  async createShop(data: CreateShopData) {
    try {
      const shop = await prisma.shop.create({
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          is_active: data.is_active ?? true,
        },
      });
      return shop;
    } catch (error) {
      console.error("Error creating shop:", error);
      throw new Error("Failed to create shop");
    }
  },

  // 更新商店
  async updateShop(id: string, data: UpdateShopData) {
    try {
      const shop = await prisma.shop.update({
        where: { id },
        data,
      });
      return shop;
    } catch (error) {
      console.error("Error updating shop:", error);
      throw new Error("Failed to update shop");
    }
  },

  // 刪除商店
  async deleteShop(id: string) {
    try {
      // 檢查是否有關聯的事件
      const eventCount = await prisma.lunchEvent.count({
        where: { shop_id: id },
      });

      if (eventCount > 0) {
        throw new Error("無法刪除有關聯事件的商店");
      }

      const shop = await prisma.shop.delete({
        where: { id },
      });
      return shop;
    } catch (error) {
      console.error("Error deleting shop:", error);
      throw error instanceof Error ? error : new Error("Failed to delete shop");
    }
  },
};

// Menu Service
export const menuService = {
  // 獲取菜單列表
  async getMenus(shopId?: string) {
    try {
      const where: Prisma.MenuWhereInput = {};

      if (shopId) {
        where.shop_id = shopId;
      }

      const menus = await prisma.menu.findMany({
        where,
        include: {
          shop: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              categories: true,
              items: true,
            },
          },
        },
        orderBy: [{ is_default: "desc" }, { name: "asc" }],
      });

      return menus;
    } catch (error) {
      console.error("Error fetching menus:", error);
      throw new Error("Failed to fetch menus");
    }
  },

  // 獲取單一菜單（包含分類和項目）
  async getMenuById(id: string) {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: {
          shop: {
            select: { id: true, name: true },
          },
          categories: {
            where: { is_active: true },
            include: {
              items: {
                where: { is_available: true },
                orderBy: { sort_order: "asc" },
              },
            },
            orderBy: { sort_order: "asc" },
          },
          items: {
            where: {
              is_available: true,
              category_id: null, // 沒有分類的項目
            },
            orderBy: { sort_order: "asc" },
          },
        },
      });
      return menu;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw new Error("Failed to fetch menu");
    }
  },

  // 新增菜單
  async createMenu(data: CreateMenuData) {
    try {
      // 如果設為預設菜單，需要先將同商店其他菜單的 is_default 設為 false
      if (data.is_default) {
        await prisma.menu.updateMany({
          where: { shop_id: data.shop_id },
          data: { is_default: false },
        });
      }

      const menu = await prisma.menu.create({
        data: {
          name: data.name,
          description: data.description,
          shop_id: data.shop_id,
          is_available: data.is_available ?? true,
          is_default: data.is_default ?? false,
        },
        include: {
          shop: {
            select: { id: true, name: true },
          },
        },
      });
      return menu;
    } catch (error) {
      console.error("Error creating menu:", error);
      throw new Error("Failed to create menu");
    }
  },

  // 更新菜單
  async updateMenu(id: string, data: UpdateMenuData) {
    try {
      // 如果設為預設菜單，需要先將同商店其他菜單的 is_default 設為 false
      if (data.is_default) {
        const menu = await prisma.menu.findUnique({
          where: { id },
          select: { shop_id: true },
        });

        if (menu) {
          await prisma.menu.updateMany({
            where: {
              shop_id: menu.shop_id,
              id: { not: id },
            },
            data: { is_default: false },
          });
        }
      }

      const updatedMenu = await prisma.menu.update({
        where: { id },
        data,
        include: {
          shop: {
            select: { id: true, name: true },
          },
        },
      });
      return updatedMenu;
    } catch (error) {
      console.error("Error updating menu:", error);
      throw new Error("Failed to update menu");
    }
  },

  // 刪除菜單
  async deleteMenu(id: string) {
    try {
      const menu = await prisma.menu.delete({
        where: { id },
      });
      return menu;
    } catch (error) {
      console.error("Error deleting menu:", error);
      throw new Error("Failed to delete menu");
    }
  },

  // 根據商店ID刪除所有菜單
  async deleteMenusByShopId(shopId: string) {
    try {
      const menuItems = await menuItemService.deleteItemsByShopId(shopId);
      const categories = await menuCategoryService.deleteCategoriesByShopId(
        shopId
      );
      const menu = await prisma.menu.deleteMany({
        where: { shop_id: shopId },
      });
      return {
        menu,
        categories,
        menuItems,
      };
    } catch (error) {
      console.error("Error deleting menus by shop ID:", error);
      throw new Error("Failed to delete menus by shop ID");
    }
  },
};

// MenuCategory Service
export const menuCategoryService = {
  // 獲取分類列表
  async getCategories(menuId: string) {
    try {
      const categories = await prisma.menuCategory.findMany({
        where: { menu_id: menuId },
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { sort_order: "asc" },
      });
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  },

  // 新增分類
  async createCategory(data: CreateMenuCategoryData) {
    try {
      const category = await prisma.menuCategory.create({
        data: {
          name: data.name,
          description: data.description,
          menu_id: data.menu_id,
          sort_order: data.sort_order ?? 0,
          is_active: data.is_active ?? true,
        },
      });
      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  },

  // 更新分類
  async updateCategory(id: string, data: UpdateMenuCategoryData) {
    try {
      const category = await prisma.menuCategory.update({
        where: { id },
        data,
      });
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  },

  // 刪除分類
  async deleteCategory(id: string) {
    try {
      // 檢查是否有項目
      const itemCount = await prisma.menuItem.count({
        where: { category_id: id },
      });

      if (itemCount > 0) {
        // 將項目移到無分類
        await prisma.menuItem.updateMany({
          where: { category_id: id },
          data: { category_id: null },
        });
      }

      const category = await prisma.menuCategory.delete({
        where: { id },
      });
      return category;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error("Failed to delete category");
    }
  },

  // 根據菜單ID刪除所有分類
  async deleteCategoriesByMenuId(menuId: string) {
    try {
      const category = await prisma.menuCategory.deleteMany({
        where: { menu_id: menuId },
      });
      return category;
    } catch (error) {
      console.error("Error deleting categories by menu ID:", error);
      throw new Error("Failed to delete categories by menu ID");
    }
  },

  // 根據商店ID刪除所有分類
  async deleteCategoriesByShopId(shopId: string) {
    try {
      const categories = await prisma.menuCategory.deleteMany({
        where: {
          menu: {
            shop_id: shopId,
          },
        },
      });
      return categories;
    } catch (error) {
      console.error("Error deleting categories by shop ID:", error);
      throw new Error("Failed to delete categories by shop ID");
    }
  },
};

// MenuItem Service
export const menuItemService = {
  // 獲取項目列表
  async getItems(menuId: string, categoryId?: string) {
    try {
      const where: Prisma.MenuItemWhereInput = {
        menu_id: menuId,
      };

      if (categoryId !== undefined) {
        where.category_id = categoryId;
      }

      const items = await prisma.menuItem.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { sort_order: "asc" },
      });
      return items;
    } catch (error) {
      console.error("Error fetching items:", error);
      throw new Error("Failed to fetch items");
    }
  },

  // 新增項目
  async createItem(data: CreateMenuItemData) {
    try {
      const item = await prisma.menuItem.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          menu_id: data.menu_id,
          category_id: data.category_id,
          is_available: data.is_available ?? true,
          sort_order: data.sort_order ?? 0,
          image_url: data.image_url,
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });
      return item;
    } catch (error) {
      console.error("Error creating item:", error);
      throw new Error("Failed to create item");
    }
  },

  // 更新項目
  async updateItem(id: string, data: UpdateMenuItemData) {
    try {
      const item = await prisma.menuItem.update({
        where: { id },
        data,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });
      return item;
    } catch (error) {
      console.error("Error updating item:", error);
      throw new Error("Failed to update item");
    }
  },

  // 刪除項目
  async deleteItem(id: string) {
    try {
      const item = await prisma.menuItem.delete({
        where: { id },
      });
      return item;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw new Error("Failed to delete item");
    }
  },

  // 根據分類ID刪除所有項目
  async deleteItemsByCategoryId(categoryId: string) {
    try {
      const items = await prisma.menuItem.deleteMany({
        where: { category_id: categoryId },
      });
      return items;
    } catch (error) {
      console.error("Error deleting items by category ID:", error);
      throw new Error("Failed to delete items by category ID");
    }
  },

  // 根據菜單ID刪除所有項目
  async deleteItemsByMenuId(menuId: string) {
    try {
      const items = await prisma.menuItem.deleteMany({
        where: { menu_id: menuId },
      });
      return items;
    } catch (error) {
      console.error("Error deleting items by menu ID:", error);
      throw new Error("Failed to delete items by menu ID");
    }
  },

  // 根據商店ID刪除所有項目
  async deleteItemsByShopId(shopId: string) {
    try {
      const items = await prisma.menuItem.deleteMany({
        where: {
          menu: {
            shop_id: shopId,
          },
        },
      });
      return items;
    } catch (error) {
      console.error("Error deleting items by shop ID:", error);
      throw new Error("Failed to delete items by shop ID");
    }
  },
};

export { shopService as default };

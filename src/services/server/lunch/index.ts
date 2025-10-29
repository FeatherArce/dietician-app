// 統一導出所有 Lunch 相關的 Services

// Event Services
export * from './lunch-event-services';
export { lunchEventService } from './lunch-event-services';

// Order Services  
export * from './order-services';
export { orderService } from './order-services';

// Shop & Menu Services
export * from './shop-services';
export { 
    shopService, 
    menuService, 
    menuCategoryService, 
    menuItemService 
} from './shop-services';

// User Services
export * from '../user-services';
export { userService } from '../user-services';

// 便利的組合導出
export const lunchServices = {
    event: () => import('./lunch-event-services').then(m => m.lunchEventService),
    order: () => import('./order-services').then(m => m.orderService),
    shop: () => import('./shop-services').then(m => m.shopService),
    menu: () => import('./shop-services').then(m => m.menuService),
    menuCategory: () => import('./shop-services').then(m => m.menuCategoryService),
    menuItem: () => import('./shop-services').then(m => m.menuItemService),
    user: () => import('../user-services').then(m => m.userService),
} as const;
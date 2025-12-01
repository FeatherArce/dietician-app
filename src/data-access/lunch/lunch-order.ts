import { authFetch } from "@/libs/auth-fetch";
import { DeleteOrderResponse } from "@/types/api/lunch";

const ordersPath = '/api/lunch/orders';
export async function deleteOrder(orderId: string) {
     const response = await authFetch(`${ordersPath}/${orderId}`, {
          method: 'DELETE',
     });
     const result: DeleteOrderResponse = await response.json();
     return { response, result };
}

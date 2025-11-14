import { GetUserAccountsResponse } from "@/types/api/user";

export async function getAccountsByUserId(userId: string) {
  const response = await fetch(`/api/users/${userId}/accounts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result: GetUserAccountsResponse = await response.json();
  return { response, result };
}
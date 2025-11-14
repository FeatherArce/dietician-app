import { Account } from "@/prisma-generated/postgres-client";
import { ApiResponse } from "./api";

export type GetUserAccountsResponse = ApiResponse<{ accounts: Account[] }>;
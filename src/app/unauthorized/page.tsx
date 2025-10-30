import { ROUTE_CONSTANTS } from "@/constants/app-constants";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="card-title text-2xl mb-4">存取被拒絕</h2>
          <p className="mb-6">
            抱歉，您沒有權限存取此頁面。
            <br />
            請聯絡管理員或使用有權限的帳號登入。
          </p>
          <div className="card-actions justify-center">
            <Link href="/" className="btn btn-primary">
              回到首頁
            </Link>
            <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-outline">
              重新登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
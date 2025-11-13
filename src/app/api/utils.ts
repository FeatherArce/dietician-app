import { NextRequest, NextResponse } from "next/server";

export const API_ERROR_MESSAGES: { [key: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
};

export class ApiMessage {
    static success(data: any, status: number = 200) {
        return NextResponse.json({ data, success: true }, { status });
    }

    static error(status: number, message?: string) {
        const errorMessage = message || API_ERROR_MESSAGES[status] || 'Unknown Error';
        return NextResponse.json({ error: errorMessage, success: false }, { status });
    }
}
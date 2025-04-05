import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { getSession, getCsrfToken } from "next-auth/react";

export class AxiosService {
  private axiosInstance;

  constructor(baseURL: string, isAuth: boolean) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (isAuth) {
      // Request interceptor to include token from NextAuth session
      this.axiosInstance.interceptors.request.use(
        async (config: AxiosRequestConfig) => {
          const session = await getSession(); // Retrieve session info from NextAuth

          // Check if session exists, then add the token to the headers
          if (session?.user) {
            console.log("Session:", session, "there is a session");
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${session.sessionToken}`,
            };
          }

          // Add CSRF token if needed
          const csrfToken = await getCsrfToken();
          if (csrfToken) {
            config.headers = {
              ...config.headers,
              "X-CSRF-Token": csrfToken,
            };
          }

          return config;
        },
        error => {
          return Promise.reject(error);
        }
      );
    }
  }

  public async get<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  public async delete<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }
}

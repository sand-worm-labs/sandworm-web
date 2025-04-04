import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { getCsrfToken } from "next-auth/react"; // Example DELETE request

class AuthAxiosService {
  private axiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    //     // Request interceptor to include token from NextAuth session
    //     this.axiosInstance.interceptors.request.use(
    //       async (config: AxiosRequestConfig) => {
    //         const session = await getSession(); // Retrieve session info from NextAuth

    //         // Check if session and token exist, then add to the headers
    //         if (session) {
    //           config.headers.Authorization = `Bearer ${session.}`;
    //         }

    //         return config; // Return the modified config to continue the request
    //       },
    //       error => {
    //         return Promise.reject(error); // Handle any errors in the request
    //       }
    //     );
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

export default AuthAxiosService;

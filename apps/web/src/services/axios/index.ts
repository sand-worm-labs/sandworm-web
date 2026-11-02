import type { AxiosRequestConfig } from "axios";
import axios from "axios";

export class AxiosService {
  private axiosInstance;

  constructor(baseURL: string, isAuth: boolean) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // The API authenticates with httpOnly session cookies, so authed calls
    // only need the browser to send them.
    if (isAuth) {
      this.axiosInstance.defaults.withCredentials = true;
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

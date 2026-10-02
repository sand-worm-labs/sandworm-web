import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AllConfigType } from '@/config/config.type';
import { Tool } from './tool.model';
import { ToolService } from './tool.service';

const MAX_RESULTS = 15;

@Injectable()
export class ToolSearchService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly httpService: HttpService,
    private readonly toolService: ToolService,
  ) {}

  async search(query: string, limit: number): Promise<Tool[]> {
    const { url, handshakeToken } = this.configService.getOrThrow('ai', { infer: true });
    const topK = Math.min(Math.max(limit, 1), MAX_RESULTS);

    const { data } = await firstValueFrom(
      this.httpService.post<{ tool_id: string }[]>(
        `${url}/select-tool/search`,
        { query, top_k: topK },
        { headers: { 'Content-Type': 'application/json', 'x-handshake-token': handshakeToken } },
      ),
    );

    const ranked = data.map(hit => hit.tool_id);
    const byId = new Map((await this.toolService.getToolsByIds(ranked)).map(tool => [tool.toolId, tool]));
    return ranked.flatMap(id => byId.get(id) ?? []);
  }
}

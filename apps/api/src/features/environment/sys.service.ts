import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PythonExecutorService } from '@/features/code-execution/python-executor.service';
import { Output } from '@sandworm/types';


const CACHE_TTL_MS = 1000 * 60 * 10; 

const SYSINFO_CODE = `
import platform, psutil, socket, subprocess, sys, time, importlib.metadata, json

def bytes_to_gb(b):
    return round(b / (1024 ** 3), 2)

def bytes_to_mb(b):
    return round(b / (1024 ** 2), 2)

try:
    pip_ver = subprocess.check_output(
        [sys.executable, "-m", "pip", "--version"],
        stderr=subprocess.DEVNULL
    ).decode().split()[1]
except:
    pip_ver = "N/A"

vm    = psutil.virtual_memory()
freq  = psutil.cpu_freq()
usage = psutil.cpu_percent(interval=1)

try:
    import GPUtil
    gpus = GPUtil.getGPUs()
    gpu_info = [{"id": g.id, "name": g.name, "vram_total_mb": g.memoryTotal, "vram_used_mb": g.memoryUsed, "load_pct": round(g.load * 100, 1), "temp_c": g.temperature} for g in gpus] if gpus else {"available": False}
except:
    gpu_info = {"available": False}

net1 = psutil.net_io_counters()
time.sleep(1)
net2 = psutil.net_io_counters()

interfaces = [
    {"name": iface, "speed_mbps": stats.speed if stats.speed > 0 else None}
    for iface, stats in psutil.net_if_stats().items()
    if stats.isup
]

packages = sorted(importlib.metadata.distributions(), key=lambda d: d.metadata["Name"].lower())
libs = "\\n".join(f"{d.metadata['Name']}=={d.metadata['Version']}" for d in packages)

print(json.dumps({
    "__sysinfo__": {
        "python": {"version": platform.python_version(), "pip_version": pip_ver},
        "compute": {
            "memory_total_gb":  bytes_to_gb(vm.total),
            "memory_used_gb":   bytes_to_gb(vm.used),
            "memory_used_pct":  vm.percent,
            "cpu_cores":        psutil.cpu_count(logical=False),
            "cpu_threads":      psutil.cpu_count(logical=True),
            "cpu_usage_pct":    usage,
            "freq_current_mhz": round(freq.current, 2) if freq else None,
            "gpu":              gpu_info,
            "network_max":      "5 Gigabit",
            "interfaces":       interfaces,
            "tx_mbps_1s":       bytes_to_mb(net2.bytes_sent - net1.bytes_sent),
            "rx_mbps_1s":       bytes_to_mb(net2.bytes_recv - net1.bytes_recv),
        },
        "libraries": libs,
    }
}))
`;


interface CacheEntry {
    data: Record<string, any>;
    collectedAt: Date;
    expiresAt: Date;
}


@Injectable()
export class SysinfoService {
    private readonly logger = new Logger(SysinfoService.name);
    private cache = new Map<string, CacheEntry>();
    private inflight = new Map<string, Promise<Record<string, any>>>();

    constructor(
        private readonly pythonExecutor: PythonExecutorService,
    ) {}


    private parseOutputs(outputs: Output[], key: string): Record<string, any> | null {
        let result: Record<string, any> | null = null;

        for (const output of outputs) {
            if (output.type === 'stdio' && output.name === 'stdout') {
                for (const line of output.text.split('\n')) {
                    try {
                        const parsed = JSON.parse(line.trim());
                        if (parsed[key]) result = parsed[key];
                    } catch (_) {}
                }
            }
            if (output.type === 'error') {
                this.logger.error(`${output.ename}: ${output.evalue}`);
            }
        }

        return result;
    }

    private isCacheValid(entry: CacheEntry): boolean {
        return entry.expiresAt > new Date();
    }

    private cacheKey(context: { workspaceId: string; sessionId: string }): string {
        return `${context.workspaceId}:${context.sessionId}`;
    }


    private async run(context: { workspaceId: string; sessionId: string }): Promise<Record<string, any>> {
        let result: Record<string, any> | null = null;

        const { promise } = await this.pythonExecutor.executeCode(
            context,
            SYSINFO_CODE,
            (outputs) => {
                const parsed = this.parseOutputs(outputs, '__sysinfo__');
                if (parsed) result = parsed;
            },
            { storeHistory: false },
        );

        await promise;

        if (!result) throw new Error('Sysinfo produced no output');

        const entry: CacheEntry = {
            data: result,
            collectedAt: new Date(),
            expiresAt: new Date(Date.now() + CACHE_TTL_MS),
        };

        this.cache.set(this.cacheKey(context), entry);
        return result;
    }


    async collect(context: { workspaceId: string; sessionId: string }): Promise<Record<string, any>> {
        const key = this.cacheKey(context);

        // ─── RETURN CACHED IF VALID ───
        const cached = this.cache.get(key);
        if (cached && this.isCacheValid(cached)) {
            this.logger.debug(`Sysinfo cache hit for ${key}, expires ${cached.expiresAt.toISOString()}`);
            return cached.data;
        }

        // ─── DEDUPE CONCURRENT REQUESTS ───
        // if two requests come in at the same time, only run once
        const existing = this.inflight.get(key);
        if (existing) {
            this.logger.debug(`Sysinfo inflight hit for ${key}`);
            return existing;
        }

        const promise = this.run(context).finally(() => {
            this.inflight.delete(key);
        });

        this.inflight.set(key, promise);
        return promise;
    }

    async refresh(context: { workspaceId: string; sessionId: string }): Promise<Record<string, any>> {
        this.cache.delete(this.cacheKey(context));
        return this.collect(context);
    }

    getCacheStatus(context: { workspaceId: string; sessionId: string }): { cached: boolean; collectedAt?: Date; expiresAt?: Date } {
        const entry = this.cache.get(this.cacheKey(context));
        if (!entry || !this.isCacheValid(entry)) return { cached: false };
        return { cached: true, collectedAt: entry.collectedAt, expiresAt: entry.expiresAt };
    }
}
const api = process.env.BAZZATO_API_URL ?? "http://localhost:4000";
const users = Number(process.env.BAZZATO_LOAD_USERS ?? 100);
const durationSeconds = Number(process.env.BAZZATO_LOAD_SECONDS ?? 30);
const latitude = Number(process.env.BAZZATO_LOAD_LATITUDE ?? 24.7135517);
const longitude = Number(process.env.BAZZATO_LOAD_LONGITUDE ?? 46.6752957);
const thinkTimeMs = Number(process.env.BAZZATO_LOAD_THINK_MS ?? 5000);

const startedAt = Date.now();
const endsAt = startedAt + durationSeconds * 1000;
const latencies = [];
const counters = {
  failed: 0,
  passed: 0
};

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);

  return sorted[index];
}

async function getJson(path) {
  const requestStartedAt = Date.now();
  const response = await fetch(`${api}${path}`);
  const elapsed = Date.now() - requestStartedAt;
  latencies.push(elapsed);

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return response.json();
}

async function virtualUser(index) {
  while (Date.now() < endsAt) {
    try {
      const shops = await getJson(
        `/catalog/shops?latitude=${latitude}&longitude=${longitude}&limit=20`
      );
      const firstShop = shops.shops?.[index % Math.max(shops.shops.length, 1)];

      if (firstShop?.id) {
        await getJson(`/catalog/shops/${encodeURIComponent(firstShop.id)}/products`);
      }

      counters.passed += 1;
    } catch (error) {
      counters.failed += 1;
    }

    await new Promise((resolve) => setTimeout(resolve, thinkTimeMs + (index % 5) * 100));
  }
}

await Promise.all(Array.from({ length: users }, (_, index) => virtualUser(index)));

const elapsedSeconds = (Date.now() - startedAt) / 1000;
const total = counters.passed + counters.failed;

console.log(
  JSON.stringify(
    {
      api,
      durationSeconds: Math.round(elapsedSeconds),
      errors: counters.failed,
      p50Ms: percentile(latencies, 50),
      p95Ms: percentile(latencies, 95),
      p99Ms: percentile(latencies, 99),
      requests: total,
      requestsPerSecond: Number((total / elapsedSeconds).toFixed(2)),
      thinkTimeMs,
      users
    },
    null,
    2
  )
);

if (counters.failed > 0) {
  process.exitCode = 1;
}

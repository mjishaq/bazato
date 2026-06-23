import WebSocket from "ws";

const api = process.env.BAZZATO_API_URL ?? "http://localhost:4000";
const adminPhone = process.env.BAZZATO_ADMIN_PHONE ?? "966500000000";
const customerPhone = process.env.BAZZATO_CUSTOMER_PHONE ?? "9876543210";
const vendorPhone = process.env.BAZZATO_VENDOR_PHONE ?? "966511112222";
const headers = { "Content-Type": "application/json" };

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function getMockCustomerToken() {
  const requested = await requestJson(`${api}/auth/request-otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone: customerPhone })
  });
  const verified = await requestJson(`${api}/auth/verify-otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      phone: customerPhone,
      otp: requested.otp ?? "1234"
    })
  });

  return verified.token;
}

async function requestVendorOtp(ownerPhone) {
  const requested = await requestJson(`${api}/vendor/request-otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ownerPhone })
  });

  return requested.otp ?? "1234";
}

async function requestAdminOtp(phone) {
  const requested = await requestJson(`${api}/vendor/admin/request-otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone })
  });

  return requested.otp ?? "1234";
}

async function waitForRealtimeStatus({ orderId, status, token, vendorToken }) {
  const wsUrl = `${api.replace(/^http/, "ws")}/orders/${encodeURIComponent(
    orderId
  )}/live?token=${encodeURIComponent(token)}`;
  const received = [];
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`Timed out waiting for realtime ${status}`)),
      10000
    );

    ws.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      received.push(message.order.status);

      if (message.order.status === status) {
        clearTimeout(timeout);
        ws.close();
        resolve();
      }
    });

    ws.on("open", () => {
      setTimeout(async () => {
        try {
          await requestJson(`${api}/vendor/orders/${orderId}/status`, {
            method: "PATCH",
            headers: {
              ...headers,
              Authorization: `Bearer ${vendorToken}`
            },
            body: JSON.stringify({ status })
          });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });

    ws.on("error", reject);
  });

  return received;
}

async function main() {
  const health = await requestJson(`${api}/health`);
  const customerToken = await getMockCustomerToken();
  const adminOtp = await requestAdminOtp(adminPhone);
  const vendorOtp = await requestVendorOtp(vendorPhone);

  const adminLogin = await requestJson(`${api}/vendor/admin/login`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone: adminPhone, otp: adminOtp })
  });
  const adminSummary = await requestJson(`${api}/vendor/admin/summary`, {
    headers: { Authorization: `Bearer ${adminLogin.token}` }
  });

  const vendorLogin = await requestJson(`${api}/vendor/login`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ownerPhone: vendorPhone, otp: vendorOtp })
  });
  const productPayload = {
    id: "holistic-smoke-orange",
    name: "Holistic Smoke Orange",
    category: "Fruits",
    unit: "1 piece",
    price: 35,
    mrp: 50,
    imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300&q=80",
    tag: "Smoke test",
    inStock: true
  };
  const saved = await requestJson(
    `${api}/vendor/shops/${vendorLogin.shop.id}/products`,
    {
      method: "PUT",
      headers: {
        ...headers,
        Authorization: `Bearer ${vendorLogin.token}`
      },
      body: JSON.stringify(productPayload)
    }
  );
  const catalog = await requestJson(`${api}/catalog/shops/${vendorLogin.shop.id}/products`);
  const catalogProduct = catalog.products.find((product) => product.id === productPayload.id);

  if (catalogProduct?.imageUrl !== saved.product.imageUrl) {
    throw new Error("Catalog did not return the saved product image URL");
  }

  const created = await requestJson(`${api}/orders`, {
    method: "POST",
    headers: {
      ...headers,
      Authorization: `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      phone: customerPhone,
      shopId: vendorLogin.shop.id,
      deliveryAddress: "Holistic Smoke Test Street",
      items: [{ productId: productPayload.id, quantity: 1 }]
    })
  });
  const realtimeStatuses = await waitForRealtimeStatus({
    orderId: created.order.id,
    status: "completed",
    token: customerToken,
    vendorToken: vendorLogin.token
  });
  const fetchedOrder = await requestJson(`${api}/orders/${created.order.id}`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });

  console.log(
    JSON.stringify(
      {
        admin: {
          activeOrders: adminSummary.totals.activeOrders,
          products: adminSummary.totals.products,
          shops: adminSummary.totals.shops,
          totalOrders: adminSummary.totals.totalOrders
        },
        health,
        auth: {
          mode: "mock-otp",
          ordersAccepted: Array.isArray(
            (await requestJson(`${api}/orders`, {
              headers: { Authorization: `Bearer ${customerToken}` }
            })).orders
          )
        },
        order: {
          id: created.order.id,
          shopName: fetchedOrder.order.shopName,
          status: fetchedOrder.order.status
        },
        product: {
          catalogImageUrl: catalogProduct.imageUrl,
          id: catalogProduct.id,
          savedImageUrl: saved.product.imageUrl
        },
        realtimeStatuses
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

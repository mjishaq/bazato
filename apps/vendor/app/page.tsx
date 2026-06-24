"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type Product = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  mrp: number;
  imageUrl?: string;
  tag: string;
  inStock: boolean;
};

type Order = {
  id: string;
  phone: string;
  status: string;
  total: number;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
};

type Shop = {
  id: string;
  name: string;
  category: string;
  isOpen: boolean;
  rating: number;
};

type Summary = {
  metrics: {
    activeOrders: number;
    completedOrders: number;
    inStockProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  orders: Order[];
  products: Product[];
  shop: Shop;
};

type AdminSummary = {
  totals: {
    activeOrders: number;
    completedOrders: number;
    products: number;
    revenue: number;
    shops: number;
    totalOrders: number;
  };
  shops: Array<Shop & {
    activeOrders: number;
    completedOrders: number;
    productCount: number;
    totalOrders: number;
    totalRevenue: number;
  }>;
};

type VendorSession = {
  accessToken?: string;
  refreshToken?: string;
  shop: Shop;
  token: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const orderStatuses = ["accepted", "preparing", "ready", "completed", "rejected"];
const productUnits = [
  "1 kg",
  "500 g",
  "400 g",
  "400 g cup",
  "400 g loaf",
  "250 g",
  "100 g",
  "90 g",
  "1 liter",
  "500 ml",
  "500 ml pouch",
  "250 ml",
  "1 piece",
  "6 pieces",
  "12 pieces",
  "1 pack",
  "Family pack",
  "1 box",
  "1 dozen"
];

const emptyProduct = {
  category: "Fruits",
  id: "",
  imageUrl: "",
  inStock: true,
  mrp: 0,
  name: "",
  price: 0,
  tag: "",
  unit: productUnits[0]
};

const emptyOnboarding = {
  category: "Bakala",
  latitude: "",
  longitude: "",
  ownerPhone: "",
  otp: "",
  radiusMeters: 100,
  shopId: "",
  shopName: ""
};

const categoryFallbackImages: Record<string, string> = {
  Bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=70",
  Dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=70",
  Fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&q=70",
  Groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=70",
  Snacks: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=70"
};

function defaultImageForCategory(category: string) {
  return categoryFallbackImages[category] ?? categoryFallbackImages.Groceries;
}

async function readApiJson<T>(response: Response): Promise<T & { error?: string }> {
  try {
    return (await response.json()) as T & { error?: string };
  } catch {
    return {} as T & { error?: string };
  }
}

async function compressImageFile(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read selected image"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Unable to load selected image"));
    element.src = dataUrl;
  });
  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image compression is not supported in this browser");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.62);
}

export default function VendorHome() {
  const [view, setView] = useState<
    "onboarding" | "login" | "dashboard" | "adminLogin" | "adminDashboard"
  >("login");
  const [shop, setShop] = useState<Shop | null>(null);
  const [vendorToken, setVendorToken] = useState("");
  const [vendorRefreshToken, setVendorRefreshToken] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminRefreshToken, setAdminRefreshToken] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState(emptyOnboarding);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [activeView, setActiveView] = useState<"orders" | "inventory">("orders");

  const shopId = shop?.id;
  const resetSignupForm = () => {
    setOnboardingForm(emptyOnboarding);
    setSignupOtpSent(false);
    setError("");
  };
  const activeOrders = useMemo(
    () =>
      summary?.orders.filter((order) =>
        ["placed", "accepted", "preparing", "ready"].includes(order.status)
      ) ?? [],
    [summary]
  );

  const refreshPortalToken = async (kind: "admin" | "vendor") => {
    const refreshToken = kind === "admin" ? adminRefreshToken : vendorRefreshToken;

    if (!refreshToken) {
      return "";
    }

    const response = await fetch(`${apiUrl}/vendor/refresh`, {
      body: JSON.stringify({ refreshToken }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const data = (await response.json()) as {
      accessToken?: string;
      error?: string;
      refreshToken?: string;
      token?: string;
    };

    if (!response.ok || !data.accessToken || !data.refreshToken) {
      throw new Error(data.error ?? "Session expired. Please login again.");
    }

    if (kind === "admin") {
      setAdminToken(data.accessToken);
      setAdminRefreshToken(data.refreshToken);
    } else {
      setVendorToken(data.accessToken);
      setVendorRefreshToken(data.refreshToken);
    }

    return data.accessToken;
  };

  const fetchWithPortalAuth = async (
    url: string,
    init: RequestInit,
    kind: "admin" | "vendor"
  ) => {
    const accessToken = kind === "admin" ? adminToken : vendorToken;
    const first = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (first.status !== 401) {
      return first;
    }

    const nextToken = await refreshPortalToken(kind);

    return fetch(url, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${nextToken}`
      }
    });
  };

  const loadSummary = async (nextShopId = shopId) => {
    if (!nextShopId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetchWithPortalAuth(
        `${apiUrl}/vendor/shops/${nextShopId}/summary`,
        {},
        "vendor"
      );
      const data = (await response.json()) as Summary | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to load vendor data");
      }

      setSummary(data as Summary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminSummary = async (token?: string) => {
    if (!token && !adminToken) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = token
        ? await fetch(`${apiUrl}/vendor/admin/summary`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        : await fetchWithPortalAuth(`${apiUrl}/vendor/admin/summary`, {}, "admin");
      const data = (await response.json()) as AdminSummary | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to load admin data");
      }

      setAdminSummary(data as AdminSummary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const captureVendorLocation = async () => {
    if (onboardingForm.latitude && onboardingForm.longitude) {
      return {
        latitude: Number(onboardingForm.latitude),
        longitude: Number(onboardingForm.longitude)
      };
    }

    if (!navigator.geolocation) {
      throw new Error("Location is required. Please turn on browser location access.");
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000
      });
    }).catch(() => {
      throw new Error("Location is required. Please turn on location permission and try again.");
    });
    const latitude = position.coords.latitude.toFixed(7);
    const longitude = position.coords.longitude.toFixed(7);

    setOnboardingForm((current) => ({
      ...current,
      latitude,
      longitude
    }));

    return {
      latitude: Number(latitude),
      longitude: Number(longitude)
    };
  };

  useEffect(() => {
    if (shopId && view === "dashboard") {
      void loadSummary(shopId);
    }
  }, [shopId, view]);

  useEffect(() => {
    if (adminToken && view === "adminDashboard") {
      void loadAdminSummary(adminToken);
    }
  }, [adminToken, view]);

  const onboardVendor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const location = await captureVendorLocation();
      const response = await fetch(`${apiUrl}/vendor/onboarding`, {
        body: JSON.stringify({
          ...onboardingForm,
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMeters: onboardingForm.radiusMeters
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = await readApiJson<Partial<VendorSession>>(response);

      if (!response.ok || !data.shop || !data.token) {
        throw new Error(data.error ?? "Unable to create vendor shop");
      }

      setShop(data.shop);
      setVendorToken(data.accessToken ?? data.token);
      setVendorRefreshToken(data.refreshToken ?? "");
      setOnboardingForm(emptyOnboarding);
      setSignupOtpSent(false);
      setView("dashboard");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const requestVendorSignupOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      await captureVendorLocation();
      const response = await fetch(`${apiUrl}/vendor/onboarding/request-otp`, {
        body: JSON.stringify({ ownerPhone: onboardingForm.ownerPhone }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = await readApiJson<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send OTP");
      }

      setSignupOtpSent(true);
      setError(data.message ?? "OTP sent.");
    } catch (otpError) {
      setError(otpError instanceof Error ? otpError.message : "Unable to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const requestVendorLoginOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/vendor/request-otp`, {
        body: JSON.stringify({ ownerPhone: loginPhone }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = await readApiJson<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send OTP");
      }

      setLoginOtpSent(true);
      setError(data.message ?? "OTP sent.");
    } catch (otpError) {
      setError(otpError instanceof Error ? otpError.message : "Unable to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const requestAdminOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/vendor/admin/request-otp`, {
        body: JSON.stringify({ phone: adminPhone }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = await readApiJson<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send OTP");
      }

      setAdminOtpSent(true);
      setError(data.message ?? "OTP sent.");
    } catch (otpError) {
      setError(otpError instanceof Error ? otpError.message : "Unable to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const loginVendor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/vendor/login`, {
        body: JSON.stringify({ ownerPhone: loginPhone, otp: loginOtp }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = await readApiJson<Partial<VendorSession>>(response);

      if (!response.ok || !data.shop || !data.token) {
        throw new Error(data.error ?? "Unable to login");
      }

      setShop(data.shop);
      setVendorToken(data.accessToken ?? data.token);
      setVendorRefreshToken(data.refreshToken ?? "");
      setView("dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login");
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/vendor/admin/login`, {
        body: JSON.stringify({ phone: adminPhone, otp: adminOtp }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = await readApiJson<{
        accessToken?: string;
        refreshToken?: string;
        token?: string;
      }>(response);

      if (!response.ok || !(data.accessToken ?? data.token)) {
        throw new Error(data.error ?? "Unable to login as admin");
      }

      setAdminToken(data.accessToken ?? data.token ?? "");
      setAdminRefreshToken(data.refreshToken ?? "");
      setView("adminDashboard");
      await loadAdminSummary(data.accessToken ?? data.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shopId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...productForm,
        id: productForm.id || undefined,
        imageUrl: productForm.imageUrl || defaultImageForCategory(productForm.category)
      };
      const response = await fetchWithPortalAuth(`${apiUrl}/vendor/shops/${shopId}/products`, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PUT"
      }, "vendor");
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save product");
      }

      setProductForm(emptyProduct);
      await loadSummary(shopId);
      setActiveView("inventory");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const editProduct = (product: Product) => {
    setProductForm({
      category: product.category,
      id: product.id,
      imageUrl: product.imageUrl ?? "",
      inStock: product.inStock,
      mrp: product.mrp,
      name: product.name,
      price: product.price,
      tag: product.tag,
      unit: product.unit
    });
    setActiveView("inventory");
  };

  const handleProductImageUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const imageUrl = await compressImageFile(file);
      setProductForm((current) => ({ ...current, imageUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductStock = async (product: Product) => {
    if (!shopId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetchWithPortalAuth(`${apiUrl}/vendor/shops/${shopId}/products`, {
        body: JSON.stringify({
          ...product,
          imageUrl: product.imageUrl || defaultImageForCategory(product.category),
          inStock: !product.inStock
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PUT"
      }, "vendor");
      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update stock");
      }

      await loadSummary(shopId);
    } catch (stockError) {
      setError(stockError instanceof Error ? stockError.message : "Unable to update stock");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchWithPortalAuth(`${apiUrl}/vendor/orders/${orderId}/status`, {
        body: JSON.stringify({ status }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PATCH"
      }, "vendor");
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update order");
      }

      await loadSummary();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update order");
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "adminDashboard") {
    return (
      <main className="appShell">
        <aside className="sidebar">
          <div className="brandRow">
            <div className="mark small">B</div>
            <div>
              <p className="eyebrow">Admin portal</p>
              <h2>Bazzato Ops</h2>
            </div>
          </div>
          <button className="navButton active">Overview</button>
          <button
            className="navButton"
            onClick={() => {
              setAdminToken("");
              setAdminRefreshToken("");
              setAdminSummary(null);
              setView("login");
            }}
          >
            Logout
          </button>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">Admin dashboard</p>
              <h1>Marketplace overview</h1>
            </div>
            <button
              className="secondaryButton"
              disabled={isLoading}
              onClick={() => loadAdminSummary()}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {error ? <div className="errorBanner">{error}</div> : null}

          <section className="metricsGrid">
            <Metric label="Shops" value={adminSummary?.totals.shops ?? 0} />
            <Metric label="Active orders" value={adminSummary?.totals.activeOrders ?? 0} />
            <Metric label="Products" value={adminSummary?.totals.products ?? 0} />
            <Metric label="Revenue" value={`SAR ${adminSummary?.totals.revenue ?? 0}`} />
          </section>

          <section className="section">
            <div className="sectionHeader">
              <h2>Vendor performance</h2>
              <span>{adminSummary?.totals.totalOrders ?? 0} orders</span>
            </div>
            <div className="productList">
              {(adminSummary?.shops ?? []).map((item) => (
                <article className="adminShopRow" key={item.id}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.category} - {item.productCount} items - rating {item.rating}
                    </small>
                  </span>
                  <span>{item.activeOrders} active</span>
                  <span>{item.completedOrders} completed</span>
                  <span>SAR {item.totalRevenue}</span>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    );
  }

  if (view !== "dashboard") {
    return (
      <main className="authShell">
        <section className="authPanel">
          <div className="mark">B</div>
          <p className="eyebrow">Vendor portal</p>
          <h1>
            {view === "onboarding"
              ? "Create your shop"
              : view === "adminLogin"
                ? "Admin login"
                : "Vendor login"}
          </h1>
          <p className="summary">
            Sign up your shop, manage inventory, receive orders, and update order
            status for mobile customers.
          </p>

          <div className="authTabs">
            <button
              className={view === "login" ? "tabButton active" : "tabButton"}
              onClick={() => {
                setError("");
                setView("login");
              }}
            >
              Login
            </button>
            <button
              className={view === "onboarding" ? "tabButton active" : "tabButton"}
              onClick={() => {
                resetSignupForm();
                setView("onboarding");
              }}
            >
              Sign up
            </button>
            <button
              className={view === "adminLogin" ? "tabButton active" : "tabButton"}
              onClick={() => {
                setError("");
                setView("adminLogin");
              }}
            >
              Admin
            </button>
          </div>

          <AutoHeight>
          {error ? <div className="errorBanner">{error}</div> : null}

          {view === "adminLogin" ? (
            <form className="authForm" key="adminLogin" onSubmit={loginAdmin}>
              <label>
                Admin mobile number
                <input
                  required
                  inputMode="tel"
                  minLength={10}
                  value={adminPhone}
                  onChange={(event) => {
                    setAdminOtp("");
                    setAdminOtpSent(false);
                    setAdminPhone(event.target.value.replace(/\D/g, ""));
                  }}
                />
              </label>
              {!adminOtpSent ? (
                <button
                  className="secondaryButton"
                  disabled={isLoading || adminPhone.length < 10}
                  onClick={requestAdminOtp}
                  type="button"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <label>
                    Enter OTP
                    <input
                      autoFocus
                      required
                      inputMode="numeric"
                      maxLength={4}
                      minLength={4}
                      placeholder="1234"
                      value={adminOtp}
                      onChange={(event) => setAdminOtp(event.target.value.replace(/\D/g, ""))}
                    />
                  </label>
                  <button
                    className="secondaryButton"
                    disabled={isLoading || adminPhone.length < 10}
                    onClick={requestAdminOtp}
                    type="button"
                  >
                    Resend OTP
                  </button>
                  <button
                    className="primaryButton"
                    disabled={isLoading || adminOtp.length !== 4}
                    type="submit"
                  >
                    {isLoading ? "Logging in..." : "Login to admin"}
                  </button>
                </>
              )}
            </form>
          ) : view === "login" ? (
            <form className="authForm" key="login" onSubmit={loginVendor}>
              <label>
                Registered mobile number
                <input
                  required
                  inputMode="tel"
                  minLength={10}
                  value={loginPhone}
                  onChange={(event) => {
                    setLoginOtp("");
                    setLoginOtpSent(false);
                    setLoginPhone(event.target.value.replace(/\D/g, ""));
                  }}
                />
              </label>
              {!loginOtpSent ? (
                <button
                  className="secondaryButton"
                  disabled={isLoading || loginPhone.length < 10}
                  onClick={requestVendorLoginOtp}
                  type="button"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <label>
                    Enter OTP
                    <input
                      autoFocus
                      required
                      inputMode="numeric"
                      maxLength={4}
                      minLength={4}
                      placeholder="1234"
                      value={loginOtp}
                      onChange={(event) => setLoginOtp(event.target.value.replace(/\D/g, ""))}
                    />
                  </label>
                  <button
                    className="secondaryButton"
                    disabled={isLoading || loginPhone.length < 10}
                    onClick={requestVendorLoginOtp}
                    type="button"
                  >
                    Resend OTP
                  </button>
                  <button
                    className="primaryButton"
                    disabled={isLoading || loginOtp.length !== 4}
                    type="submit"
                  >
                    {isLoading ? "Logging in..." : "Login to dashboard"}
                  </button>
                </>
              )}
            </form>
          ) : (
            <form autoComplete="off" className="authForm" key="onboarding" onSubmit={onboardVendor}>
              <label>
                Shop name
                <input
                  autoComplete="off"
                  required
                  value={onboardingForm.shopName}
                  onChange={(event) =>
                    setOnboardingForm((current) => ({
                      ...current,
                      shopName: event.target.value
                    }))
                  }
                />
              </label>
              <label>
                Shop id
                <input
                  autoComplete="off"
                  placeholder="fresh-mart"
                  value={onboardingForm.shopId}
                  onChange={(event) =>
                    setOnboardingForm((current) => ({
                      ...current,
                      shopId: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    }))
                  }
                />
              </label>
              <label>
                Shop type
                <select
                  value={onboardingForm.category}
                  onChange={(event) =>
                    setOnboardingForm((current) => ({
                      ...current,
                      category: event.target.value
                    }))
                  }
                >
                  <option>Bakala</option>
                  <option>Groceries</option>
                  <option>Fruits</option>
                  <option>Dairy</option>
                  <option>Bakery</option>
                  <option>Snacks</option>
                </select>
              </label>
              <label>
                Delivery radius meters
                <input
                  autoComplete="off"
                  min={1}
                  type="number"
                  value={onboardingForm.radiusMeters}
                  onChange={(event) =>
                    setOnboardingForm((current) => ({
                      ...current,
                      radiusMeters: Number(event.target.value)
                    }))
                  }
                />
              </label>
              <p className="summary">
                Shop location will be captured when you send OTP. Keep browser location
                permission on to register your shop.
              </p>
              <label>
                Owner mobile number
                <input
                  autoComplete="off"
                  required
                  inputMode="tel"
                  minLength={10}
                  value={onboardingForm.ownerPhone}
                  onChange={(event) => {
                    setSignupOtpSent(false);
                    setOnboardingForm((current) => ({
                      ...current,
                      otp: "",
                      ownerPhone: event.target.value.replace(/\D/g, "")
                    }));
                  }}
                />
              </label>
              {!signupOtpSent ? (
                <button
                  className="secondaryButton"
                  disabled={isLoading || onboardingForm.ownerPhone.length < 10}
                  onClick={requestVendorSignupOtp}
                  type="button"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <label>
                    Enter OTP
                    <input
                      autoComplete="one-time-code"
                      autoFocus
                      required
                      inputMode="numeric"
                      maxLength={4}
                      minLength={4}
                      placeholder="1234"
                      value={onboardingForm.otp}
                      onChange={(event) =>
                        setOnboardingForm((current) => ({
                          ...current,
                          otp: event.target.value.replace(/\D/g, "")
                        }))
                      }
                    />
                  </label>
                  <button
                    className="secondaryButton"
                    disabled={isLoading || onboardingForm.ownerPhone.length < 10}
                    onClick={requestVendorSignupOtp}
                    type="button"
                  >
                    Resend OTP
                  </button>
                  <button
                    className="primaryButton"
                    disabled={isLoading || onboardingForm.otp.length !== 4}
                    type="submit"
                  >
                    {isLoading ? "Creating..." : "Create shop and continue"}
                  </button>
                </>
              )}
            </form>
          )}
          </AutoHeight>
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="brandRow">
          <div className="mark small">B</div>
          <div>
            <p className="eyebrow">Vendor portal</p>
            <h2>{summary?.shop.name ?? shop?.name}</h2>
          </div>
        </div>
        <button
          className={activeView === "orders" ? "navButton active" : "navButton"}
          onClick={() => setActiveView("orders")}
        >
          Orders
        </button>
        <button
          className={activeView === "inventory" ? "navButton active" : "navButton"}
          onClick={() => setActiveView("inventory")}
        >
          Inventory
        </button>
        <button
          className="navButton"
          onClick={() => {
            setShop(null);
            setSummary(null);
            setVendorToken("");
            setVendorRefreshToken("");
            setView("login");
          }}
        >
          Logout
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{summary?.shop.category ?? shop?.category}</p>
            <h1>{activeView === "orders" ? "Order dashboard" : "Inventory manager"}</h1>
          </div>
          <button className="secondaryButton" disabled={isLoading} onClick={() => loadSummary()}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {error ? <div className="errorBanner">{error}</div> : null}

        <section className="metricsGrid">
          <Metric label="Active orders" value={summary?.metrics.activeOrders ?? 0} />
          <Metric label="Completed" value={summary?.metrics.completedOrders ?? 0} />
          <Metric label="In stock" value={summary?.metrics.inStockProducts ?? 0} />
          <Metric label="Revenue" value={`₹${summary?.metrics.totalRevenue ?? 0}`} />
        </section>

        {activeView === "orders" ? (
          <section className="section">
            <div className="sectionHeader">
              <h2>Orders for {summary?.shop.name ?? shop?.name}</h2>
              <span>{activeOrders.length} active</span>
            </div>
            <div className="orderList">
              {(summary?.orders ?? []).map((order) => (
                <article className="orderCard" key={order.id}>
                  <div>
                    <p className="orderId">{order.id}</p>
                    <p className="muted">
                      +91 {order.phone} - ₹{order.total} - {order.status}
                    </p>
                    <p className="muted">
                      {order.items
                        .map((item) => `${item.quantity}x ${item.name}`)
                        .join(", ")}
                    </p>
                    <p className="muted">
                      Deliver to: {order.deliveryAddress || "Address not provided"}
                    </p>
                    {typeof order.deliveryLatitude === "number" &&
                    typeof order.deliveryLongitude === "number" ? (
                      <a
                        className="mapLink"
                        href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLatitude},${order.deliveryLongitude}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open delivery location
                      </a>
                    ) : (
                      <p className="muted">Location: Not shared</p>
                    )}
                  </div>
                  <div className="statusActions">
                    {orderStatuses.map((status) => (
                      <button
                        className="tinyButton"
                        disabled={isLoading || order.status === status}
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {summary?.orders.length === 0 ? (
                <div className="emptyState">No orders received for this shop yet.</div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="inventoryGrid">
            <form className="section productForm" onSubmit={saveProduct}>
              <div className="sectionHeader">
                <h2>{productForm.id ? "Update item" : "Add inventory item"}</h2>
              </div>
              <label>
                Item name
                <input
                  required
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                />
              </label>
              <label>
                Category
                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value
                    }))
                  }
                >
                  <option>Fruits</option>
                  <option>Dairy</option>
                  <option>Bakery</option>
                  <option>Snacks</option>
                </select>
              </label>
              <label>
                Unit
                <select
                  required
                  value={productForm.unit}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      unit: event.target.value
                    }))
                  }
                >
                  {productUnits.map((unit) => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
              </label>
              <div className="formRow">
                <label>
                  Price
                  <input
                    min={0}
                    required
                    type="number"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        price: Number(event.target.value)
                      }))
                    }
                  />
                </label>
                <label>
                  MRP
                  <input
                    min={0}
                    required
                    type="number"
                    value={productForm.mrp}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        mrp: Number(event.target.value)
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                Tag
                <input
                  placeholder="Fresh pick, Best seller"
                  value={productForm.tag}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      tag: event.target.value
                    }))
                  }
                />
              </label>
              <div className="imageUploadBox">
                <div>
                  <span className="fieldLabel">Item photo</span>
                  <p className="helperText">
                    Upload or capture a photo. If skipped, we will use a category image.
                  </p>
                </div>
                <input
                  accept="image/*"
                  capture="environment"
                  type="file"
                  onChange={(event) => void handleProductImageUpload(event.target.files?.[0])}
                />
                <img
                  alt=""
                  className="imagePreview"
                  src={productForm.imageUrl || defaultImageForCategory(productForm.category)}
                />
              </div>
              <label className="checkboxRow">
                <input
                  checked={productForm.inStock}
                  type="checkbox"
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      inStock: event.target.checked
                    }))
                  }
                />
                Show this item to customers
              </label>
              <button className="primaryButton" disabled={isLoading} type="submit">
                {isLoading ? "Saving..." : "Save item"}
              </button>
            </form>

            <section className="section">
              <div className="sectionHeader">
                <h2>Current inventory</h2>
                <span>{summary?.products.length ?? 0} items</span>
              </div>
              <div className="productList">
                {(summary?.products ?? []).map((product) => (
                  <article className="productRow" key={product.id}>
                    {product.imageUrl ? (
                      <img alt="" className="productThumb" src={product.imageUrl} />
                    ) : (
                      <img
                        alt=""
                        className="productThumb"
                        src={defaultImageForCategory(product.category)}
                      />
                    )}
                    <span>
                      <strong>{product.name}</strong>
                      <small>
                        {product.category} - {product.unit}
                      </small>
                    </span>
                    <span className={product.inStock ? "stock" : "stock out"}>
                      {product.inStock ? "In stock" : "Out"}
                    </span>
                    <span>₹{product.price}</span>
                    <span className="productActions">
                      <button
                        className="tinyButton"
                        disabled={isLoading}
                        onClick={() => void toggleProductStock(product)}
                        type="button"
                      >
                        {product.inStock ? "Hide" : "Show"}
                      </button>
                      <button
                        className="tinyButton"
                        disabled={isLoading}
                        onClick={() => editProduct(product)}
                        type="button"
                      >
                        Edit
                      </button>
                    </span>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}

function AutoHeight({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = innerRef.current;
    if (!el) {
      return;
    }

    const update = () => setHeight(el.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="autoHeight" style={{ height }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

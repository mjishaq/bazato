import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { fontAssets } from "./src/theme/typography";

import { getNearbyShops, getShopProducts } from "./src/api/catalog";
import { createCodOrder, getOrder, getOrders } from "./src/api/orders";
import { env } from "./src/config/env";
import {
  products as fallbackProducts,
  stores as fallbackStores,
  type Product,
  type Store
} from "./src/data/catalog";
import { CartScreen } from "./src/screens/CartScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import {
  CustomerOnboardingScreen,
  type CustomerOnboardingProfile
} from "./src/screens/CustomerOnboardingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LocationPermissionScreen } from "./src/screens/LocationPermissionScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrderTrackingScreen } from "./src/screens/OrderTrackingScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { StoreCatalogScreen } from "./src/screens/StoreCatalogScreen";
import type { AuthSession } from "./src/services/authGateway";
import { colors } from "./src/theme/colors";
import type { CartQuantities, Order } from "./src/types/cart";
import { getCartSummary } from "./src/utils/cart";

type AppScreen =
  | "onboarding"
  | "login"
  | "location"
  | "home"
  | "search"
  | "store"
  | "cart"
  | "checkout"
  | "orders"
  | "tracking"
  | "profile";

type RootStackParamList = Record<AppScreen, undefined>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const onboardingStorageKey = "bazzato.customer.onboarding";

function isCompleteCustomerProfile(
  profile: Partial<CustomerOnboardingProfile> | null
): profile is CustomerOnboardingProfile {
  return Boolean(
    profile?.address &&
      profile.email &&
      profile.name &&
      profile.phone &&
      profile.preference
  );
}

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [cart, setCart] = useState<CartQuantities>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [catalogProducts, setCatalogProducts] =
    useState<Product[]>(fallbackProducts);
  const [shops, setShops] = useState<Store[]>(fallbackStores);
  const [selectedShop, setSelectedShop] = useState<Store | null>(fallbackStores[0]);
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Demo area, near current location"
  );
  const [customerProfile, setCustomerProfile] =
    useState<CustomerOnboardingProfile | null>(null);
  const [hasLoadedOnboarding, setHasLoadedOnboarding] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const cartSummary = getCartSummary(cart, catalogProducts);

  const refreshOrders = async () => {
    if (!session?.token) {
      return;
    }

    setIsLoadingOrders(true);
    try {
      setOrders(await getOrders(session.token));
    } catch {
      setOrders((current) => current);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem(onboardingStorageKey)
      .then((value) => {
        if (!value) {
          return;
        }

        const profile = JSON.parse(value) as Partial<CustomerOnboardingProfile>;

        if (isCompleteCustomerProfile(profile)) {
          setCustomerProfile(profile);
          setDeliveryAddress(profile.address);
        }
      })
      .catch(() => undefined)
      .finally(() => setHasLoadedOnboarding(true));
  }, []);

  useEffect(() => {
    let isMounted = true;

    getNearbyShops()
      .then((nextShops) => {
        if (isMounted) {
          setShops(nextShops);
          setSelectedShop((current) => current ?? nextShops[0] ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setShops(fallbackStores);
          setSelectedShop((current) => current ?? fallbackStores[0] ?? null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const shopId = selectedShop?.id ?? env.defaultShopId;

    getShopProducts(shopId)
      .then((nextProducts) => {
        if (isMounted) {
          setCatalogProducts(nextProducts);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCatalogProducts(
            fallbackProducts.filter((product) => product.storeId === shopId)
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedShop?.id]);

  useEffect(() => {
    refreshOrders();
  }, [session?.token]);

  const addToCart = (productId: string) => {
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1
    }));
  };

  const completeOnboarding = (profile: CustomerOnboardingProfile) => {
    setCustomerProfile(profile);
    setDeliveryAddress(profile.address);
    void AsyncStorage.setItem(onboardingStorageKey, JSON.stringify(profile)).catch(
      () => undefined
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => {
      const nextQuantity = (current[productId] ?? 0) - 1;
      const next = { ...current };

      if (nextQuantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = nextQuantity;
      }

      return next;
    });
  };

  const placeOrder = async (navigate: (screen: AppScreen) => void) => {
    const nextOrder = await createCodOrder({
      lines: cartSummary.lines,
      phone: session?.phone ?? customerProfile?.phone ?? "9876543210",
      shopId: selectedShop?.id ?? env.defaultShopId,
      deliveryAddress,
      token: session?.token ?? null
    });
    nextOrder.shopName = nextOrder.shopName ?? selectedShop?.name;
    nextOrder.shopId = nextOrder.shopId ?? selectedShop?.id;

    setOrder(nextOrder);
    setOrders((current) => [
      nextOrder,
      ...current.filter((item) => item.id !== nextOrder.id)
    ]);
    setCart({});
    navigate("tracking");
  };

  const refreshCurrentOrder = async () => {
    if (!order || !session?.token) {
      return;
    }

    try {
      const nextOrder = await getOrder(order.id, session.token);
      setOrder(nextOrder);
      setOrders((current) => [
        nextOrder,
        ...current.filter((item) => item.id !== nextOrder.id)
      ]);
    } catch {
      setOrder((current) => current);
    }
  };

  const updateTrackedOrder = (nextOrder: Order) => {
    setOrder(nextOrder);
    setOrders((current) => [
      nextOrder,
      ...current.filter((item) => item.id !== nextOrder.id)
    ]);
  };

  const logout = (navigate: (screen: AppScreen) => void) => {
    setCart({});
    setOrder(null);
    setOrders([]);
    setSession(null);
    navigate("login");
  };

  const openShop = (shop: Store, navigate: (screen: AppScreen) => void) => {
    if (shop.id !== selectedShop?.id) {
      setCart({});
    }

    setSelectedShop(shop);
    navigate("store");
  };

  if (!hasLoadedOnboarding || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="onboarding"
          screenOptions={{
            animation: "slide_from_right",
            contentStyle: { backgroundColor: colors.background },
            headerShown: false
          }}
        >
          <Stack.Screen name="onboarding">
            {({ navigation }) => (
              <CustomerOnboardingScreen
                onComplete={(profile) => {
                  completeOnboarding(profile);
                  navigation.replace("login");
                }}
                onLogin={() => navigation.replace("login")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="login">
            {({ navigation }) => (
              <LoginScreen
                initialPhone={customerProfile?.phone}
                lockPhone={Boolean(customerProfile?.phone)}
                onComplete={(nextSession) => {
                  setSession(nextSession);
                  navigation.replace("location");
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="location">
            {({ navigation }) => (
              <LocationPermissionScreen
                onBack={() => navigation.replace("login")}
                onContinue={() => navigation.replace("home")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="home">
            {({ navigation }) => (
              <HomeScreen
                cartSummary={cartSummary}
                onBack={() => navigation.navigate("location")}
                onCart={() => navigation.navigate("cart")}
                onOpenStore={(shop) => openShop(shop, navigation.navigate)}
                onOrders={() => navigation.navigate("orders")}
                onProfile={() => navigation.navigate("profile")}
                onSearch={() => navigation.navigate("search")}
                selectedShop={selectedShop}
                shops={shops}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="search">
            {({ navigation }) => (
              <SearchScreen
                cart={cart}
                cartSummary={cartSummary}
                onAdd={addToCart}
                onBack={() => navigation.navigate("home")}
                onCart={() => navigation.navigate("cart")}
                onRemove={removeFromCart}
                products={catalogProducts}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="store">
            {({ navigation }) => (
              <StoreCatalogScreen
                cart={cart}
                cartSummary={cartSummary}
                onAdd={addToCart}
                onBack={() => navigation.navigate("home")}
                onCart={() => navigation.navigate("cart")}
                onRemove={removeFromCart}
                products={catalogProducts}
                selectedShop={selectedShop}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="cart">
            {({ navigation }) => (
              <CartScreen
                cartSummary={cartSummary}
                onAdd={addToCart}
                onBack={() => navigation.navigate("store")}
                onCheckout={() => navigation.navigate("checkout")}
                onClear={() => setCart({})}
                onRemove={removeFromCart}
                products={catalogProducts}
                selectedShop={selectedShop}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="checkout">
            {({ navigation }) => (
              <CheckoutScreen
                cartSummary={cartSummary}
                deliveryAddress={deliveryAddress}
                onBack={() => navigation.navigate("cart")}
                onDeliveryAddressChange={setDeliveryAddress}
                onPlaceOrder={() => placeOrder(navigation.replace)}
                selectedShop={selectedShop}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="tracking">
            {({ navigation }) => (
              <OrderTrackingScreen
                onHome={() => navigation.replace("home")}
                onProfile={() => navigation.navigate("profile")}
                onOrderUpdate={updateTrackedOrder}
                onRefresh={refreshCurrentOrder}
                onReorder={() => navigation.navigate("store")}
                onSearch={() => navigation.navigate("search")}
                order={order}
                token={session?.token ?? null}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="orders">
            {({ navigation }) => (
              <OrdersScreen
                isLoading={isLoadingOrders}
                onHome={() => navigation.replace("home")}
                onOpenOrder={(selectedOrder) => {
                  setOrder(selectedOrder);
                  navigation.navigate("tracking");
                }}
                onProfile={() => navigation.navigate("profile")}
                onRefresh={refreshOrders}
                onSearch={() => navigation.navigate("search")}
                orders={orders}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="profile">
            {({ navigation }) => (
              <ProfileScreen
                onHome={() => navigation.replace("home")}
                onLogout={() => logout(navigation.replace)}
                onOrders={() => navigation.navigate("orders")}
                onSearch={() => navigation.navigate("search")}
                deliveryAddress={deliveryAddress}
                customerEmail={customerProfile?.email}
                customerName={customerProfile?.name}
                order={order}
                orderCount={orders.length}
                phone={session?.phone}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { fontAssets } from "./src/theme/typography";

import { getNearbyShops, getShopProducts } from "./src/api/catalog";
import { createCodOrder, getOrder, getOrders } from "./src/api/orders";
import {
  products as fallbackProducts,
  type Product,
  type Store
} from "./src/data/catalog";
import { CartScreen } from "./src/screens/CartScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import {
  AddressBookScreen,
  type SavedAddress
} from "./src/screens/AddressBookScreen";
import {
  CustomerOnboardingScreen,
  type CustomerOnboardingProfile
} from "./src/screens/CustomerOnboardingScreen";
import {
  logoutAuthSession,
  refreshAuthSession,
  registerCustomer,
  requestRegistrationOtp,
  updateCustomerLocation
} from "./src/api/auth";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LocationPermissionScreen } from "./src/screens/LocationPermissionScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrderTrackingScreen } from "./src/screens/OrderTrackingScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { StoreCatalogScreen } from "./src/screens/StoreCatalogScreen";
import type { AuthSession } from "./src/services/authGateway";
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession
} from "./src/services/tokenStorage";
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
  | "addresses"
  | "orders"
  | "tracking"
  | "profile";

type RootStackParamList = Record<AppScreen, undefined>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const onboardingStorageKey = "bazzato.customer.onboarding";
const addressesStorageKey = "bazzato.customer.addresses";
const tokenRefreshSkewMs = 60 * 1000;
const shopRefreshIntervalMs = 30 * 1000;

const PHONE_WIDTH = 412;
const PHONE_MAX_HEIGHT = 896;

function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();

  // On native, or on a narrow (phone-sized) browser viewport, render full-bleed.
  if (Platform.OS !== "web" || width <= 480) {
    return <View style={frameStyles.fill}>{children}</View>;
  }

  const frameHeight = Math.min(height - 48, PHONE_MAX_HEIGHT);

  return (
    <View style={frameStyles.backdrop}>
      <View
        style={[
          frameStyles.device,
          { width: PHONE_WIDTH, height: frameHeight }
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const frameStyles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background
  },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16130D",
    backgroundImage:
      "radial-gradient(120% 120% at 50% 0%, #2A2620 0%, #16130D 60%)"
  } as object,
  device: {
    maxWidth: "100%",
    backgroundColor: colors.background,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 10,
    borderColor: "#0B0907",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)"
  } as object
});

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
  const [shops, setShops] = useState<Store[]>([]);
  const [selectedShop, setSelectedShop] = useState<Store | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Demo area, near current location"
  );
  const [deliveryLocation, setDeliveryLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [customerProfile, setCustomerProfile] =
    useState<CustomerOnboardingProfile | null>(null);
  const [hasLoadedOnboarding, setHasLoadedOnboarding] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const cartSummary = getCartSummary(cart, catalogProducts);

  const refreshOrders = async () => {
    const activeSession = await getActiveSession();

    if (!activeSession?.token) {
      return;
    }

    setIsLoadingOrders(true);
    try {
      setOrders(await getOrders(activeSession.token));
    } catch {
      setOrders((current) => current);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? addresses[0];

  const loadShops = async () => {
    if (!deliveryLocation) {
      setShops([]);
      setSelectedShop(null);
      return;
    }

    try {
      const nextShops = await getNearbyShops(deliveryLocation);
      setShops(nextShops);
      setSelectedShop((current) =>
        current && nextShops.some((shop) => shop.id === current.id)
          ? current
          : nextShops[0] ?? null
      );
    } catch {
      setShops([]);
      setSelectedShop(null);
    }
  };

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(onboardingStorageKey),
      AsyncStorage.getItem(addressesStorageKey),
      loadStoredSession()
    ])
      .then(([value, storedAddresses, storedSession]) => {
        if (!value) {
          if (
            storedSession &&
            new Date(storedSession.refreshTokenExpiresAt).getTime() <= Date.now()
          ) {
            void clearStoredSession();
          }
          return;
        }

        const profile = JSON.parse(value) as Partial<CustomerOnboardingProfile>;

        if (isCompleteCustomerProfile(profile)) {
          setCustomerProfile(profile);
          setDeliveryAddress(profile.address);
          const parsedAddresses = storedAddresses
            ? (JSON.parse(storedAddresses) as SavedAddress[])
            : [];

          if (parsedAddresses.length > 0) {
            setAddresses(parsedAddresses);
            setSelectedAddressId(parsedAddresses[0].id);
          } else {
            const initialAddress = {
              id: "address-primary",
              label: "Home",
              line: profile.address
            };
            setAddresses([initialAddress]);
            setSelectedAddressId(initialAddress.id);
          }
        }

        if (
          storedSession &&
          new Date(storedSession.refreshTokenExpiresAt).getTime() <= Date.now()
        ) {
          void clearStoredSession();
        }
      })
      .catch(() => undefined)
      .finally(() => setHasLoadedOnboarding(true));
  }, []);

  useEffect(() => {
    void loadShops();
    const timer = setInterval(() => {
      void loadShops();
    }, shopRefreshIntervalMs);

    return () => clearInterval(timer);
  }, [deliveryLocation?.latitude, deliveryLocation?.longitude]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedShop) {
      setCatalogProducts([]);
      setCart({});
      return () => {
        isMounted = false;
      };
    }

    const shopId = selectedShop.id;

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

  const getActiveSession = async () => {
    if (!session) {
      return null;
    }

    if (session.expiresAt > Date.now() + tokenRefreshSkewMs) {
      return session;
    }

    const tokens = await refreshAuthSession(session.refreshToken);
    const nextSession = {
      ...session,
      accessToken: tokens.accessToken,
      expiresAt: Date.now() + tokens.expiresInSeconds * 1000,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      token: tokens.accessToken
    };

    setSession(nextSession);
    await saveStoredSession(nextSession);

    return nextSession;
  };

  const addToCart = (productId: string) => {
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1
    }));
  };

  const completeOnboarding = async (profile: CustomerOnboardingProfile) => {
    if (!profile.otp) {
      throw new Error("OTP is required to create your profile.");
    }

    await registerCustomer({
      ...profile,
      otp: profile.otp
    });
    const profileForStorage = {
      address: profile.address,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      preference: profile.preference
    };
    const initialAddress = {
      id: "address-primary",
      label: "Home",
      line: profile.address
    };
    setCustomerProfile(profileForStorage);
    setDeliveryAddress(profile.address);
    setAddresses([initialAddress]);
    setSelectedAddressId(initialAddress.id);
    void AsyncStorage.setItem(onboardingStorageKey, JSON.stringify(profileForStorage)).catch(
      () => undefined
    );
    void AsyncStorage.setItem(addressesStorageKey, JSON.stringify([initialAddress])).catch(
      () => undefined
    );
  };

  const addAddress = (address: SavedAddress) => {
    const nextAddresses = [address, ...addresses];
    setAddresses(nextAddresses);
    setSelectedAddressId(address.id);
    setDeliveryAddress(address.line);
    setDeliveryLocation(
      typeof address.latitude === "number" && typeof address.longitude === "number"
        ? { latitude: address.latitude, longitude: address.longitude }
        : deliveryLocation
    );
    void AsyncStorage.setItem(addressesStorageKey, JSON.stringify(nextAddresses)).catch(
      () => undefined
    );
  };

  const selectAddress = (addressId: string) => {
    const nextAddress = addresses.find((address) => address.id === addressId);

    if (!nextAddress) {
      return;
    }

    setSelectedAddressId(addressId);
    setDeliveryAddress(nextAddress.line);
    if (
      typeof nextAddress.latitude === "number" &&
      typeof nextAddress.longitude === "number"
    ) {
      setDeliveryLocation({
        latitude: nextAddress.latitude,
        longitude: nextAddress.longitude
      });
    }
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
    if (!selectedShop) {
      throw new Error("Please select a nearby shop before placing an order.");
    }

    const nextOrder = await createCodOrder({
      lines: cartSummary.lines,
      phone: session?.phone ?? customerProfile?.phone ?? "9876543210",
      shopId: selectedShop.id,
      deliveryAddress: selectedAddress?.line ?? deliveryAddress,
      deliveryLatitude: selectedAddress?.latitude ?? deliveryLocation?.latitude,
      deliveryLongitude: selectedAddress?.longitude ?? deliveryLocation?.longitude,
      token: (await getActiveSession())?.token ?? null
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
    const activeSession = await getActiveSession();

    if (!order || !activeSession?.token) {
      return;
    }

    try {
      const nextOrder = await getOrder(order.id, activeSession.token);
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
    const refreshToken = session?.refreshToken;

    setCart({});
    setOrder(null);
    setOrders([]);
    setSession(null);
    void clearStoredSession();
    if (refreshToken) {
      void logoutAuthSession(refreshToken).catch(() => undefined);
    }
    navigate("login");
  };

  const completeLoginWithLocation = async (
    nextSession: AuthSession,
    resetTo: (screen: AppScreen) => void
  ) => {
    const result = await Location.requestForegroundPermissionsAsync();

    if (result.status !== Location.PermissionStatus.GRANTED) {
      setSession(null);
      setDeliveryLocation(null);
      setShops([]);
      setSelectedShop(null);
      void clearStoredSession();
      Alert.alert(
        "Location required",
        "Please turn on location access to see nearby shops and continue ordering."
      );
      resetTo("login");
      return;
    }

    try {
      const current = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude
      };
      await updateCustomerLocation({
        ...currentLocation,
        token: nextSession.token
      });
      setDeliveryLocation(currentLocation);
      setSession(nextSession);
      await saveStoredSession(nextSession);
      resetTo("home");
    } catch {
      setSession(null);
      setDeliveryLocation(null);
      setShops([]);
      setSelectedShop(null);
      void clearStoredSession();
      Alert.alert(
        "Location unavailable",
        "We could not read your current location. Please turn on location and try login again."
      );
      resetTo("login");
    }
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
    <PhoneFrame>
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="login"
          screenOptions={{
            animation: "slide_from_right",
            contentStyle: { backgroundColor: colors.background },
            headerShown: false
          }}
        >
          <Stack.Screen name="onboarding">
            {({ navigation }) => (
              <CustomerOnboardingScreen
                onComplete={async (profile) => {
                  await completeOnboarding(profile);
                  navigation.replace("login");
                }}
                onLogin={() => navigation.replace("login")}
                onRequestOtp={requestRegistrationOtp}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="login">
            {({ navigation }) => (
              <LoginScreen
                initialPhone=""
                lockPhone={false}
                onComplete={async (nextSession) => {
                  await completeLoginWithLocation(nextSession, (screen) =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: screen }]
                    })
                  );
                }}
                onRegister={() => navigation.replace("onboarding")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="location">
            {({ navigation }) => (
              <LocationPermissionScreen
                onBack={() => navigation.replace(session ? "home" : "login")}
                onContinue={(location) => {
                  setDeliveryLocation(location ?? null);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "home" }]
                  });
                }}
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
                onRefresh={loadShops}
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
                deliveryAddress={selectedAddress?.line ?? deliveryAddress}
                onBack={() => navigation.navigate("cart")}
                onAddressBook={() => navigation.navigate("addresses")}
                onDeliveryAddressChange={(address) => {
                  setDeliveryAddress(address);
                  if (selectedAddress) {
                    const nextAddresses = addresses.map((item) =>
                      item.id === selectedAddress.id ? { ...item, line: address } : item
                    );
                    setAddresses(nextAddresses);
                    void AsyncStorage.setItem(addressesStorageKey, JSON.stringify(nextAddresses)).catch(
                      () => undefined
                    );
                  }
                }}
                onPlaceOrder={() => placeOrder(navigation.replace)}
                selectedShop={selectedShop}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="addresses">
            {({ navigation }) => (
              <AddressBookScreen
                addresses={addresses}
                currentLocation={deliveryLocation}
                onAddAddress={addAddress}
                onBack={() => navigation.goBack()}
                onSelectAddress={selectAddress}
                selectedAddressId={selectedAddressId}
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
                onAddresses={() => navigation.navigate("addresses")}
                onSearch={() => navigation.navigate("search")}
                addressCount={addresses.length}
                deliveryAddress={selectedAddress?.line ?? deliveryAddress}
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
    </PhoneFrame>
  );
}

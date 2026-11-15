import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { categories } from "../data/catalog";
import { useCommerce } from "../context/CommerceContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import ErrorState from "../components/ErrorState";

const money = (n) => `$${Number(n || 0).toFixed(0)}`;
const Icon = ({ children }) => <Text style={styles.icon}>{children}</Text>;
function ProductArt({ product, large = false }) {
  const [failed, setFailed] = useState(false);
  const image = product?.image || product?.imageUrl || product?.image_url;
  const source =
    !failed && image
      ? typeof image === "string"
        ? { uri: image }
        : image
      : null;
  return (
    <View
      style={[
        styles.art,
        { backgroundColor: product?.accent || "#FFE0D3" },
        large && styles.artLarge,
      ]}
    >
      {source ? (
        <Image
          source={source}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={styles.artImage}
        />
      ) : (
        <View
          style={[
            styles.artShape,
            { backgroundColor: product?.color || "#EF653D" },
          ]}
        />
      )}
      <Text style={styles.artMark}>{source ? "" : "VELORA"}</Text>
    </View>
  );
}
function Header({ title, back, onBack, right, subtitle }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {back && (
          <Pressable onPress={onBack}>
            <Icon>‹</Icon>
          </Pressable>
        )}
      </View>
      <View style={styles.headerTitle}>
        <Text style={styles.eyebrow}>{subtitle}</Text>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={[styles.headerSide, styles.right]}>{right}</View>
    </View>
  );
}
function ProductCard({ product, onOpen }) {
  const { favorites, toggleFavorite } = useCommerce();
  return (
    <Pressable onPress={() => onOpen(product)} style={styles.productCard}>
      <View>
        <ProductArt product={product} />
        <Pressable
          style={styles.heart}
          onPress={() => toggleFavorite(product.id)}
        >
          <Text>{favorites.includes(product.id) ? "♥" : "♡"}</Text>
        </Pressable>
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{money(product.price)}</Text>
      {product.stock === 0 && <Text style={styles.sold}>Sold out</Text>}
    </Pressable>
  );
}

export default function AppNavigator() {
  const [route, setRoute] = useState("welcome"),
    [selected, setSelected] = useState(null),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [toast, setToast] = useState(null),
    [productBackRoute, setProductBackRoute] = useState("shop");
  const { cartCount } = useCommerce();
  const { user } = useAuth();
  const go = (next, item) => {
    setSelected(item || null);
    setRoute(next);
  };
  const openProduct = (item, from) => {
    setProductBackRoute(from);
    go("product", item);
  };
  const notify = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  };
  const right = (
    <View style={styles.headerActions}>
      <Pressable onPress={() => go("notifications")}>
        <Icon>♧</Icon>
      </Pressable>
      <Pressable onPress={() => go("cart")}>
        <Icon>⌑</Icon>
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
  let screen;
  if (["welcome", "signin", "signup"].includes(route))
    screen = <AuthScreen mode={route} onGo={go} />;
  else if (route === "home")
    screen = (
      <Home onGo={go} onOpen={(p) => openProduct(p, "home")} right={right} />
    );
  else if (["shop", "search"].includes(route))
    screen = (
      <Catalog
        title={route === "search" ? "Search" : "Shop"}
        onOpen={(p) => openProduct(p, route)}
        initialSearch={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        right={right}
      />
    );
  else if (route === "product")
    screen = (
      <Product
        product={selected}
        onBack={() => go(productBackRoute)}
        notify={notify}
      />
    );
  else if (route === "cart")
    screen = <Cart onGo={go} onBack={() => go("home")} />;
  else if (route === "checkout") screen = <Checkout onGo={go} />;
  else if (route === "confirmation")
    screen = <Confirmation order={selected} onGo={go} />;
  else if (route === "favorites")
    screen = <Favorites onOpen={(p) => openProduct(p, "favorites")} />;
  else if (route === "orders") screen = <Orders />;
  else if (route === "notifications")
    screen = <Notifications onBack={() => go("home")} />;
  else if (route === "profile") screen = <Profile onGo={go} user={user} />;
  else
    screen = (
      <Admin
        route={route}
        onGo={go}
        onBack={() => go("profile")}
        selected={selected}
      />
    );
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen}
      {![
        "welcome",
        "signin",
        "signup",
        "product",
        "cart",
        "checkout",
        "confirmation",
        "notifications",
      ].includes(route) && <Nav route={route} go={go} />}
      <>
        {toast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </>
    </SafeAreaView>
  );
}
function AuthScreen({ mode, onGo }) {
  const sign = mode === "signup";
  const { login, register, loading } = useAuth();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(null);
  const submit = async () => {
    try {
      setError(null);
      sign
        ? await register(name, email, password)
        : await login(email, password);
      onGo("home");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.auth}
    >
      <View style={styles.authHero}>
        <Text style={styles.logo}>VELORA</Text>
        <Text style={styles.display}>Objects for a life well lived.</Text>
        <Text style={styles.mutedLight}>
          Curated pieces, delivered slowly and thoughtfully.
        </Text>
      </View>
      <View style={styles.authCard}>
        {mode === "welcome" ? (
          <>
            <Text style={styles.sectionTitle}>Welcome in.</Text>
            <Text style={styles.body}>
              A considered collection for everyday rituals.
            </Text>
            <Button label="Shop the collection" onPress={() => onGo("home")} />
            <Button
              label="Sign in"
              kind="soft"
              onPress={() => onGo("signin")}
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {sign ? "Create your account" : "Welcome back"}
            </Text>
            {error && (
              <ErrorState compact title="Could not continue" message={error} />
            )}{" "}
            {sign && (
              <Field
                label="Full name"
                placeholder="Avery Morgan"
                value={name}
                onChangeText={setName}
              />
            )}
            <Field
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <Field
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secure
            />
            <Button
              label={
                loading ? "Please wait…" : sign ? "Create account" : "Sign in"
              }
              disabled={loading}
              onPress={submit}
            />
            <Text style={styles.centerText}>
              {sign ? "Already have an account? " : "New to Velora? "}
              <Text
                style={styles.link}
                onPress={() => onGo(sign ? "signin" : "signup")}
              >
                {sign ? "Sign in" : "Create one"}
              </Text>
            </Text>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
function Home({ onGo, onOpen, right }) {
  const { products } = useCommerce();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Header title="Velora" subtitle="GOOD MORNING" right={right} />
      <Text style={styles.display}>Make room{`\n`}for beautiful things.</Text>
      <Pressable onPress={() => onOpen(products[0])} style={styles.feature}>
        <View style={styles.featureCopy}>
          <Text style={styles.eyebrow}>THE AUTUMN EDIT</Text>
          <Text style={styles.featureTitle}>A softer kind{`\n`}of light.</Text>
          <Text style={styles.featureLink}>Meet Solenne →</Text>
        </View>
        <ProductArt product={products[0]} large />
      </Pressable>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Fresh arrivals</Text>
        <Text style={styles.link} onPress={() => onGo("shop")}>
          View all
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collection}
      >
        {["Soft forms", "At home", "In motion"].map((x, i) => (
          <Pressable
            onPress={() => onGo("shop")}
            key={x}
            style={[
              styles.collectionPill,
              { backgroundColor: ["#F0DBC9", "#DDE5D5", "#E6DDF2"][i] },
            ]}
          >
            <Text style={styles.collectionNum}>0{i + 1}</Text>
            <Text style={styles.collectionText}>{x}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.productGrid}>
        {products.slice(1, 5).map((p) => (
          <ProductCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </View>
    </ScrollView>
  );
}
function Catalog({
  title,
  onOpen,
  initialSearch,
  setSearch,
  category,
  setCategory,
  right,
}) {
  const { products } = useCommerce();
  const query = (initialSearch || "").trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      (category === "All" ||
        (category === "New in" ? p.featured : p.category === category)) &&
      p.name.toLowerCase().includes(query),
  );
  return (
    <View style={styles.flex}>
      <Header title={title} right={right} />
      <View style={styles.search}>
        <Text>⌕</Text>
        <TextInput
          value={initialSearch}
          onChangeText={setSearch}
          placeholder="Search the collection"
          placeholderTextColor="#817B75"
          style={styles.searchInput}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, category === c && styles.chipTextActive]}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {filtered.length ? (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.gridList}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <ProductCard product={item} onOpen={onOpen} />
          )}
        />
      ) : (
        <Empty
          icon="⌕"
          title="Nothing found"
          copy="Try a different search or category."
          action="Clear filters"
          onAction={() => {
            setSearch("");
            setCategory("All");
          }}
        />
      )}
    </View>
  );
}
function Product({ product, onBack, notify }) {
  const { addToCart, favorites, toggleFavorite } = useCommerce();
  const [size, setSize] = useState(product.sizes[0]),
    [quantity, setQuantity] = useState(1);
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Header
        title="Product"
        back
        onBack={onBack}
        right={
          <Pressable onPress={() => toggleFavorite(product.id)}>
            <Icon>{favorites.includes(product.id) ? "♥" : "♡"}</Icon>
          </Pressable>
        }
      />
      <ProductArt product={product} large />
      <View style={styles.productDetail}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.eyebrow}>{product.category}</Text>
            <Text style={styles.detailName}>{product.name}</Text>
          </View>
          <Text style={styles.detailPrice}>{money(product.price)}</Text>
        </View>
        <Text style={styles.body}>{product.description}</Text>
        <Text style={styles.label}>SELECT OPTION</Text>
        <View style={styles.optionRow}>
          {product.sizes.map((s) => (
            <Pressable
              onPress={() => setSize(s)}
              key={s}
              style={[styles.option, size === s && styles.optionSelected]}
            >
              <Text>{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>QUANTITY</Text>
          <Qty value={quantity} setValue={setQuantity} />
        </View>
        {product.stock === 0 ? (
          <Button label="Sold out" disabled />
        ) : (
          <Button
            label={`Add to bag · ${money(product.price * quantity)}`}
            onPress={() => {
              addToCart(product, size, quantity);
              notify("Added to your bag");
            }}
          />
        )}
        <Text style={styles.delivery}>
          Free delivery on orders over $150 · Returns within 30 days
        </Text>
      </View>
    </ScrollView>
  );
}
function Cart({ onGo, onBack }) {
  const { cart, cartTotal, changeQuantity, removeFromCart } = useCommerce();
  return (
    <View style={styles.flex}>
      <Header title="Your bag" back onBack={onBack} />
      {!cart.length ? (
        <Empty
          icon="⌑"
          title="Your bag is waiting"
          copy="Find something that makes the everyday feel special."
          action="Shop collection"
          onAction={() => onGo("shop")}
        />
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(x) => x.key}
            contentContainerStyle={styles.cartList}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <ProductArt product={item} />
                <View style={styles.cartInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.muted}>{item.size}</Text>
                  <Text style={styles.productPrice}>{money(item.price)}</Text>
                  <View style={styles.rowBetween}>
                    <Qty
                      value={item.quantity}
                      setValue={(v) =>
                        changeQuantity(item.key, v - item.quantity)
                      }
                    />
                    <Text
                      onPress={() => removeFromCart(item.key)}
                      style={styles.remove}
                    >
                      Remove
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
          <View style={styles.checkoutBar}>
            <View style={styles.rowBetween}>
              <Text style={styles.body}>Subtotal</Text>
              <Text style={styles.detailPrice}>{money(cartTotal)}</Text>
            </View>
            <Text style={styles.muted}>
              Taxes and shipping calculated at checkout.
            </Text>
            <Button label="Checkout" onPress={() => onGo("checkout")} />
          </View>
        </>
      )}
    </View>
  );
}
function Checkout({ onGo }) {
  const { cartTotal, checkout } = useCommerce();
  const [submitting, setSubmitting] = useState(false);
  const placeOrder = async () => {
    try {
      setSubmitting(true);
      onGo("confirmation", await checkout());
    } catch (error) {
      Alert.alert("Checkout unavailable", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView contentContainerStyle={styles.page}>
        <Header title="Checkout" back onBack={() => onGo("cart")} />
        <Text style={styles.sectionTitle}>Delivery details</Text>
        <Field label="Email" placeholder="you@example.com" />
        <View style={styles.twoFields}>
          <Field label="First name" placeholder="Avery" />
          <Field label="Last name" placeholder="Morgan" />
        </View>
        <Field label="Address" placeholder="18 Market Street" />
        <View style={styles.twoFields}>
          <Field label="City" placeholder="Paris" />
          <Field label="Postcode" placeholder="75011" />
        </View>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.payment}>
          <Text>Card ending 4242</Text>
          <Text style={styles.link}>Change</Text>
        </View>
        <View style={styles.orderTotal}>
          <Text style={styles.body}>Total</Text>
          <Text style={styles.detailPrice}>{money(cartTotal)}</Text>
        </View>
        <Button
          disabled={submitting}
          label={
            submitting ? "Placing order…" : `Place order · ${money(cartTotal)}`
          }
          onPress={placeOrder}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
function Confirmation({ order, onGo }) {
  return (
    <View style={styles.confirm}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.display}>It’s on its way.</Text>
      <Text style={styles.body}>
        Thank you. Order {order?.id} is being prepared with care.
      </Text>
      <View style={styles.orderCard}>
        <Text style={styles.eyebrow}>ORDER TOTAL</Text>
        <Text style={styles.detailPrice}>{money(order?.total)}</Text>
        <Text style={styles.muted}>
          We’ll send tracking details to your email.
        </Text>
      </View>
      <Button label="Continue shopping" onPress={() => onGo("home")} />
      <Text style={styles.link} onPress={() => onGo("orders")}>
        View my orders
      </Text>
    </View>
  );
}
function Favorites({ onOpen }) {
  const { products, favorites } = useCommerce();
  const items = products.filter((p) => favorites.includes(p.id));
  return (
    <View style={styles.flex}>
      <Header title="Saved pieces" />
      {items.length ? (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.gridList}
          renderItem={({ item }) => (
            <ProductCard product={item} onOpen={onOpen} />
          )}
        />
      ) : (
        <Empty
          icon="♡"
          title="Saved for later"
          copy="Tap the heart on a piece to keep it close."
        />
      )}
    </View>
  );
}
function Orders() {
  const { orders } = useCommerce();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Header title="Orders" />
      {orders.map((o) => (
        <View key={o.id} style={styles.orderRow}>
          <View>
            <Text style={styles.productName}>{o.id}</Text>
            <Text style={styles.muted}>
              {o.date} · {o.items} item{o.items > 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.status}>{o.status}</Text>
            <Text style={styles.productPrice}>{money(o.total)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
function Notifications({ onBack }) {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();
  const [actionError, setActionError] = useState(null);
  const readOne = async (id) => {
    try {
      setActionError(null);
      await markAsRead(id);
    } catch (error) {
      setActionError(error.message);
    }
  };
  const readAll = async () => {
    try {
      setActionError(null);
      await markAllAsRead();
    } catch (error) {
      setActionError(error.message);
    }
  };
  return (
    <View style={styles.flex}>
      <Header
        title="Notifications"
        back
        onBack={onBack}
        right={
          <Text style={styles.link} onPress={readAll}>
            Read all
          </Text>
        }
      />
      {error && <ErrorState message={error} onRetry={loadNotifications} />}{" "}
      {actionError && (
        <ErrorState
          compact
          title="Could not update notification"
          message={actionError}
        />
      )}{" "}
      {loading && notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <Empty
          icon="🔔"
          title="No notifications yet"
          copy="You will see your notifications here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.notificationList}
          refreshing={loading}
          onRefresh={loadNotifications}
          renderItem={({ item }) => {
            const unread = !item.is_read;
            return (
              <Pressable
                onPress={() => unread && readOne(item.id)}
                style={[styles.notification, unread && styles.unread]}
              >
                <View style={styles.notifDot} />
                <View>
                  <Text style={styles.productName}>{item.title}</Text>
                  <Text style={styles.muted}>{item.message}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
function Profile({ onGo, user }) {
  const { logout } = useAuth();
  const isAdmin = user?.role === "admin";
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Header title="Profile" />
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || "Guest").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.detailName}>{user?.name || "Guest"}</Text>
        <Text style={styles.muted}>
          {user?.email || "Sign in to access your account"}
        </Text>
      </View>
      <Text style={styles.label}>MY VELORA</Text>
      <Menu label="My orders" icon="□" onPress={() => onGo("orders")} />
      <Menu label="Saved pieces" icon="♡" onPress={() => onGo("favorites")} />
      <Menu
        label="Notifications"
        icon="♧"
        onPress={() => onGo("notifications")}
      />
      {isAdmin && (
        <>
          <Text style={styles.label}>STORE MANAGEMENT</Text>
          <View style={styles.adminCallout}>
            <Text style={styles.eyebrow}>ADMIN ACCESS</Text>
            <Text style={styles.calloutTitle}>Run your shop, beautifully.</Text>
            <Text style={styles.muted}>
              Catalog, inventory and order operations in one calm workspace.
            </Text>
            <Button
              label="Open admin workspace"
              onPress={() => onGo("admin")}
            />
          </View>
        </>
      )}
      <Menu label="Settings" icon="⚙" />
      <Menu
        label={user ? "Sign out" : "Sign in"}
        icon="↪"
        onPress={() => {
          logout();
          onGo("welcome");
        }}
      />
    </ScrollView>
  );
}
function Admin({ route, onGo, onBack, selected }) {
  const { products, orders, saveProduct, removeProduct } = useCommerce();
  const editing = route === "admin-edit";
  const [draft, setDraft] = useState(
    editing
      ? selected
      : {
          name: "",
          category: "Living",
          price: "",
          stock: "",
          description: "",
          image: "",
          color: "#D98955",
          accent: "#FFE0D3",
          sizes: ["One size"],
        },
  );
  const [query, setQuery] = useState("");
  if (route === "admin-add" || editing)
    return (
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.page}>
          <Header
            title={editing ? "Edit product" : "Add product"}
            back
            onBack={() => onGo("admin-catalog")}
          />
          <Text style={styles.muted}>
            Changes are saved to this device’s catalog fallback until a product
            API is connected.
          </Text>
          <Field
            label="Product name"
            placeholder="Product name"
            value={draft.name}
            onChangeText={(v) => setDraft({ ...draft, name: v })}
          />
          <Field
            label="Description"
            placeholder="A beautiful new thing"
            value={draft.description}
            onChangeText={(v) => setDraft({ ...draft, description: v })}
          />
          <Field
            label="Image URL (optional)"
            placeholder="https://example.com/product.jpg"
            value={typeof draft.image === "string" ? draft.image : ""}
            onChangeText={(v) => setDraft({ ...draft, image: v })}
          />
          <Text style={styles.fieldHint}>
            Paste an image URL to preview it. Image upload is not available;
            leave this empty to use the local-catalog fallback.
          </Text>
          {typeof draft.image === "string" && draft.image.length > 0 ? (
            <ProductArt product={draft} />
          ) : (
            <View style={styles.imageFallbackPreview}>
              <Text style={styles.muted}>Local-catalog fallback preview</Text>
            </View>
          )}
          <View style={styles.twoFields}>
            <Field
              label="Price ($)"
              placeholder="0"
              value={String(draft.price)}
              onChangeText={(v) => setDraft({ ...draft, price: v })}
            />
            <Field
              label="Stock"
              placeholder="0"
              value={String(draft.stock)}
              onChangeText={(v) => setDraft({ ...draft, stock: v })}
            />
          </View>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.optionRow}>
            {categories.slice(2).map((c) => (
              <Pressable
                key={c}
                onPress={() => setDraft({ ...draft, category: c })}
                style={[
                  styles.option,
                  draft.category === c && styles.optionSelected,
                ]}
              >
                <Text
                  style={
                    draft.category === c ? styles.optionSelectedText : undefined
                  }
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button
            label={editing ? "Save changes" : "Add product"}
            onPress={() => {
              if (!draft.name) return Alert.alert("Add a product name");
              saveProduct({ ...draft, price: Number(draft.price) });
              onGo("admin-catalog");
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  if (route === "admin-orders")
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Header title="Orders" subtitle="ADMIN" back onBack={onBack} />
        {orders.map((o) => (
          <View key={o.id} style={styles.orderRow}>
            <View>
              <Text style={styles.productName}>{o.id}</Text>
              <Text style={styles.muted}>
                {o.date} · {o.items} items
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.status}>{o.status}</Text>
              <Text style={styles.productPrice}>{money(o.total)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  if (route === "admin-catalog") {
    const list = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <View style={styles.flex}>
        <Header
          title="Catalog"
          subtitle="ADMIN"
          back
          onBack={() => onGo("admin")}
        />
        <View style={styles.search}>
          <Text>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products"
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.addInline} onPress={() => onGo("admin-add")}>
          <Text style={styles.addText}>＋ Add a product</Text>
        </Pressable>
        <FlatList
          data={list}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.catalogList}
          renderItem={({ item }) => (
            <View style={styles.catalogRow}>
              <ProductArt product={item} />
              <View style={styles.catalogCopy}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.muted}>
                  {item.stock} in stock · {money(item.price)}
                </Text>
                <View style={styles.inlineActions}>
                  <Text
                    style={styles.link}
                    onPress={() => onGo("admin-edit", item)}
                  >
                    Edit
                  </Text>
                  <Text
                    style={styles.remove}
                    onPress={() =>
                      Alert.alert(
                        "Delete product?",
                        `Remove ${item.name} from the catalog?`,
                        [
                          { text: "Cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                await removeProduct(item.id);
                              } catch (error) {
                                Alert.alert("Could not delete", error.message);
                              }
                            },
                          },
                        ],
                      )
                    }
                  >
                    Delete
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Header
        title="Store overview"
        subtitle="VELORA ADMIN"
        back
        onBack={onBack}
      />
      <Text style={styles.display}>Good morning,{`\n`}Avery.</Text>
      <View style={styles.metricGrid}>
        <Metric value="$4,280" label="Sales this month" />
        <Metric value="28" label="Orders to fulfil" />
        <Metric value="6" label="Low-stock pieces" />
        <Metric value="4.8" label="Customer rating" />
      </View>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionGrid}>
        <AdminAction
          label="Add product"
          icon="＋"
          onPress={() => onGo("admin-add")}
        />
        <AdminAction
          label="Catalog"
          icon="□"
          onPress={() => onGo("admin-catalog")}
        />
        <AdminAction
          label="Orders"
          icon="↗"
          onPress={() => onGo("admin-orders")}
        />
        <AdminAction
          label="Store preview"
          icon="◉"
          onPress={() => onGo("home")}
        />
      </View>
      <Text style={styles.sectionTitle}>Needs attention</Text>
      {products
        .filter((p) => p.stock < 5)
        .map((p) => (
          <View key={p.id} style={styles.attention}>
            <Text style={styles.productName}>{p.name}</Text>
            <Text style={styles.status}>
              {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
            </Text>
          </View>
        ))}
    </ScrollView>
  );
}
function Nav({ route, go }) {
  return (
    <View style={styles.nav}>
      {[
        ["home", "⌂", "Home"],
        ["shop", "⌕", "Shop"],
        ["favorites", "♡", "Saved"],
        ["profile", "◉", "Profile"],
      ].map(([r, i, l]) => (
        <Pressable key={r} style={styles.navItem} onPress={() => go(r)}>
          <Text style={[styles.navIcon, route === r && styles.navActive]}>
            {i}
          </Text>
          <Text style={[styles.navText, route === r && styles.navActive]}>
            {l}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
function Button({ label, onPress, kind, disabled }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        kind === "soft" && styles.buttonSoft,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[styles.buttonText, kind === "soft" && styles.buttonSoftText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
function Field({ label, placeholder, value, onChangeText, secure }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#817B75"
        secureTextEntry={secure}
        style={styles.input}
      />
    </View>
  );
}
function Qty({ value, setValue }) {
  return (
    <View style={styles.qty}>
      <Text
        onPress={() => setValue(Math.max(1, value - 1))}
        style={styles.qtyButton}
      >
        −
      </Text>
      <Text>{value}</Text>
      <Text onPress={() => setValue(value + 1)} style={styles.qtyButton}>
        ＋
      </Text>
    </View>
  );
}
function Empty({ icon, title, copy, action, onAction }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.muted}>{copy}</Text>
      {action && <Button label={action} onPress={onAction} />}
    </View>
  );
}
function Menu({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.menu}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.muted}>›</Text>
    </Pressable>
  );
}
function Metric({ value, label }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}
function AdminAction({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.adminAction}>
      <Text style={styles.adminIcon}>{icon}</Text>
      <Text style={styles.productName}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF9F3" },
  flex: { flex: 1 },
  page: { padding: 20, paddingBottom: 110, gap: 14 },
  header: {
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSide: { width: 72 },
  right: { alignItems: "flex-end" },
  headerTitle: { alignItems: "center", flex: 1 },
  headerText: { fontSize: 18, fontWeight: "800", color: "#182019" },
  headerActions: { flexDirection: "row", gap: 15, alignItems: "center" },
  icon: { fontSize: 29, color: "#182019" },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#416342",
  },
  display: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
    color: "#182019",
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#182019",
    marginTop: 10,
  },
  body: { fontSize: 15, lineHeight: 22, color: "#4E514C" },
  muted: { fontSize: 13, lineHeight: 19, color: "#817B75" },
  mutedLight: { fontSize: 15, lineHeight: 22, color: "#F4D7C9" },
  link: { color: "#BF4929", fontWeight: "800", fontSize: 13 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feature: {
    backgroundColor: "#182019",
    borderRadius: 25,
    minHeight: 230,
    overflow: "hidden",
    flexDirection: "row",
    marginVertical: 5,
  },
  featureCopy: { padding: 22, flex: 1, zIndex: 1 },
  featureTitle: {
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "800",
    color: "#FFF9F3",
    marginTop: 12,
  },
  featureLink: {
    color: "#FFD1BD",
    fontWeight: "800",
    fontSize: 13,
    marginTop: 22,
  },
  art: {
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#FFE0D3",
  },
  artImage: { width: "100%", height: "100%" },
  artLarge: { height: 230, borderRadius: 0, flex: 1, alignSelf: "stretch" },
  artShape: {
    width: "48%",
    height: "64%",
    borderRadius: 60,
    transform: [{ rotate: "-17deg" }],
    shadowColor: "#182019",
    shadowOpacity: 0.15,
    shadowRadius: 13,
    elevation: 4,
  },
  artMark: {
    position: "absolute",
    bottom: 12,
    fontSize: 9,
    letterSpacing: 2,
    color: "#182019",
    opacity: 0.55,
    fontWeight: "800",
  },
  collection: { gap: 10, paddingBottom: 8 },
  collectionPill: {
    width: 142,
    height: 88,
    borderRadius: 18,
    padding: 13,
    justifyContent: "space-between",
  },
  collectionNum: { fontSize: 10, fontWeight: "800", color: "#416342" },
  collectionText: { fontSize: 17, fontWeight: "800", color: "#182019" },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: { width: "48%", marginBottom: 20 },
  heart: {
    position: "absolute",
    right: 9,
    top: 8,
    width: 28,
    height: 28,
    backgroundColor: "#FFF9F3DD",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#182019",
    marginTop: 8,
  },
  productPrice: { fontSize: 14, color: "#182019", marginTop: 3 },
  sold: { fontSize: 11, color: "#BF4929", fontWeight: "800", marginTop: 3 },
  search: {
    marginHorizontal: 20,
    backgroundColor: "#EEE9E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#182019" },
  chips: { padding: 14, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#DDD7CF",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: "#182019", borderColor: "#182019" },
  chipText: { fontSize: 13, color: "#182019" },
  chipTextActive: { color: "#FFF9F3", fontWeight: "800" },
  gridList: { padding: 20, paddingBottom: 100 },
  productDetail: { paddingTop: 19, gap: 17 },
  detailName: {
    fontSize: 27,
    fontWeight: "800",
    color: "#182019",
    letterSpacing: -0.5,
  },
  detailPrice: { fontSize: 20, fontWeight: "800", color: "#182019" },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#416342",
    marginTop: 8,
  },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    borderWidth: 1,
    borderColor: "#D8D1C8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  optionSelected: { borderColor: "#182019", backgroundColor: "#182019" },
  optionSelectedText: { color: "#FFF9F3", fontWeight: "800" },
  fieldHint: { fontSize: 12, lineHeight: 17, color: "#817B75", marginTop: -5 },
  imageFallbackPreview: {
    height: 100,
    borderRadius: 12,
    backgroundColor: "#EEE9E1",
    alignItems: "center",
    justifyContent: "center",
  },
  delivery: {
    fontSize: 12,
    lineHeight: 18,
    color: "#817B75",
    textAlign: "center",
  },
  qty: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8D1C8",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  qtyButton: { fontSize: 18, color: "#BF4929", fontWeight: "800" },
  button: {
    backgroundColor: "#EF653D",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonSoft: { backgroundColor: "#FFE0D3" },
  buttonDisabled: { backgroundColor: "#BBB6B0" },
  buttonText: { color: "white", fontWeight: "800", fontSize: 15 },
  buttonSoftText: { color: "#182019" },
  cartList: { padding: 20, gap: 14 },
  cartItem: { flexDirection: "row", gap: 14 },
  cartInfo: { flex: 1 },
  remove: { fontSize: 12, color: "#BF4929", fontWeight: "800", marginTop: 5 },
  checkoutBar: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#E5DED6",
    gap: 7,
  },
  field: { flex: 1, gap: 6, marginTop: 7 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D8D1C8",
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 15,
    color: "#182019",
    backgroundColor: "#FFFDF9",
  },
  twoFields: { flexDirection: "row", gap: 10 },
  payment: {
    borderWidth: 1,
    borderColor: "#D8D1C8",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderTotal: {
    marginTop: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#DDD7CF",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirm: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    gap: 17,
    backgroundColor: "#FFF9F3",
  },
  check: {
    fontSize: 25,
    color: "#FFF9F3",
    backgroundColor: "#416342",
    width: 48,
    height: 48,
    textAlign: "center",
    paddingTop: 10,
    borderRadius: 24,
  },
  orderCard: {
    backgroundColor: "#EEE9E1",
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
    gap: 12,
  },
  emptyIcon: { fontSize: 38, color: "#416342" },
  notificationList: { padding: 20, gap: 10 },
  notification: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F2EEE8",
  },
  unread: { backgroundColor: "#FFE0D3" },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF653D",
    marginTop: 6,
  },
  profileTop: { alignItems: "center", paddingVertical: 20, gap: 5 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#416342",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF9F3", fontWeight: "800", fontSize: 20 },
  menu: {
    height: 55,
    borderBottomWidth: 1,
    borderColor: "#E5DED6",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  menuIcon: { fontSize: 19, width: 25, color: "#416342" },
  menuText: { flex: 1, color: "#182019", fontWeight: "700" },
  adminCallout: {
    backgroundColor: "#DDE5D5",
    borderRadius: 18,
    padding: 19,
    gap: 8,
    marginBottom: 8,
  },
  calloutTitle: { fontSize: 20, fontWeight: "800", color: "#182019" },
  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF653D",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, color: "white", fontWeight: "800" },
  nav: {
    height: 68,
    backgroundColor: "#FFF9F3",
    borderTopWidth: 1,
    borderColor: "#E6DED5",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 7,
  },
  navItem: { alignItems: "center", width: 65 },
  navIcon: { fontSize: 20, color: "#817B75" },
  navText: { fontSize: 10, color: "#817B75", marginTop: 2 },
  navActive: { color: "#EF653D", fontWeight: "800" },
  toast: {
    position: "absolute",
    bottom: 85,
    left: 24,
    right: 24,
    backgroundColor: "#182019",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  toastText: { color: "#FFF9F3", fontWeight: "700" },
  auth: { flex: 1, backgroundColor: "#182019", justifyContent: "flex-end" },
  authHero: { padding: 30, paddingBottom: 50, gap: 14 },
  logo: { fontSize: 15, letterSpacing: 4, color: "#EF653D", fontWeight: "800" },
  authCard: {
    backgroundColor: "#FFF9F3",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    gap: 13,
  },
  centerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#817B75",
    marginTop: 8,
  },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: {
    width: "48%",
    backgroundColor: "#EEE9E1",
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    justifyContent: "space-between",
  },
  metricValue: { fontSize: 23, fontWeight: "800", color: "#182019" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  adminAction: {
    width: "48%",
    backgroundColor: "#FFE0D3",
    borderRadius: 16,
    padding: 16,
    height: 110,
    justifyContent: "space-between",
  },
  adminIcon: { fontSize: 24, color: "#BF4929" },
  attention: {
    backgroundColor: "#F2EEE8",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: { fontSize: 12, fontWeight: "800", color: "#416342" },
  orderRow: {
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: "#E5DED6",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderRight: { alignItems: "flex-end" },
  addInline: {
    margin: 20,
    marginBottom: 5,
    backgroundColor: "#182019",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addText: { color: "#FFF9F3", fontWeight: "800" },
  catalogList: { padding: 20, gap: 14 },
  catalogRow: { flexDirection: "row", gap: 12 },
  catalogCopy: { flex: 1 },
  inlineActions: { flexDirection: "row", gap: 18, marginTop: 8 },
});

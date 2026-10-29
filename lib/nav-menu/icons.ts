// lib/nav-menu/icons.ts
//
// Font Awesome isn't installed, but `react-icons/fa6` ships the same free solid
// glyphs. This registry maps Font Awesome class strings (what we store in the
// JSON, e.g. "fa-solid fa-house") to React components for the icon picker and
// the preview. It is intentionally curated rather than "every icon" so the
// bundle stays small; anything not listed still works as a stored class string
// (the preview just shows a placeholder).
//
// If TypeScript reports that a name below isn't exported by react-icons/fa6,
// delete that import and its entry; nothing else depends on a specific icon.

import type { IconType } from "react-icons";
import {
  FaAddressBook,
  FaArrowUpRightFromSquare,
  FaAward,
  FaBaby,
  FaBagShopping,
  FaBars,
  FaBasketShopping,
  FaBell,
  FaBicycle,
  FaBolt,
  FaBook,
  FaBookOpen,
  FaBookmark,
  FaBox,
  FaBoxesStacked,
  FaBriefcase,
  FaBuilding,
  FaBullhorn,
  FaCalendar,
  FaCalendarDays,
  FaCamera,
  FaCar,
  FaCartShopping,
  FaChartColumn,
  FaChartLine,
  FaChartPie,
  FaChartSimple,
  FaChild,
  FaCircleCheck,
  FaCircleInfo,
  FaCircleQuestion,
  FaClock,
  FaCloud,
  FaCode,
  FaCoins,
  FaComment,
  FaComments,
  FaCompass,
  FaCouch,
  FaCreditCard,
  FaDatabase,
  FaDownload,
  FaDumbbell,
  FaEarthAmericas,
  FaEnvelope,
  FaEye,
  FaFile,
  FaFileContract,
  FaFileInvoice,
  FaFileLines,
  FaFilm,
  FaFire,
  FaFlag,
  FaFolder,
  FaFolderOpen,
  FaGamepad,
  FaGauge,
  FaGear,
  FaGears,
  FaGem,
  FaGift,
  FaGlobe,
  FaGraduationCap,
  FaHandshake,
  FaHeadphones,
  FaHeadset,
  FaHeart,
  FaHeartPulse,
  FaHospital,
  FaHouse,
  FaIdCard,
  FaImage,
  FaImages,
  FaIndustry,
  FaKey,
  FaLandmark,
  FaLaptop,
  FaLayerGroup,
  FaLeaf,
  FaLightbulb,
  FaLink,
  FaList,
  FaListCheck,
  FaLocationDot,
  FaLock,
  FaMagnifyingGlass,
  FaMap,
  FaMicrophone,
  FaMobileScreen,
  FaMoneyBill,
  FaMugHot,
  FaMusic,
  FaNewspaper,
  FaPalette,
  FaPaperPlane,
  FaPaw,
  FaPen,
  FaPenToSquare,
  FaPercent,
  FaPeopleGroup,
  FaPhone,
  FaPiggyBank,
  FaPlane,
  FaPlug,
  FaPodcast,
  FaPrint,
  FaPuzzlePiece,
  FaReceipt,
  FaRightFromBracket,
  FaRightToBracket,
  FaRocket,
  FaScaleBalanced,
  FaScrewdriverWrench,
  FaServer,
  FaShareNodes,
  FaShieldHalved,
  FaShirt,
  FaShop,
  FaSitemap,
  FaSliders,
  FaStar,
  FaStethoscope,
  FaStore,
  FaTableCells,
  FaTag,
  FaTags,
  FaTerminal,
  FaTrophy,
  FaTruck,
  FaTruckFast,
  FaTriangleExclamation,
  FaTv,
  FaUpload,
  FaUser,
  FaUserGear,
  FaUserGroup,
  FaUserPlus,
  FaUserShield,
  FaUserTie,
  FaUtensils,
  FaUsers,
  FaUsersGear,
  FaVideo,
  FaWallet,
  FaWarehouse,
  FaWrench,
} from "react-icons/fa6";

export interface NavIconDefinition {
  /** Font Awesome icon name without prefix, e.g. "house". */
  name: string;
  /** The class string stored in the menu JSON, e.g. "fa-solid fa-house". */
  className: string;
  label: string;
  /** Lowercased text the picker's search matches against. */
  searchText: string;
  Icon: IconType;
}

function icon(
  name: string,
  label: string,
  Icon: IconType,
  keywords = "",
): NavIconDefinition {
  return {
    name,
    className: `fa-solid fa-${name}`,
    label,
    searchText: `${name} ${label} ${keywords}`.toLowerCase(),
    Icon,
  };
}

export const NAV_ICONS: readonly NavIconDefinition[] = [
  // General and interface
  icon("house", "Home", FaHouse, "main start"),
  icon("magnifying-glass", "Search", FaMagnifyingGlass, "find"),
  icon("bars", "Menu", FaBars, "hamburger navigation"),
  icon("gear", "Settings", FaGear, "cog preferences"),
  icon("gears", "Advanced settings", FaGears, "cogs"),
  icon("sliders", "Controls", FaSliders, "preferences filter"),
  icon("bell", "Notifications", FaBell, "alerts"),
  icon("star", "Star", FaStar, "favorite featured"),
  icon("heart", "Heart", FaHeart, "favorite like wishlist"),
  icon("bookmark", "Bookmark", FaBookmark, "save"),
  icon("flag", "Flag", FaFlag, "report"),
  icon("link", "Link", FaLink, "url chain"),
  icon("circle-info", "Info", FaCircleInfo, "about information"),
  icon("circle-question", "Help", FaCircleQuestion, "faq question support"),
  icon("circle-check", "Check", FaCircleCheck, "done success"),
  icon(
    "triangle-exclamation",
    "Warning",
    FaTriangleExclamation,
    "alert caution",
  ),
  icon("lock", "Lock", FaLock, "secure private"),
  icon("key", "Key", FaKey, "access password"),
  icon("eye", "View", FaEye, "visibility watch"),
  icon("shield-halved", "Security", FaShieldHalved, "protection privacy"),
  icon("bolt", "Bolt", FaBolt, "fast power energy"),
  icon("fire", "Fire", FaFire, "hot trending"),
  icon("rocket", "Rocket", FaRocket, "launch startup"),
  icon("lightbulb", "Idea", FaLightbulb, "tips innovation"),
  icon("globe", "Globe", FaGlobe, "web international"),
  icon("earth-americas", "World", FaEarthAmericas, "earth global"),
  icon("location-dot", "Location", FaLocationDot, "map pin address"),
  icon("map", "Map", FaMap, "directions"),
  icon("compass", "Compass", FaCompass, "explore"),
  icon("right-to-bracket", "Sign in", FaRightToBracket, "login"),
  icon("right-from-bracket", "Sign out", FaRightFromBracket, "logout"),
  icon(
    "arrow-up-right-from-square",
    "External link",
    FaArrowUpRightFromSquare,
    "open new tab",
  ),
  icon("share-nodes", "Share", FaShareNodes, "social"),

  // People
  icon("user", "User", FaUser, "profile account person"),
  icon("users", "Users", FaUsers, "team people customers"),
  icon("user-group", "User group", FaUserGroup, "community"),
  icon("user-plus", "Add user", FaUserPlus, "invite register"),
  icon("user-gear", "User settings", FaUserGear, "account"),
  icon("users-gear", "Roles", FaUsersGear, "permissions team settings"),
  icon("user-shield", "Admin", FaUserShield, "protected user"),
  icon("user-tie", "Professional", FaUserTie, "business careers"),
  icon("handshake", "Partners", FaHandshake, "deal agreement"),
  icon("people-group", "Team", FaPeopleGroup, "group community"),
  icon("address-book", "Contacts", FaAddressBook, "directory"),
  icon("id-card", "ID card", FaIdCard, "identity"),
  icon(
    "graduation-cap",
    "Education",
    FaGraduationCap,
    "school course learning",
  ),
  icon("child", "Kids", FaChild, "children"),
  icon("baby", "Baby", FaBaby, "infant"),

  // Business and finance
  icon("building", "Company", FaBuilding, "office about"),
  icon("briefcase", "Business", FaBriefcase, "services work"),
  icon("industry", "Industry", FaIndustry, "factory manufacturing"),
  icon("landmark", "Institution", FaLandmark, "bank government"),
  icon("store", "Store", FaStore, "shop retail"),
  icon("shop", "Shop", FaShop, "storefront"),
  icon("warehouse", "Warehouse", FaWarehouse, "inventory"),
  icon("sitemap", "Sitemap", FaSitemap, "structure hierarchy"),
  icon("chart-line", "Analytics", FaChartLine, "growth trends"),
  icon("chart-pie", "Reports", FaChartPie, "statistics"),
  icon("chart-simple", "Chart", FaChartSimple, "stats"),
  icon("chart-column", "Bar chart", FaChartColumn, "metrics"),
  icon("gauge", "Dashboard", FaGauge, "speed overview"),
  icon("scale-balanced", "Legal", FaScaleBalanced, "law terms"),
  icon("file-contract", "Contract", FaFileContract, "agreement terms"),
  icon("file-invoice", "Invoice", FaFileInvoice, "billing"),
  icon("receipt", "Receipt", FaReceipt, "orders payment"),
  icon("money-bill", "Money", FaMoneyBill, "cash price"),
  icon("credit-card", "Payment", FaCreditCard, "billing card"),
  icon("wallet", "Wallet", FaWallet, "funds"),
  icon("coins", "Coins", FaCoins, "pricing"),
  icon("piggy-bank", "Savings", FaPiggyBank, "finance"),
  icon("percent", "Discount", FaPercent, "offer sale"),
  icon("trophy", "Trophy", FaTrophy, "awards achievements"),
  icon("award", "Award", FaAward, "certification"),
  icon("bullhorn", "Announcements", FaBullhorn, "marketing news"),

  // Commerce
  icon("bag-shopping", "Shopping bag", FaBagShopping, "shop store"),
  icon("cart-shopping", "Cart", FaCartShopping, "checkout orders"),
  icon("basket-shopping", "Basket", FaBasketShopping, "groceries"),
  icon("tag", "Tag", FaTag, "price label sale"),
  icon("tags", "Tags", FaTags, "brands categories"),
  icon("gift", "Gift", FaGift, "present"),
  icon("box", "Package", FaBox, "product delivery"),
  icon("boxes-stacked", "Inventory", FaBoxesStacked, "stock"),
  icon("truck", "Delivery", FaTruck, "shipping"),
  icon("truck-fast", "Fast delivery", FaTruckFast, "express shipping"),
  icon("shirt", "Clothing", FaShirt, "fashion apparel"),
  icon("gem", "Jewelry", FaGem, "premium"),
  icon("couch", "Furniture", FaCouch, "home living"),
  icon("utensils", "Dining", FaUtensils, "restaurant food"),
  icon("mug-hot", "Coffee", FaMugHot, "cafe drinks"),
  icon("laptop", "Laptop", FaLaptop, "computers electronics"),
  icon("mobile-screen", "Mobile", FaMobileScreen, "phone app"),
  icon("headphones", "Audio", FaHeadphones, "music"),
  icon("camera", "Camera", FaCamera, "photo"),
  icon("gamepad", "Gaming", FaGamepad, "games"),
  icon("tv", "TV", FaTv, "television electronics"),

  // Content and media
  icon("file", "File", FaFile, "document"),
  icon("file-lines", "Document", FaFileLines, "pages posts text"),
  icon("folder", "Folder", FaFolder, "category"),
  icon("folder-open", "Open folder", FaFolderOpen, "files"),
  icon("book", "Book", FaBook, "guide docs"),
  icon("book-open", "Resources", FaBookOpen, "reading learn docs"),
  icon("newspaper", "News", FaNewspaper, "blog articles press"),
  icon("image", "Image", FaImage, "media photo"),
  icon("images", "Gallery", FaImages, "photos"),
  icon("video", "Video", FaVideo, "watch"),
  icon("film", "Film", FaFilm, "movies"),
  icon("music", "Music", FaMusic, "audio"),
  icon("microphone", "Microphone", FaMicrophone, "voice"),
  icon("podcast", "Podcast", FaPodcast, "episodes"),
  icon("comment", "Comment", FaComment, "message chat"),
  icon("comments", "Discussion", FaComments, "forum chat"),
  icon("envelope", "Email", FaEnvelope, "contact mail"),
  icon("phone", "Phone", FaPhone, "call contact"),
  icon("paper-plane", "Send", FaPaperPlane, "message"),
  icon("pen", "Edit", FaPen, "write"),
  icon("pen-to-square", "Edit content", FaPenToSquare, "compose"),
  icon("palette", "Appearance", FaPalette, "theme colors design"),
  icon("calendar", "Calendar", FaCalendar, "date"),
  icon("calendar-days", "Events", FaCalendarDays, "schedule"),
  icon("clock", "Time", FaClock, "hours history"),
  icon("table-cells", "Table", FaTableCells, "grid data"),
  icon("list", "List", FaList, "items"),
  icon("list-check", "Tasks", FaListCheck, "checklist"),

  // Technology and tools
  icon("layer-group", "Layers", FaLayerGroup, "stack components"),
  icon("puzzle-piece", "Integrations", FaPuzzlePiece, "plugins extensions"),
  icon("code", "Code", FaCode, "developers api"),
  icon("terminal", "Terminal", FaTerminal, "command line"),
  icon("database", "Database", FaDatabase, "data storage"),
  icon("server", "Server", FaServer, "hosting"),
  icon("cloud", "Cloud", FaCloud, "hosting storage"),
  icon("plug", "Plugin", FaPlug, "connect power"),
  icon("wrench", "Tools", FaWrench, "maintenance"),
  icon(
    "screwdriver-wrench",
    "Support tools",
    FaScrewdriverWrench,
    "repair service",
  ),
  icon("headset", "Support", FaHeadset, "customer service help"),
  icon("download", "Download", FaDownload, "get"),
  icon("upload", "Upload", FaUpload, "import"),
  icon("print", "Print", FaPrint, "printer"),

  // Health and lifestyle
  icon("hospital", "Hospital", FaHospital, "health clinic"),
  icon("stethoscope", "Medical", FaStethoscope, "doctor health"),
  icon("heart-pulse", "Health", FaHeartPulse, "wellness"),
  icon("dumbbell", "Fitness", FaDumbbell, "gym"),
  icon("leaf", "Eco", FaLeaf, "nature sustainability"),
  icon("paw", "Pets", FaPaw, "animals"),
  icon("car", "Automotive", FaCar, "cars"),
  icon("plane", "Travel", FaPlane, "flights"),
  icon("bicycle", "Cycling", FaBicycle, "bikes"),
];

const ICON_BY_NAME: ReadonlyMap<string, NavIconDefinition> = new Map(
  NAV_ICONS.map((definition) => [definition.name, definition]),
);

// Style and utility classes that are not the icon's name.
const NON_NAME_TOKEN =
  /^fa-(?:solid|regular|brands|light|thin|duotone|fw|spin|pulse|\d+x|xs|sm|lg|xl|2xs|2xl)$/;

function extractIconName(className: string): string | null {
  for (const token of className.trim().split(/\s+/)) {
    const match = /^fa-([a-z0-9-]+)$/.exec(token);
    if (match && !NON_NAME_TOKEN.test(token)) return match[1];
  }
  return null;
}

/**
 * Resolves a stored class string to a renderable icon. Style variants
 * (fa-regular, fa-fw, ...) resolve to the solid glyph in the preview.
 * Returns undefined for icons outside the curated set.
 */
export function getNavIcon(
  className: string | null | undefined,
): NavIconDefinition | undefined {
  if (!className) return undefined;
  const name = extractIconName(className);
  return name ? ICON_BY_NAME.get(name) : undefined;
}

/** Every search term must appear in the icon's name, label or keywords. */
export function searchNavIcons(query: string): readonly NavIconDefinition[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return NAV_ICONS;
  return NAV_ICONS.filter((definition) =>
    terms.every((term) => definition.searchText.includes(term)),
  );
}

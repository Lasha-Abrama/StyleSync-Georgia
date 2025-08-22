import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI only if API key is available
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn("OpenAI initialization failed:", error.message);
}

// Load products data
function loadProducts() {
  try {
    const productsPath = path.join(__dirname, "..", "data", "products.json");
    const raw = fs.readFileSync(productsPath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read products.json", e);
    return [];
  }
}

// Get product categories
function getProductCategories() {
  const products = loadProducts();
  const categories = {};

  products.forEach((product) => {
    if (!categories[product.category]) {
      categories[product.category] = [];
    }
    categories[product.category].push(product);
  });

  return categories;
}

function getDesiredCategoriesForSeason(season) {
  const s = (season || "auto").toLowerCase();
  if (s === "spring" || s === "fall") {
    return ["jackets", "shirts", "pants", "shoes"]; // pants may be missing in catalog
  }
  if (s === "summer") {
    return ["shirts", "pants", "shoes"]; // pants may be missing
  }
  if (s === "winter") {
    return ["headwear", "jackets", "sweaters", "jeans", "shoes"]; // jeans may be missing
  }
  // auto/default: try to make a reasonable outfit
  return ["shirts", "jackets", "shoes"];
}

function pickRandomProductFromList(list, excludeId) {
  if (!list || list.length === 0) return null;
  const filtered = excludeId ? list.filter((p) => p.id !== excludeId) : list;
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function resolveCategoryProducts(
  desiredCategories,
  categories,
  startingProduct
) {
  const resultByCategoryName = {};
  const missing = [];

  // Map synonyms in desired to actual catalog category keys
  const synonyms = {
    pants: ["pants", "jeans", "trousers"],
    jeans: ["jeans", "pants"],
  };

  // Seed with starting product if it matches any desired category
  desiredCategories.forEach((desired) => {
    const desiredKey = desired.toLowerCase();
    // Direct match
    if (startingProduct && startingProduct.category === desiredKey) {
      resultByCategoryName[desiredKey] = startingProduct;
      return;
    }
    // Synonym match
    const syns = synonyms[desiredKey];
    if (syns && startingProduct && syns.includes(startingProduct.category)) {
      resultByCategoryName[desiredKey] = startingProduct;
    }
  });

  // Fill remaining with random picks
  desiredCategories.forEach((desired) => {
    const desiredKey = desired.toLowerCase();
    if (resultByCategoryName[desiredKey]) return; // already filled by starting product

    // Try direct category first
    if (categories[desiredKey] && categories[desiredKey].length) {
      resultByCategoryName[desiredKey] = pickRandomProductFromList(
        categories[desiredKey],
        startingProduct?.id
      );
      if (!resultByCategoryName[desiredKey]) missing.push(desiredKey);
      return;
    }

    // Try synonyms mapping if any
    const syns = synonyms[desiredKey] || [];
    let picked = null;
    for (const alt of syns) {
      if (categories[alt] && categories[alt].length) {
        picked = pickRandomProductFromList(
          categories[alt],
          startingProduct?.id
        );
        if (picked) break;
      }
    }
    if (picked) {
      resultByCategoryName[desiredKey] = picked;
    } else {
      missing.push(desiredKey);
    }
  });

  return { resultByCategoryName, missing };
}

// Generate outfit based on a starting product
export async function generateOutfit(
  startingProductId,
  style = "casual",
  language = "ka",
  season = "auto"
) {
  try {
    const products = loadProducts();
    const startingProduct = products.find((p) => p.id === startingProductId);

    if (!startingProduct) {
      throw new Error("Starting product not found");
    }

    const categories = getProductCategories();
    const desired = getDesiredCategoriesForSeason(season);

    const { resultByCategoryName, missing } = resolveCategoryProducts(
      desired,
      categories,
      startingProduct
    );

    // Build a basic outfit object with product titles (for compatibility)
    const outfitByName = {};
    Object.entries(resultByCategoryName).forEach(([cat, prod]) => {
      if (prod) outfitByName[cat] = prod.title;
    });

    // If OpenAI is available, ask for styling tips only, not for selection
    let stylingTips =
      language === "ka"
        ? "შექმნილია სეზონის მიხედვით შერჩეული პროდუქტებით. დაამატეთ აქსესუარები სურვილისამებრ."
        : "Selected items tailored to the season. Add accessories as you like.";

    if (openai) {
      try {
        const prompt = `Provide 2-3 concise styling tips for this outfit in ${
          language === "ka" ? "Georgian" : "English"
        } based on the season (${season}) and style (${style}). Keep it short and practical.`;
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a fashion stylist." },
            { role: "user", content: prompt },
          ],
          max_tokens: 120,
        });
        stylingTips =
          completion.choices[0].message.content?.trim() || stylingTips;
      } catch (_) {
        // keep default tips
      }
    }

    // Enhance outfit with product details and images
    const enhancedOutfit = enhanceOutfitWithDetails(
      { outfit: outfitByName },
      products
    );

    return {
      success: true,
      outfit: {
        ...enhancedOutfit,
        missing_categories: missing,
        season,
        style,
      },
      startingProduct: startingProduct,
      style: style,
      language: language,
      note:
        missing.length > 0
          ? language === "ka"
            ? "ზოგიერთი კატეგორია ვერ მოიძებნა სტოკში (მაგ.: ჯინსი/შარვალი). გამოვიყენეთ ხელმისაწვდომი პროდუქტები."
            : "Some categories are not in stock (e.g., jeans/pants). Used available items."
          : undefined,
      styling_tips: stylingTips,
    };
  } catch (error) {
    console.error("Outfit generation error:", error);
    return {
      success: false,
      error: error.message,
      message:
        language === "ka"
          ? "ბოდიში, ვერ შევძელით კომპლექტის გენერირება. გთხოვთ სცადოთ მოგვიანებით."
          : "Sorry, we couldn't generate an outfit. Please try again later.",
    };
  }
}

// Calculate total price of the outfit
function calculateOutfitPrice(outfit, products) {
  if (!outfit) return 0;

  let total = 0;
  Object.values(outfit).forEach((itemName) => {
    if (
      itemName !== "No top available" &&
      itemName !== "No jacket available" &&
      itemName !== "No headwear available" &&
      itemName !== "No shoes available"
    ) {
      const product = products.find((p) => p.title === itemName);
      if (product) {
        total += product.price;
      }
    }
  });

  return total;
}

// Enhance outfit with product details and images
function enhanceOutfitWithDetails(outfitData, products) {
  if (!outfitData.outfit) return outfitData;

  const enhanced = { ...outfitData };
  enhanced.outfit = {};

  Object.entries(outfitData.outfit).forEach(([category, itemName]) => {
    if (
      itemName &&
      itemName !== "No top available" &&
      itemName !== "No jacket available" &&
      itemName !== "No headwear available" &&
      itemName !== "No shoes available"
    ) {
      const product = products.find((p) => p.title === itemName);
      if (product) {
        enhanced.outfit[category] = {
          name: product.title,
          price: product.price,
          image: product.images[0],
          slug: product.slug,
          description: product.description_ka || product.description_en,
        };
      } else {
        enhanced.outfit[category] = itemName;
      }
    } else {
      enhanced.outfit[category] = itemName;
    }
  });

  return enhanced;
}

// Generate random outfit without starting product
export async function generateRandomOutfit(style = "casual", language = "ka") {
  try {
    const products = loadProducts();
    const categories = getProductCategories();

    // Select random products from each category
    const randomOutfit = {
      top: pickRandomProductFromList(categories.shirts),
      jacket: pickRandomProductFromList(categories.jackets),
      headwear: pickRandomProductFromList(categories.headwear),
      shoes: pickRandomProductFromList(categories.shoes),
    };

    // Filter out undefined products
    Object.keys(randomOutfit).forEach((key) => {
      if (!randomOutfit[key]) {
        delete randomOutfit[key];
      }
    });

    const asNames = Object.fromEntries(
      Object.entries(randomOutfit).map(([k, v]) => [k, v?.title])
    );

    const enhancedOutfit = enhanceOutfitWithDetails(
      { outfit: asNames },
      products
    );

    return {
      success: true,
      outfit: enhancedOutfit,
      style: style,
      language: language,
    };
  } catch (error) {
    console.error("Random outfit generation error:", error);
    return {
      success: false,
      error: error.message,
      message:
        language === "ka"
          ? "ბოდიში, ვერ შევძელით კომპლექტის გენერირება. გთხოვთ სცადოთ მოგვიანებით."
          : "Sorry, we couldn't generate an outfit. Please try again later.",
    };
  }
}

// Get random product from a category
function getRandomProduct(products) {
  if (!products || products.length === 0) return null;
  return products[Math.floor(Math.random() * products.length)];
}

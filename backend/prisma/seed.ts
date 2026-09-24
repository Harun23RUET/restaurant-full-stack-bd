import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Biryani",
    description: "Authentic Bangladeshi and Indian style biryani",
    sortOrder: 1,
  },
  {
    name: "Kebabs",
    description: "Freshly grilled kebabs and tandoori items",
    sortOrder: 2,
  },
  {
    name: "Main Course",
    description: "Rich curries and traditional main dishes",
    sortOrder: 3,
  },
  {
    name: "Drinks",
    description: "Refreshing drinks and traditional beverages",
    sortOrder: 4,
  },
];

const items = [
  {
    category: "Biryani",
    name: "Royal Dum Biryani",
    price: 320,
    description: "Aromatic royal dum biryani prepared with fragrant rice and rich spices.",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 1,
  },
  {
    category: "Biryani",
    name: "Mutton Biryani",
    price: 380,
    description: "Tender mutton cooked with aromatic basmati rice and traditional spices.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 2,
  },
  {
    category: "Biryani",
    name: "Beef Biryani",
    price: 350,
    description: "Flavorful beef biryani prepared with fragrant rice and traditional spices.",
    imageUrl: "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=900&q=85",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 3,
  },
  {
    category: "Biryani",
    name: "Chicken Biryani",
    price: 250,
    description: "Classic chicken biryani with aromatic rice and flavorful spices.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 4,
  },
  {
    category: "Biryani",
    name: "Egg Biryani",
    price: 220,
    description: "Aromatic biryani served with seasoned eggs.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Egg_biryani.jpg",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 5,
  },
  {
    category: "Biryani",
    name: "Vegetable Biryani",
    price: 200,
    description: "Fragrant rice cooked with fresh seasonal vegetables and spices.",
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=85",
    isVegetarian: true,
    spiceLevel: 2,
    sortOrder: 6,
  },
  {
    category: "Biryani",
    name: "Handi Dum Biryani",
    price: 350,
    description: "Slow-cooked dum biryani prepared in traditional handi style.",
    imageUrl: "/hero-biryani.png",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 7,
  },
  {
    category: "Kebabs",
    name: "Chicken Tikka",
    price: 280,
    description: "Juicy chicken pieces marinated with aromatic spices and grilled to perfection.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 1,
  },
  {
    category: "Kebabs",
    name: "Chicken Reshmi Kebab",
    price: 300,
    description: "Soft and creamy minced chicken kebab with delicate spices.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 1,
    sortOrder: 2,
  },
  {
    category: "Kebabs",
    name: "Seekh Kebab",
    price: 320,
    description: "Traditional minced meat kebab grilled on skewers.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 3,
  },
  {
    category: "Kebabs",
    name: "Shami Kebab",
    price: 280,
    description: "Tender traditional kebab made with minced meat and aromatic spices.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 4,
  },
  {
    category: "Kebabs",
    name: "Tandoori Chicken",
    price: 350,
    description: "Classic tandoori chicken marinated in spices and roasted until juicy.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 5,
  },
  {
    category: "Kebabs",
    name: "Beef Burger",
    price: 320,
    description: "Juicy beef burger served with fresh toppings.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 1,
    sortOrder: 6,
  },
  {
    category: "Kebabs",
    name: "Chicken Pasta",
    price: 280,
    description: "Creamy pasta prepared with tender chicken and herbs.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 1,
    sortOrder: 7,
  },
  {
    category: "Kebabs",
    name: "Vegetable Pasta",
    price: 220,
    description: "Delicious pasta prepared with fresh vegetables and herbs.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 1,
    sortOrder: 8,
  },
  {
    category: "Main Course",
    name: "Butter Chicken",
    price: 320,
    description: "Creamy chicken curry cooked in a rich buttery tomato sauce.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 1,
  },
  {
    category: "Main Course",
    name: "Chicken Curry",
    price: 280,
    description: "Traditional chicken curry cooked with aromatic spices.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 2,
  },
  {
    category: "Main Course",
    name: "Mutton Curry",
    price: 380,
    description: "Tender mutton slow-cooked in a rich traditional curry.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 2,
    sortOrder: 3,
  },
  {
    category: "Main Course",
    name: "Beef Bhuna",
    price: 350,
    description: "Slow-cooked beef bhuna with rich roasted spices.",
    imageUrl: "",
    isVegetarian: false,
    spiceLevel: 3,
    sortOrder: 4,
  },
  {
    category: "Main Course",
    name: "Paneer Butter Masala",
    price: 280,
    description: "Soft paneer cooked in a creamy buttery masala sauce.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 1,
    sortOrder: 5,
  },
  {
    category: "Drinks",
    name: "Mango Lassi",
    price: 140,
    description: "Refreshing creamy mango lassi.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 0,
    sortOrder: 1,
  },
  {
    category: "Drinks",
    name: "Sweet Lassi",
    price: 120,
    description: "Traditional chilled sweet lassi.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 0,
    sortOrder: 2,
  },
  {
    category: "Drinks",
    name: "Lemon Mint",
    price: 100,
    description: "Refreshing lemon and mint cooler.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 0,
    sortOrder: 3,
  },
  {
    category: "Drinks",
    name: "Fresh Lime",
    price: 90,
    description: "Freshly prepared chilled lime drink.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 0,
    sortOrder: 4,
  },
  {
    category: "Drinks",
    name: "Masala Tea",
    price: 70,
    description: "Hot traditional tea prepared with aromatic spices.",
    imageUrl: "",
    isVegetarian: true,
    spiceLevel: 0,
    sortOrder: 5,
  },
];

async function main() {
  console.log("===== MENU SEED START =====");

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const saved = await prisma.menuCategory.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });

    categoryMap.set(category.name, saved.id);
    console.log(`Category ready: ${category.name}`);
  }

  for (const item of items) {
    const categoryId = categoryMap.get(item.category);

    if (!categoryId) {
      throw new Error(`Category not found: ${item.category}`);
    }

    const existing = await prisma.menuItem.findFirst({
      where: {
        name: item.name,
        categoryId,
      },
    });

    if (existing) {
      await prisma.menuItem.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl || null,
          isVegetarian: item.isVegetarian,
          spiceLevel: item.spiceLevel,
          isAvailable: true,
          sortOrder: item.sortOrder,
        },
      });

      console.log(`Updated: ${item.name}`);
    } else {
      await prisma.menuItem.create({
        data: {
          categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl || null,
          isVegetarian: item.isVegetarian,
          spiceLevel: item.spiceLevel,
          isAvailable: true,
          sortOrder: item.sortOrder,
        },
      });

      console.log(`Created: ${item.name}`);
    }
  }

  console.log(`===== MENU SEED COMPLETE: ${items.length} ITEMS =====`);
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "rider@restaurant.com";
  const password = "Rider@12345";
  const name = "Rajshahi Delivery Rider";
  const phone = "01700000000";

  console.log("Creating DELIVERY_STAFF account...");

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  let user;

  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        phone,
        passwordHash,
        status: "ACTIVE",
        role: "DELIVERY_STAFF",
      },
    });

    console.log("Existing user updated.");
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        status: "ACTIVE",
        role: "DELIVERY_STAFF",
      },
    });

    console.log("New DELIVERY_STAFF user created.");
  }

  const existingRider = await prisma.deliveryRider.findUnique({
    where: { userId: user.id },
  });

  let rider;

  if (existingRider) {
    rider = await prisma.deliveryRider.update({
      where: { id: existingRider.id },
      data: {
        name,
        phone,
        isActive: true,
      },
    });

    console.log("Existing rider profile updated.");
  } else {
    rider = await prisma.deliveryRider.create({
      data: {
        userId: user.id,
        name,
        phone,
        isActive: true,
      },
    });

    console.log("Rider profile created.");
  }

  console.log("");
  console.log("======================================");
  console.log(" DELIVERY STAFF ACCOUNT READY");
  console.log("======================================");
  console.log("User ID :", user.id);
  console.log("Rider ID:", rider.id);
  console.log("Name    :", name);
  console.log("Email   :", email);
  console.log("Password:", password);
  console.log("Role    :", user.role);
  console.log("Phone   :", phone);
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.();
  });

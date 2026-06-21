// Bundled imagery lifted from the Foody UI kit (food photography + illustrations).
import type { ImageSourcePropType } from "react-native";

export const illustrations = {
  scooter: require("../../assets/foody/illo-scooter.png") as ImageSourcePropType,
  rider: require("../../assets/foody/illo-rider.png") as ImageSourcePropType,
  cloche: require("../../assets/foody/illo-cloche.png") as ImageSourcePropType,
  receipt: require("../../assets/foody/illo-receipt.png") as ImageSourcePropType,
  pins: require("../../assets/foody/illo-pins.png") as ImageSourcePropType
};

export const foodShots = {
  burger: require("../../assets/foody/food-burger.png") as ImageSourcePropType,
  combo: require("../../assets/foody/food-combo.png") as ImageSourcePropType,
  chicken: require("../../assets/foody/food-chicken.png") as ImageSourcePropType,
  plate: require("../../assets/foody/food-plate.png") as ImageSourcePropType
};

export const categoryShots = {
  fruits: require("../../assets/foody/cat-fruits.png") as ImageSourcePropType,
  dairy: require("../../assets/foody/cat-dairy.png") as ImageSourcePropType,
  bakery: require("../../assets/foody/cat-bakery.png") as ImageSourcePropType,
  snacks: require("../../assets/foody/cat-snacks.png") as ImageSourcePropType,
  veggies: require("../../assets/foody/cat-veggies.png") as ImageSourcePropType,
  drinks: require("../../assets/foody/cat-drinks.png") as ImageSourcePropType
};

// Map a product category to its hero photo (used on product tiles + cards).
export function categoryImage(category: string): ImageSourcePropType {
  switch (category) {
    case "Fruits":
      return categoryShots.fruits;
    case "Dairy":
      return categoryShots.dairy;
    case "Bakery":
      return categoryShots.bakery;
    case "Snacks":
      return categoryShots.snacks;
    default:
      return categoryShots.veggies;
  }
}

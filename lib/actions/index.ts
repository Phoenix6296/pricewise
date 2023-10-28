"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/productmodel";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scrapper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productURL: string) {
  if (!productURL) return;

  try {
    connectToDB();
    const scrappedProduct = await scrapeAmazonProduct(productURL);
    if (!scrappedProduct) return;

    let product = scrappedProduct;

    const existingProduct = await Product.findOne({
      url: scrappedProduct.url,
    });
    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrappedProduct.currentPrice },
      ];

      product = {
        ...scrappedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrappedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct?._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update the product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error: any) {
    throw new Error(`Failed to get product: ${error.message}`);
  }
}

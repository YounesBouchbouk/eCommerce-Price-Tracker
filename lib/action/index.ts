"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { ConnectToDB } from "../mongoose";
import { scapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    ConnectToDB();

    const scrapedProduct = await scapeAmazonProduct(productUrl);
    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({
      url: scrapedProduct.url,
    });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: Number(scrapedProduct.currentPrice) },
      ];
      product = {
        ...product,
        priceHistory: updatedPriceHistory,
        averagePrice: getAveragePrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        lowestPrice: getLowestPrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);

    return product
  } catch (error) {
    throw new Error(`faild to create or update prosuct ${error}`);
  }
}

export async function getProductById(productId: string) {
  try {
    ConnectToDB();

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    ConnectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
}
